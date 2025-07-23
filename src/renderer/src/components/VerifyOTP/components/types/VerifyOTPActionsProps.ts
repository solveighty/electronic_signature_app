export interface VerifyOTPActionsProps {
  resendProps: any;
  resendApi: any;
  isResending: boolean;
  countdown: number;
  handleResendCode: () => void;
  navigate: (path: string) => void;
}