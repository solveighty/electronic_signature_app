import express from 'express';
import { getUserInfo } from '../controllers/userController';

const router = express.Router();

// GET /api/users/:id
router.get('/:id', getUserInfo);

export default router;
