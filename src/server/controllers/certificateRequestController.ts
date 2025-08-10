import { Request, Response } from 'express';
import CertificateRequest from '../models/CertificateRequest';
import { generateP12ForUser } from '../services/p12GeneratorService';
import { storeCertificate } from '../services/crtService';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

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
    return res.status(201).json(request);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error creando solicitud' });
  }
};

export const listPendingCertificateRequests = async (_req: Request, res: Response) => {
  try {
    const list = await CertificateRequest.find({ status: 'pending' }).sort({ createdAt: -1 });
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

    return res.status(200).json({ message: 'Solicitud aprobada', request });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error al aprobar solicitud' });
  }
};

export const rejectCertificateRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const request = await CertificateRequest.findById(id);
    if (!request) return res.status(404).json({ error: 'Solicitud no encontrada' });
    if (request.status !== 'pending') return res.status(400).json({ error: 'Solicitud ya procesada' });

    request.status = 'rejected';
    request.processedAt = new Date();
    await request.save();
    return res.status(200).json({ message: 'Solicitud rechazada', request });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Error al rechazar solicitud' });
  }
};
