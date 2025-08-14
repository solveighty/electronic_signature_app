import { Request, Response } from "express";
import SignatureRequest from "../models/SignatureRequest";
import { getUserById } from "../utils/userService";
import {
  sendSignatureRequestNotification,
  sendSignatureAcceptedNotification,
  sendSignatureRejectedNotification,
} from "../utils/emailService";

// Crear solicitud de firma
export const createSignatureRequest = async (req: Request, res: Response) => {
  try {
    const { documentId, fromUserId, toUserId } = req.body;
    if (!documentId || !fromUserId || !toUserId) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }
    
    const request = await SignatureRequest.create({ documentId, fromUserId, toUserId });
    
    // Get user information for email notification
    const [fromUser, toUser] = await Promise.all([
      getUserById(fromUserId),
      getUserById(toUserId)
    ]);
    
    // Send notification email to recipient
    if (fromUser && toUser) {
      try {
        await sendSignatureRequestNotification({
          email: toUser.email,
          name: toUser.name,
          senderName: fromUser.name,
          documentId: documentId,
        });
      } catch (emailError) {
        console.error('Error sending signature request notification email:', emailError);
        // Continue execution even if email fails
      }
    }
    
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Obtener solicitudes de firma para un usuario
export const getSignatureRequestsForUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const requests = await SignatureRequest.find({ toUserId: userId });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Marcar solicitud como firmada
export const completeSignatureRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const request = await SignatureRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Solicitud no encontrada" });
    
    request.status = "signed";
    request.signedAt = new Date();
    await request.save();
    
    // Get user information for email notification
    const [fromUser, toUser] = await Promise.all([
      getUserById(request.fromUserId),
      getUserById(request.toUserId)
    ]);
    
    // Send notification email to requester
    if (fromUser && toUser) {
      try {
        await sendSignatureAcceptedNotification({
          email: fromUser.email,
          name: fromUser.name,
          recipientName: toUser.name,
          documentId: request.documentId,
        });
      } catch (emailError) {
        console.error('Error sending signature accepted notification email:', emailError);
        // Continue execution even if email fails
      }
    }
    
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// Rechazar solicitud de firma
export const rejectSignatureRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    
    if (!rejectionReason || rejectionReason.trim() === '') {
      return res.status(400).json({ message: "El motivo de rechazo es requerido" });
    }
    
    const request = await SignatureRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Solicitud no encontrada" });
    if (request.status !== 'pending') return res.status(400).json({ message: "Solicitud ya procesada" });
    
    request.status = "rejected";
    request.rejectedAt = new Date();
    request.rejectionReason = rejectionReason.trim();
    await request.save();
    
    // Get user information for email notification
    const [fromUser, toUser] = await Promise.all([
      getUserById(request.fromUserId),
      getUserById(request.toUserId)
    ]);
    
    // Send notification email to requester
    if (fromUser && toUser) {
      try {
        await sendSignatureRejectedNotification({
          email: fromUser.email,
          name: fromUser.name,
          recipientName: toUser.name,
          documentId: request.documentId,
          rejectionReason: request.rejectionReason,
        });
      } catch (emailError) {
        console.error('Error sending signature rejected notification email:', emailError);
        // Continue execution even if email fails
      }
    }
    
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
