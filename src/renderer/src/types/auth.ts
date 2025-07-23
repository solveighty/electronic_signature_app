export type AuthContextType = {
  token: string | null;
  userName: string | null;
  setToken: (token: string | null) => void;
  setUserName: (name: string | null) => void;
};

export interface OTPVerificationData {
  email: string;
  code: string;
}

export interface OTPResendData {
  email: string;
}

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

export interface VerifyOTPFormValues {
  code: string;
}
