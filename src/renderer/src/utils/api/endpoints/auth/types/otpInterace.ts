export interface OTPVerificationResponse {
  message: string;
  user?: {
    id: string;
    email: string;
    name: string;
    verified: boolean;
  };
}

export interface OTPResendResponse {
  message: string;
}