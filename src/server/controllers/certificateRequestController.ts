import { Request, Response } from 'express';
import CertificateRequest from '../models/CertificateRequest';
import { generateP12ForUser } from '../services/p12GeneratorService';
import { storeCertificate } from '../services/crtService';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { getUserById } from '../utils/userService';
import {
  sendCertificateRequestConfirmation,
  sendCertificateApprovedNotification,
  sendCertificateRejectedNotification,
} from '../utils/emailService';

const extractUserIdFromToken = (req: Request): string => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new Error('No autorizado');
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as { id: string };
  return decoded.id;
};

export const submitCertificateRequest = async (req: Request, res: Response) => {
  try {
    const userId = extractUserIdFromToken(req);
    const data = req.body;
    const request = await CertificateRequest.create({ userId, ...data, status: 'pending' });
    
    // Get user information for email notification
    const userInfo = await getUserById(userId);
    
    // Send confirmation email to user
    if (userInfo) {
      try {
        await sendCertificateRequestConfirmation({
          email: userInfo.email,
          name: userInfo.name,
          requestId: request._id.toString(),
        });
      } catch (emailError) {
        console.error('Error sending certificate request confirmation email:', emailError);
        // Continue execution even if email fails
      }
    }
    
    return res.status(201).json(request);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error creando solicitud' });
  }
};

export const listPendingCertificateRequests = async (req: Request, res: Response) => {
  try {
    const userId = extractUserIdFromToken(req);
    
    // Check if user is admin to determine what requests to show
    const userInfo = await getUserById(userId);
    
    let list;
    if (userInfo?.isAdmin) {
      // Admins can see all pending requests
      list = await CertificateRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
    } else {
      // Regular users can see all their own requests (pending, approved, rejected)
      list = await CertificateRequest.find({ userId }).sort({ createdAt: -1 });
    }
    
    return res.status(200).json(list);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error listando solicitudes' });
  }
};

export const approveCertificateRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const request = await CertificateRequest.findById(id);
    if (!request) return res.status(404).json({ error: 'Solicitud no encontrada' });
    if (request.status !== 'pending') return res.status(400).json({ error: 'Solicitud ya procesada' });

    const filename = `cert-${uuidv4()}.p12`;
    const p12Path = await generateP12ForUser({
      userId: request.userId,
      country: request.country,
      state: request.state,
      locality: request.locality,
      organization: request.organization,
      orgUnit: request.orgUnit,
      commonName: request.commonName,
      email: request.email,
      challengePassword: request.challengePassword,
      optionalCompany: request.optionalCompany,
      filename
    });

    const certificateId = await storeCertificate(p12Path, filename, request.userId, request.challengePassword);

    request.status = 'approved';
    request.processedAt = new Date();
    request.certificateId = certificateId;
    await request.save();

    // Get user information for email notification
    const userInfo = await getUserById(request.userId);
    
    // Send approval email to user
    if (userInfo) {
      try {
        await sendCertificateApprovedNotification({
          email: userInfo.email,
          name: userInfo.name,
          commonName: request.commonName,
        });
      } catch (emailError) {
        console.error('Error sending certificate approved notification email:', emailError);
        // Continue execution even if email fails
      }
    }

    return res.status(200).json({ message: 'Solicitud aprobada', request });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error al aprobar solicitud' });
  }
};

export const rejectCertificateRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    const request = await CertificateRequest.findById(id);
    if (!request) return res.status(404).json({ error: 'Solicitud no encontrada' });
    if (request.status !== 'pending') return res.status(400).json({ error: 'Solicitud ya procesada' });

    // Validate rejection reason is provided
    if (!rejectionReason || rejectionReason.trim() === '') {
      return res.status(400).json({ error: 'El motivo de rechazo es requerido' });
    }

    request.status = 'rejected';
    request.processedAt = new Date();
    request.rejectionReason = rejectionReason.trim();
    await request.save();

    // Get user information for email notification
    const userInfo = await getUserById(request.userId);
    
    // Send rejection email to user
    if (userInfo) {
      try {
        await sendCertificateRejectedNotification({
          email: userInfo.email,
          name: userInfo.name,
          commonName: request.commonName,
          rejectionReason: request.rejectionReason,
        });
      } catch (emailError) {
        console.error('Error sending certificate rejected notification email:', emailError);
        // Continue execution even if email fails
      }
    }
    
    return res.status(200).json({ message: 'Solicitud rechazada', request });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error al rechazar solicitud' });
  }
};
