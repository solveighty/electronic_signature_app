export interface RecoverPasswordRequestFormProps {
  form: any;
  loading: boolean;
  onSubmit: (values: { email: string }) => void;
  onBackToLogin: () => void;
}