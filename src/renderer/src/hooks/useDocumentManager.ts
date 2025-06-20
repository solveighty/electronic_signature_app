import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { uploadPdfDocument as uploadPdfApi, uploadCertificate as uploadCertificateApi, getUserDocuments, updateCertificate as updateCertificateApi, getUserCertificate } from '../utils/api';
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
      fetchUserCertificate();
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

  const fetchUserCertificate = async () => {
    try {
      setIsLoadingDocuments(true);
      const response = await getUserCertificate();
      
      if (response.data && response.data.certificate) {
        const cert = response.data.certificate;
        setCertificateFile({
          id: cert._id,
          name: cert.fileName,
          type: 'p12',
          status: "Certificado disponible",
          createdAt: new Date(cert.createdAt)
        });
        
        // También agregar a la lista general de documentos
        setDocuments(prevDocs => {
          // Filtrar certificados existentes
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
      }
    } catch (error) {
      console.error('Error al cargar certificado:', error);
      // No mostrar toast de error para no molestar al usuario
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

  // Método para manejar certificados P12
  const handleCertificateUpload = async (file: File): Promise<boolean> => {
    // Validar si es p12
    if (!file.name.endsWith('.p12') && file.type !== "application/x-pkcs12") {
      toast.error("Solo se permiten archivos P12");
      return false;
    }

    setIsLoading(true);
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
        ? await updateCertificateApi(file) 
        : await uploadCertificateApi(file);

      const newCertificate = {
        id: response.data.certificateId || Date.now(),
        name: file.name,
        type: 'p12' as const,
        status: "Certificado disponible",
        createdAt: new Date()
      };

      setCertificateFile(newCertificate);
      
      // Eliminar el certificado anterior (si existe) y agregar el nuevo
      setDocuments(prevDocs => [
        ...prevDocs.filter(doc => doc.type !== 'p12'), 
        newCertificate
      ]);
      
      toast.update(toastId, {
        render: certificateFile 
          ? 'Certificado actualizado correctamente' 
          : 'Certificado subido correctamente',
        type: 'success',
        autoClose: 5000
      });
      
      setIsLoading(false);
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || "Error al procesar el certificado";
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'pdf' | 'p12'): Promise<boolean> => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (fileType === 'pdf') {
        return await uploadPdf(file);
      } else if (fileType === 'p12') {
        return await handleCertificateUpload(file);
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
    handleCertificateUpload, // Exportamos el método unificado
    handleFileChange,
    refreshDocuments: fetchUserDocuments,
    hasCertificate: !!certificateFile // Helper para verificar si ya tiene un certificado
  };
};