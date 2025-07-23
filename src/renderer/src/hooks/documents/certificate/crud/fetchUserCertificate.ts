import { getUserCertificate } from "../../../../utils/api/api";
import { Document } from '../../../../types/document';

export const fetchUserCertificate = async (
  setCertificateFiles: (certs: Document[]) => void,
  setDocuments: (fn: (docs: Document[]) => Document[]) => void,
  setIsLoadingDocuments: (loading: boolean) => void
) => {
  try {
    setIsLoadingDocuments(true);
    const response = await getUserCertificate();

    if (response.data && Array.isArray(response.data.certificates)) {
      const certs = response.data.certificates.map((cert: any) => ({
        id: cert._id,
        name: cert.fileName,
        type: "p12",
        status: "Certificado disponible",
        createdAt: cert.createdAt ? new Date(cert.createdAt) : undefined,
      }));
      setCertificateFiles(certs);

      setDocuments((prevDocs) => {
        const docsWithoutCerts = prevDocs.filter((doc) => doc.type !== "p12");
        return [...docsWithoutCerts, ...certs];
      });
    } else {
      setCertificateFiles([]);
      setDocuments((prevDocs) => prevDocs.filter((doc) => doc.type !== "p12"));
    }
  } catch (error) {
    console.error("Error al cargar certificados:", error);
    setCertificateFiles([]);
  } finally {
    setIsLoadingDocuments(false);
  }
};