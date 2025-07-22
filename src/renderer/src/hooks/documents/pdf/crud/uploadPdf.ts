import { uploadPdfDocument as uploadPdfApi, getUserDocuments } from '../../../../utils/api';
import { toast } from 'react-toastify';
import { Document } from '../../../../types/document';

export const uploadPdf = async (
  file: File,
  setPdfDocuments: (fn: (docs: Document[]) => Document[]) => void,
  setDocuments: (fn: (docs: Document[]) => Document[]) => void,
  setIsLoadingPdf: (loading: boolean) => void,
  setError: (error: string | null) => void
): Promise<boolean> => {
  if (file.type !== "application/pdf") {
    toast.error("Solo se permiten archivos PDF");
    return false;
  }

  setIsLoadingPdf(true);
  setError(null);

  const tempId = `temp-${Date.now()}`;
  const tempDoc: Document = {
    id: tempId,
    name: file.name,
    type: 'pdf',
    status: "Subiendo...",
    createdAt: new Date()
  };

  setPdfDocuments(prevDocs => [tempDoc, ...prevDocs]);
  setDocuments(prevDocs => [tempDoc, ...prevDocs]);

  const toastId = toast.info('Subiendo archivo...', {
    autoClose: false,
    closeButton: false
  });

  try {
    const uploadPromise = uploadPdfApi(file);
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.update(toastId, {
      render: 'Procesando el documento...',
      type: 'info'
    });

    let documentFound = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!documentFound && attempts < maxAttempts) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        const response = await getUserDocuments();
        const fetchedDocs = response.data.documents || [];
        const foundDoc = fetchedDocs.find((doc: any) => doc.fileName === file.name);

        if (foundDoc) {
          documentFound = true;
          const newDoc: Document = {
            id: foundDoc._id,
            name: foundDoc.fileName,
            type: 'pdf',
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
      }
    }

    if (!documentFound) {
      setPdfDocuments(prevDocs => prevDocs.filter(doc => doc.id !== tempId));
      setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== tempId));

      toast.update(toastId, {
        render: 'El documento está siendo procesado y aparecerá pronto.',
        type: 'info',
        autoClose: 5000
      });
    }

    setIsLoadingPdf(false);
    return documentFound;
  } catch (error: any) {
    console.error('Error al subir PDF:', error);

    setPdfDocuments(prevDocs =>
      prevDocs.map(doc =>
        doc.id === tempId ? { ...doc, status: "Procesando..." } : doc
      )
    );
    setDocuments(prevDocs =>
      prevDocs.map(doc =>
        doc.id === tempId ? { ...doc, status: "Procesando..." } : doc
      )
    );

    const errorMessage = error.response?.data?.error || error.message || "Error al subir el archivo PDF";
    setError(errorMessage);

    toast.update(toastId, {
      render: `Error: ${errorMessage}`,
      type: 'error',
      autoClose: 5000
    });

    setIsLoadingPdf(false);
    return false;
  }
};