import api from "../../config/axiosConfig";
import { OTPVerificationResponse, OTPResendResponse} from "./types/otpInterace";

// Login
export function login(email: string, password: string) {
  return api.post("/api/auth/login", { email, password });
}

// Register
export function register(name: string, email: string, password: string) {
  return api.post("/api/auth/register", { name, email, password });
}

// Verify OTP
export function verifyOTP(
  email: string,
  code: string,
  password: string
): Promise<{ data: OTPVerificationResponse }> {
  return api.post("/api/auth/register/verify", {
    email,
    verificationCode: code,
    password,
  });
}

// Resend OTP
export function resendOTP(email: string): Promise<{ data: OTPResendResponse }> {
  return api.post("/api/auth/register/resend", { email });
}

// Request Password Reset
export function requestPasswordReset(email: string) {
  return api.post("/api/auth/password/request-reset", { email });
}

// Reset Password
export function resetPassword(
  email: string,
  resetCode: string,
  newPassword: string
) {
  return api.post("/api/auth/password/reset", {
    email,
    resetCode,
    newPassword,
  });
}

// Token interceptor
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};
