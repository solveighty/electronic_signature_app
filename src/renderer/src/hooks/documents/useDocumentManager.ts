import { useState, useEffect } from "react";
import { getPdfDocumentUrl } from "../../utils/api/api";
import { useAuth } from "../../context/AuthContext";
import { fetchUserDocuments } from "./pdf/crud/fetchUserDocuments";
import { uploadPdf } from "./pdf/crud/uploadPdf";
import { deletePdf } from "./pdf/crud/deletePdf";
import { fetchUserCertificate } from "./certificate/crud/fetchUserCertificate";
import { certificateUpload } from "./certificate/crud/certificateUpload";
import { deleteCertificateHandler } from "./certificate/crud/deleteCertificate";
import { handleFileChange as handleFileChangeExternal } from "./event/handleFileChange";
import { loadUserDocuments as loadUserDocumentsExternal } from "./pdf/crud/loadUserDocuments";
import { Document } from "../../types/document";

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
    await loadUserDocumentsExternal(
      setPdfDocuments,
      setDocuments,
      setIsLoadingDocuments
    );
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
    return await handleFileChangeExternal(
      e,
      fileType,
      uploadPdfHandler,
      handleCertificateUpload,
      password
    );
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
