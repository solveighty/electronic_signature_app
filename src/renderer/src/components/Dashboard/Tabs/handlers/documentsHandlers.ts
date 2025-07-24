import { toast } from 'react-toastify';

export const handleDeletePdf = async (
  documentId: string,
  setDeletingDocs: React.Dispatch<React.SetStateAction<{ [id: string]: boolean }>>,
  logic: any
) => {
  setDeletingDocs(prev => ({ ...prev, [documentId]: true }));
  await logic.deletePdf(documentId);
  setDeletingDocs(prev => ({ ...prev, [documentId]: false }));
};

export const handleDownloadCertificate = async (
  selectedCertId: string | null,
  password: string,
  logic: any,
  setPasswordModalOpen: (open: boolean) => void,
  setPassword: (password: string) => void,
  setSelectedCertId: (id: string | null) => void
) => {
  if (selectedCertId && password) {
    const url = await logic.getCertificateUrl(selectedCertId, password);
    if (url === 'invalid-password') {
      toast.error('Contraseña incorrecta. Por favor, verifica e intenta nuevamente.');
      return;
    }
    if (url) {
      window.open(url, '_blank');
      setPasswordModalOpen(false);
      setPassword('');
      setSelectedCertId(null);
    } else {
      toast.error('No se pudo obtener el certificado. Por favor, verifica tus credenciales e intenta nuevamente.');
    }
  }
};