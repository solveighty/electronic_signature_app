export interface SignaturePreviewModalProps {
  opened: boolean;
  onClose: () => void;
  signaturePosition: { page: string; x: string; y: string };
}