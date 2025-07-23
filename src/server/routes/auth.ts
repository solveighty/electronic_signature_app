import express from "express";
import {
  login,
  register,
  verifyRegistration,
  resendVerificationCode,
  requestPasswordReset,
  resetPassword,
} from "../controllers/authController";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/register/verify", verifyRegistration);
router.post("/register/resend", resendVerificationCode);

// Password recovery endpoints
router.post("/password/request-reset", requestPasswordReset);
router.post("/password/reset", resetPassword);

export default router;
