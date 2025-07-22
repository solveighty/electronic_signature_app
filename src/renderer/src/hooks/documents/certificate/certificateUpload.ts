import { toast } from 'react-toastify';
import { uploadCertificate as uploadCertificateApi, updateCertificate as updateCertificateApi } from '../../../utils/api';
import { fetchUserCertificate } from './fetchUserCertificate';
import { Document } from '../useDocumentManager';

export const certificateUpload = async (
  file: File,
  password: string,
  certificateFile: Document | null,
  setCertificateFile: (cert: Document | null) => void,
  setDocuments: (fn: (docs: Document[]) => Document[]) => void,
  setIsLoadingCertificate: (loading: boolean) => void,
  setIsLoadingDocuments: (loading: boolean) => void,
  setError: (err: string | null) => void
): Promise<boolean> => {
  // Validar si es p12
  if (!file.name.endsWith('.p12') && file.type !== "application/x-pkcs12") {
    toast.error("Solo se permiten archivos P12");
    return false;
  }

  setIsLoadingCertificate(true);
  setError(null);

  // Mostrar mensaje apropiado según si es actualización o nueva carga
  const toastId = toast.info(
    certificateFile
      ? 'Actualizando certificado...'
      : 'Subiendo certificado...',
    { autoClose: false }
  );

  try {
    // Usar la API adecuada según si ya existe un certificado
    const response = certificateFile
      ? await updateCertificateApi(file, password)
      : await uploadCertificateApi(file, password);

    const newCertificate = {
      id: response.data.certificateId || Date.now(),
      name: file.name,
      type: 'p12' as const,
      status: "Certificado disponible",
      createdAt: new Date()
    };

    setCertificateFile(newCertificate);

    // Eliminar el certificado anterior y agregar el nuevo
    setDocuments(prevDocs => [
      ...prevDocs.filter(doc => doc.type !== 'p12'),
      newCertificate
    ]);

    // Hacer una actualización completa después de subir
    await fetchUserCertificate(setCertificateFile, setDocuments, setIsLoadingDocuments);

    toast.update(toastId, {
      render: certificateFile
        ? 'Certificado actualizado correctamente'
        : 'Certificado subido correctamente',
      type: 'success',
      autoClose: 5000
    });

    setIsLoadingCertificate(false);
    return true;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || "Error al procesar el certificado";
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