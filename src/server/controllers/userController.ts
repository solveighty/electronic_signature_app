import { Request, Response } from 'express';
import { getUserById } from '../utils/userService';

export const getUserInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await getUserById(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error obteniendo usuario' });
  }
};
