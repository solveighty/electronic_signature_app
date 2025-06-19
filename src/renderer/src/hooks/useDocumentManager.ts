import { useState } from 'react';
import { toast } from 'react-toastify';
import { uploadPdfDocument as uploadPdfApi, uploadCertificate as uploadCertificateApi } from '../utils/api';

export interface Document {
  id: number;
  name: string;
  type: 'pdf' | 'p12';
  status: string;
}

export const useDocumentManager = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [pdfDocuments, setPdfDocuments] = useState<Document[]>([]);
  const [certificateFile, setCertificateFile] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // subir archivos PDF
  const uploadPdf = async (file: File): Promise<boolean> => {
    // validar si es pdf
    if (file.type !== "application/pdf") {
      toast.error("Solo se permiten archivos PDF");
      return false;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await uploadPdfApi(file);

      const newDoc = {
        id: Date.now(),
        name: file.name,
        type: 'pdf' as const,
        status: "Pendiente de firma",
      };

      setPdfDocuments(prevDocs => [...prevDocs, newDoc]);
      setDocuments(prevDocs => [...prevDocs, newDoc]);
      
      toast.success("Archivo PDF subido correctamente");
      setIsLoading(false);
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Error al subir el archivo PDF";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  // subir archivos P12
  const uploadCertificateFile = async (file: File): Promise<boolean> => {
    // validar si es p12
    if (!file.name.endsWith('.p12') && file.type !== "application/x-pkcs12") {
        toast.error("Solo se permiten archivos P12");
        return false;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await uploadCertificateApi(file);

      const newCertificate = {
        id: Date.now(),
        name: file.name,
        type: 'p12' as const,
        status: "Certificado disponible",
      };

      setCertificateFile(newCertificate);
      setDocuments(prevDocs => [...prevDocs.filter(doc => doc.type !== 'p12'), newCertificate]);
      
      toast.success("Certificado P12 subido correctamente");
      setIsLoading(false);
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Error al subir el certificado";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'pdf' | 'p12'): Promise<boolean> => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (fileType === 'pdf') {
        return await uploadPdf(file);
      } else if (fileType === 'p12') {
        return await uploadCertificateFile(file);
      }
    }
    return false;
  };

  return {
    documents,
    pdfDocuments,
    certificateFile,
    isLoading,
    error,
    uploadPdf,
    uploadCertificateFile,
    handleFileChange
  };
};