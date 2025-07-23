export interface RecoverPasswordResetFormProps {
  form: any;
  loading: boolean;
  email: string;
  onSubmit: (values: { resetCode: string; newPassword: string }) => void;
  onBackToRequest: () => void;
  onBackToLogin: () => void;
}