export interface DeleteCertificateModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  logic: any;
  selectedCertId: string | null;
}