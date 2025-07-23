import api from "../../config/axiosConfig";

interface OTPVerificationResponse {
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
    verified: boolean;
  };
}

interface OTPResendResponse {
  message: string;
}

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

// Token interceptor
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};
