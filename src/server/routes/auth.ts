import express from "express";
import {
  login,
  register,
  verifyRegistration,
  resendVerificationCode,
} from "../controllers/authController";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/register/verify", verifyRegistration);
router.post("/register/resend", resendVerificationCode);

export default router;
