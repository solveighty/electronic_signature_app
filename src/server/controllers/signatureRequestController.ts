import { Request, Response } from "express";
import SignatureRequest from "../models/SignatureRequest";

// Crear solicitud de firma
export const createSignatureRequest = async (req: Request, res: Response) => {
  try {
    const { documentId, fromUserId, toUserId } = req.body;
    if (!documentId || !fromUserId || !toUserId) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }
    const request = await SignatureRequest.create({ documentId, fromUserId, toUserId });
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
    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
