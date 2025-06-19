import { useState } from 'react';
import { toast } from 'react-toastify';

export interface Document {
  id: number;
  name: string;
  status: string;
}

export const useDocumentManager = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const uploadDocument = async (file: File): Promise<boolean> => {
    // Validación en frontend: solo PDF
    if (file.type !== "application/pdf") {
      toast.error("Solo se permiten archivos PDF");
      return false;
    }

    setIsLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:3000/api/uploads", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al subir archivo");
      }

      setDocuments((prevDocs) => [
        ...prevDocs,
        {
          id: Date.now(),
          name: result.file.originalname,
          status: "Pendiente de firma",
        },
      ]);
      
      toast.success("Archivo subido correctamente");
      setIsLoading(false);
      return true;
    } catch (error: any) {
      const errorMessage = error.message || "Error al subir el archivo";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<boolean> => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      return await uploadDocument(file);
    }
    return false;
  };

  return {
    documents,
    isLoading,
    error,
    uploadDocument,
    handleFileChange
  };
};