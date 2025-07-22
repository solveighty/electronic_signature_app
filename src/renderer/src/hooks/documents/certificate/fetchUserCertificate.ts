import { getUserCertificate } from '../../../utils/api';
import { Document } from '../useDocumentManager';

export const fetchUserCertificate = async (
  setCertificateFile: (cert: Document | null) => void,
  setDocuments: (fn: (docs: Document[]) => Document[]) => void,
  setIsLoadingDocuments: (loading: boolean) => void
) => {
  try {
    setIsLoadingDocuments(true);
    const response = await getUserCertificate();

    if (response.data && response.data.certificate) {
      const cert = response.data.certificate;
      const certDoc: Document = {
        id: cert._id,
        name: cert.fileName,
        type: 'p12',
        status: "Certificado disponible",
        createdAt: new Date(cert.createdAt)
      };
      setCertificateFile(certDoc);

      setDocuments(prevDocs => {
        const docsWithoutCerts = prevDocs.filter(doc => doc.type !== 'p12');
        return [...docsWithoutCerts, certDoc];
      });
    } else {
      setCertificateFile(null);
      setDocuments(prevDocs => prevDocs.filter(doc => doc.type !== 'p12'));
    }
  } catch (error) {
    console.error('Error al cargar certificado:', error);
    setCertificateFile(null);
  } finally {
    setIsLoadingDocuments(false);
  }
};