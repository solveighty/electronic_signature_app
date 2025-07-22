import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  uploadPdfDocument as uploadPdfApi,
  uploadCertificate as uploadCertificateApi,
  getUserDocuments,
  updateCertificate as updateCertificateApi,
  getUserCertificate,
  deleteCertificate as deleteCertificateApi,
  deletePdfDocument as deletePdfDocumentApi,
  getPdfDocumentUrl
} from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { fetchUserDocuments } from './pdf/fetchUserDocuments';
import { uploadPdf } from './pdf/uploadPdf';
import { deletePdf } from './pdf/deletePdf';

export interface Document {
  id: number | string;
  name: string;
  type: 'pdf' | 'p12';
  status: string;
  createdAt?: Date;
}

export const useDocumentManager = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pdfDocuments, setPdfDocuments] = useState<Document[]>([]);
  const [certificateFile, setCertificateFile] = useState<Document | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [isLoadingCertificate, setIsLoadingCertificate] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // Cargar documentos existentes cuando se monta el componente
  useEffect(() => {
    if (token) {
      fetchUserDocuments();
      fetchUserCertificate();
    }
  }, [token]);

  // Función para cargar documentos del usuario
  const loadUserDocuments = async () => {
    setIsLoadingDocuments(true);
    try {
      const fetchedDocuments = await fetchUserDocuments();
      setPdfDocuments(fetchedDocuments);
      setDocuments([...fetchedDocuments]);
    } catch (error: any) {
      console.error('Error al cargar documentos:', error);
      const errorMessage = error.response?.data?.error || error.message || "Error al cargar documentos";
      toast.error(errorMessage);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const fetchUserCertificate = async () => {
    try {
      setIsLoadingDocuments(true);
      const response = await getUserCertificate();

      let hasCert = false;

      if (response.data && response.data.certificate) {
        const cert = response.data.certificate;
        setCertificateFile({
          id: cert._id,
          name: cert.fileName,
          type: 'p12',
          status: "Certificado disponible",
          createdAt: new Date(cert.createdAt)
        });

        // Actualizar la lista general de documentos
        setDocuments(prevDocs => {
          const docsWithoutCerts = prevDocs.filter(doc => doc.type !== 'p12');
          return [
            ...docsWithoutCerts,
            {
              id: cert._id,
              name: cert.fileName,
              type: 'p12',
              status: "Certificado disponible",
              createdAt: new Date(cert.createdAt)
            }
          ];
        });

        hasCert = true;
      } else {
        // Si no hay certificado, asegurarse de que certificateFile sea null
        setCertificateFile(null);
        // Eliminar certificados de la lista general
        setDocuments(prevDocs => prevDocs.filter(doc => doc.type !== 'p12'));

        hasCert = false;
      }

    } catch (error) {
      console.error('Error al cargar certificado:', error);
      // Asegurarse de resetear el estado en caso de error
      setCertificateFile(null);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  // subir archivos PDF
  const uploadPdfHandler = async (file: File): Promise<boolean> => {
    return await uploadPdf(
      file,
      setPdfDocuments,
      setDocuments,
      setIsLoadingPdf,
      setError
    );
  };

  // Método para manejar certificados P12
  const handleCertificateUpload = async (file: File, password: string): Promise<boolean> => {
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
      await fetchUserCertificate();

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>,
    fileType: 'pdf' | 'p12',
    password?: string
  ): Promise<boolean> => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (fileType === 'pdf') {
        return await uploadPdfHandler(file);
      } else if (fileType === 'p12') {
        if (!password) {
          toast.error("Se requiere una contraseña para el certificado P12");
          return false;
        }
        return await handleCertificateUpload(file, password);
      }
    }
    return false;
  };

  // Función para eliminar un certificado
  const deleteCertificate = async (): Promise<boolean> => {
    if (!certificateFile) {
      toast.error("No hay certificado para eliminar");
      return false;
    }

    setIsLoadingCertificate(true);
    setError(null);

    // Mostrar toast de información
    const toastId = toast.info('Eliminando certificado...', {
      autoClose: false,
      closeButton: false
    });

    try {
      // Llamar al endpoint de eliminación
      await deleteCertificateApi();

      // Actualizar el estado local
      setCertificateFile(null);
      setDocuments(prevDocs => prevDocs.filter(doc => doc.type !== 'p12'));

      // Hacer una actualización completa después de eliminar
      await fetchUserCertificate();

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

  // Función para eliminar un documento PDF
  const deletePdfHandler = async (documentId: string): Promise<boolean> => {
    return await deletePdf(
      documentId,
      pdfDocuments,
      setPdfDocuments,
      setDocuments,
      setIsLoadingPdf,
      setError
    );
  };

  return {
    documents,
    pdfDocuments,
    certificateFile,
    isLoading,
    isLoadingPdf,
    isLoadingCertificate,
    isLoadingDocuments,
    error,
    uploadPdf: uploadPdfHandler,
    handleCertificateUpload,
    handleFileChange,
    refreshDocuments: loadUserDocuments,
    refreshCertificate: fetchUserCertificate,
    hasCertificate: !!certificateFile,
    deleteCertificate,
    deletePdf: deletePdfHandler,
    getPdfDocumentUrl
  };
};