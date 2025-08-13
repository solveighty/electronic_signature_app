import supabase from "../utils/supabase";
import ensureUserMongoExists from "../services/userMongoService";
// GET /users
export const getAllNonAdminUsers = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, isAdmin")
      .eq("isAdmin", false);
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ message: error.message });
    }
    res.status(200).json({ users: data });
  } catch (error) {
    console.error('Catch error:', error);
    res.status(500).json({ message: (error as Error).message || "Error de servidor" });
  }
};
// GET /friends/:id
export const getFriendsAndRequests = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "id es requerido" });
    }
  // Ensure the Mongo mirror exists for the user
  await ensureUserMongoExists(id);
    const user = await UserMongo.findOne({ id });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json({
      friends: user.friends,
      friendRequestsSent: user.friendRequestsSent,
      friendRequestsReceived: user.friendRequestsReceived,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message || "Error de servidor" });
  }
};
// POST /friend-request/accept
export const acceptFriendRequest = async (req: Request, res: Response) => {
  try {
    const { fromId, toId } = req.body; // fromId: quien envió la solicitud, toId: quien la acepta
    if (!fromId || !toId) {
      return res.status(400).json({ message: "fromId y toId son requeridos" });
    }
  // Ensure both Mongo mirrors exist
  await ensureUserMongoExists(fromId);
  await ensureUserMongoExists(toId);
    // Buscar ambos usuarios
    const fromUser = await UserMongo.findOne({ id: fromId });
    const toUser = await UserMongo.findOne({ id: toId });
    if (!fromUser || !toUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    // Verificar que exista la solicitud
    if (!toUser.friendRequestsReceived.includes(fromId) || !fromUser.friendRequestsSent.includes(toId)) {
      return res.status(400).json({ message: "No existe una solicitud pendiente" });
    }
    // Ya son amigos
    if (toUser.friends.includes(fromId)) {
      return res.status(400).json({ message: "Ya son amigos" });
    }
    // Eliminar solicitud
    toUser.friendRequestsReceived = toUser.friendRequestsReceived.filter(id => id !== fromId);
    fromUser.friendRequestsSent = fromUser.friendRequestsSent.filter(id => id !== toId);
    // Agregar a amigos
    toUser.friends.push(fromId);
    fromUser.friends.push(toId);
    await toUser.save();
    await fromUser.save();
    res.status(200).json({ message: "Solicitud de amistad aceptada" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message || "Error de servidor" });
  }
};
import { Request, Response } from "express";
import UserMongo from "../models/UserMongo";

// POST /friend-request
export const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const { fromId, toId } = req.body; // ambos son id de Supabase
    if (!fromId || !toId) {
      return res.status(400).json({ message: "fromId y toId son requeridos" });
    }
    if (fromId === toId) {
      return res.status(400).json({ message: "No puedes enviarte solicitud a ti mismo" });
    }
  // Ensure both Mongo mirrors exist
  await ensureUserMongoExists(fromId);
  await ensureUserMongoExists(toId);
    // Buscar ambos usuarios en Mongo
    const fromUser = await UserMongo.findOne({ id: fromId });
    const toUser = await UserMongo.findOne({ id: toId });
    if (!fromUser || !toUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    // Ya son amigos
    if (fromUser.friends.includes(toId)) {
      return res.status(400).json({ message: "Ya son amigos" });
    }
    // Ya hay solicitud pendiente
    if (fromUser.friendRequestsSent.includes(toId) || toUser.friendRequestsReceived.includes(fromId)) {
      return res.status(400).json({ message: "Ya existe una solicitud pendiente" });
    }
    // Agregar solicitud
    fromUser.friendRequestsSent.push(toId);
    toUser.friendRequestsReceived.push(fromId);
    await fromUser.save();
    await toUser.save();
    res.status(200).json({ message: "Solicitud de amistad enviada" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message || "Error de servidor" });
  }
};
