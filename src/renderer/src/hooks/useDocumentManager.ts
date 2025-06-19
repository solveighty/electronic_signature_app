import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { uploadPdfDocument as uploadPdfApi, uploadCertificate as uploadCertificateApi, getUserDocuments } from '../utils/api';
import { useAuth } from '../context/AuthContext';

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  // Cargar documentos existentes cuando se monta el componente
  useEffect(() => {
    if (token) {
      fetchUserDocuments();
    }
  }, [token]);

  // Función para cargar documentos del usuario
  const fetchUserDocuments = async () => {
    setIsLoadingDocuments(true);
    try {
      const response = await getUserDocuments();
      
      const fetchedDocuments = response.data.documents.map((doc: any) => ({
        id: doc._id,
        name: doc.fileName,
        type: 'pdf' as const,
        status: doc.status,
        createdAt: new Date(doc.createdAt)
      }));
      
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

  // subir archivos PDF
  const uploadPdf = async (file: File): Promise<boolean> => {
    if (file.type !== "application/pdf") {
      toast.error("Solo se permiten archivos PDF");
      return false;
    }

    setIsLoading(true);
    setError(null);
    
    // Crear ID temporal para seguimiento
    const tempId = `temp-${Date.now()}`;
    
    // Agregar documento con estado "Subiendo..." inmediatamente para mejorar UX
    const tempDoc = {
      id: tempId,
      name: file.name,
      type: 'pdf' as const,
      status: "Subiendo...",
      createdAt: new Date()
    };
    
    setPdfDocuments(prevDocs => [tempDoc, ...prevDocs]);
    setDocuments(prevDocs => [tempDoc, ...prevDocs]);
    
    // Crear el toast con ID para poder actualizarlo
    const toastId = toast.info('Subiendo archivo...', {
      autoClose: false,
      closeButton: false
    });
    
    try {
      // Inicia la carga y devuelve rápido (incluso si no termina completamente)
      const uploadPromise = uploadPdfApi(file);
      
      // Tiempo de espera corto para dar oportunidad a que la carga comience
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar el toast
      toast.update(toastId, { 
        render: 'Procesando el documento...',
        type: 'info'
      });
      
      // Iniciar sondeo para verificar si el documento ya está disponible
      let documentFound = false;
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!documentFound && attempts < maxAttempts) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos entre intentos
        
        try {
          // Buscar documentos recientes para ver si el nuevo está disponible
          const response = await getUserDocuments();
          const fetchedDocs = response.data.documents || [];
          
          // Buscar un documento con el mismo nombre que acabamos de subir
          const foundDoc = fetchedDocs.find((doc: any) => doc.fileName === file.name);
          
          if (foundDoc) {
            documentFound = true;
            
            // Reemplazar documento temporal con el real
            const newDoc = {
              id: foundDoc._id,
              name: foundDoc.fileName,
              type: 'pdf' as const,
              status: foundDoc.status,
              createdAt: new Date(foundDoc.createdAt)
            };
            
            setPdfDocuments(prevDocs => 
              prevDocs.map(doc => doc.id === tempId ? newDoc : doc)
            );
            setDocuments(prevDocs => 
              prevDocs.map(doc => doc.id === tempId ? newDoc : doc)
            );
            
            toast.update(toastId, {
              render: 'Documento subido correctamente',
              type: 'success',
              autoClose: 5000
            });
          }
        } catch (err) {
          console.log('Error al verificar documentos:', err);
          // Continuar intentando...
        }
      }
      
      if (!documentFound) {
        // Si después de todos los intentos no encontramos el documento,
        // asumimos que hubo un error o está tomando demasiado tiempo
        setPdfDocuments(prevDocs => prevDocs.filter(doc => doc.id !== tempId));
        setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== tempId));
        
        toast.update(toastId, {
          render: 'No se pudo confirmar la subida del documento',
          type: 'warning',
          autoClose: 5000
        });
      }
      
      setIsLoading(false);
      return documentFound;
    } catch (error: any) {
      console.error('Error al subir PDF:', error);
      
      // Eliminar el documento temporal en caso de error
      setPdfDocuments(prevDocs => prevDocs.filter(doc => doc.id !== tempId));
      setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== tempId));
      
      const errorMessage = error.response?.data?.error || error.message || "Error al subir el archivo PDF";
      setError(errorMessage);
      
      toast.update(toastId, {
        render: `Error: ${errorMessage}`,
        type: 'error',
        autoClose: 5000
      });
      
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
    isLoadingDocuments,
    error,
    uploadPdf,
    uploadCertificateFile,
    handleFileChange,
    refreshDocuments: fetchUserDocuments
  };
};