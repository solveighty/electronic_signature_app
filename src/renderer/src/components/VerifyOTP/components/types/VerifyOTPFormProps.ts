export interface VerifyOTPFormProps {
  form: any;
  isLoading: boolean;
  verifyProps: any;
  verifyApi: any;
  handleSubmit: (values: any) => void;
  handleOTPChange: (value: string) => void;
}