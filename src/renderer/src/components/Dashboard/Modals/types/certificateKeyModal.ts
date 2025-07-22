export interface CertificateKeyModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  value: string;
  onChange: (value: string) => void;
  onCancel: () => void;
}