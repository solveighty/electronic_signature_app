import { toast } from 'react-toastify';
import { deleteCertificate as deleteCertificateApi } from '../../../../utils/api/api';
import { fetchUserCertificate } from './fetchUserCertificate';
import { Document } from '../../../../types/document';

export const deleteCertificateHandler = async (
  certificateFile: Document | null,
  setCertificateFiles: (certs: Document[]) => void,
  setDocuments: (fn: (docs: Document[]) => Document[]) => void,
  setIsLoadingCertificate: (loading: boolean) => void,
  setIsLoadingDocuments: (loading: boolean) => void,
  setError: (err: string | null) => void
): Promise<boolean> => {
  if (!certificateFile) {
    toast.error("No hay certificado para eliminar");
    return false;
  }

  setIsLoadingCertificate(true);
  setError(null);

  const toastId = toast.info('Eliminando certificado...', {
    autoClose: false,
    closeButton: false
  });

  try {
    await deleteCertificateApi();

    setCertificateFiles([]);
    setDocuments(prevDocs => prevDocs.filter(doc => doc.type !== 'p12'));

    await fetchUserCertificate(setCertificateFiles, setDocuments, setIsLoadingDocuments);

    toast.update(toastId, {
      render: 'Certificado eliminado correctamente',
      type: 'success',
      autoClose: 5000
    });

    setIsLoadingCertificate(false);
    return true;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || "Error al eliminar el certificado";
    setError(errorMessage);

    toast.update(toastId, {
      render: `Error: ${errorMessage}`,
      type: 'error',
      autoClose: 5000
    });

    setIsLoadingCertificate(false);
    return false;
  }
};