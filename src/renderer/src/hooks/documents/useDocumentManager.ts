import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getPdfDocumentUrl } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { fetchUserDocuments } from "./pdf/fetchUserDocuments";
import { uploadPdf } from "./pdf/uploadPdf";
import { deletePdf } from "./pdf/deletePdf";
import { fetchUserCertificate } from "./certificate/fetchUserCertificate";
import { certificateUpload } from "./certificate/certificateUpload";
import { deleteCertificateHandler } from "./certificate/deleteCertificate";

export interface Document {
  id: number | string;
  name: string;
  type: "pdf" | "p12";
  status: string;
  createdAt?: Date;
}

export const useDocumentManager = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pdfDocuments, setPdfDocuments] = useState<Document[]>([]);
  const [certificateFile, setCertificateFile] = useState<Document | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [isLoadingCertificate, setIsLoadingCertificate] =
    useState<boolean>(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // Cargar documentos existentes cuando se monta el componente
  useEffect(() => {
    if (token) {
      fetchUserDocuments();
      fetchUserCertificateHandler();
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
      console.error("Error al cargar documentos:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Error al cargar documentos";
      toast.error(errorMessage);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const fetchUserCertificateHandler = async () => {
    await fetchUserCertificate(
      setCertificateFile,
      setDocuments,
      setIsLoadingDocuments
    );
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
  const handleCertificateUpload = async (
    file: File,
    password: string
  ): Promise<boolean> => {
    return await certificateUpload(
      file,
      password,
      certificateFile,
      setCertificateFile,
      setDocuments,
      setIsLoadingCertificate,
      setIsLoadingDocuments,
      setError
    );
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: "pdf" | "p12",
    password?: string
  ): Promise<boolean> => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (fileType === "pdf") {
        return await uploadPdfHandler(file);
      } else if (fileType === "p12") {
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
    return await deleteCertificateHandler(
      certificateFile,
      setCertificateFile,
      setDocuments,
      setIsLoadingCertificate,
      setIsLoadingDocuments,
      setError
    );
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
    isLoadingPdf,
    isLoadingCertificate,
    isLoadingDocuments,
    error,
    uploadPdf: uploadPdfHandler,
    handleCertificateUpload,
    handleFileChange,
    refreshDocuments: loadUserDocuments,
    refreshCertificate: fetchUserCertificateHandler,
    hasCertificate: !!certificateFile,
    deleteCertificate,
    deletePdf: deletePdfHandler,
    getPdfDocumentUrl,
  };
};
