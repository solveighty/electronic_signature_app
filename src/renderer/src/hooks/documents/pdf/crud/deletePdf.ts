import { toast } from 'react-toastify';
import { deletePdfDocument as deletePdfDocumentApi } from '../../../../utils/api/api';
import { Document } from '../../../../types/document';

export const deletePdf = async (
  documentId: string,
  pdfDocuments: Document[],
  setPdfDocuments: (fn: (docs: Document[]) => Document[]) => void,
  setDocuments: (fn: (docs: Document[]) => Document[]) => void,
  setIsLoadingPdf: (loading: boolean) => void,
  setError: (error: string | null) => void
): Promise<boolean> => {
  const documentToDelete = pdfDocuments.find(doc => doc.id === documentId);

  if (!documentToDelete) {
    toast.error("Documento no encontrado");
    return false;
  }

  setIsLoadingPdf(true);
  setError(null);

  const toastId = toast.info('Eliminando documento...', {
    autoClose: false,
    closeButton: false
  });

  try {
    await deletePdfDocumentApi(documentId);

    setPdfDocuments(prevDocs => prevDocs.filter(doc => doc.id !== documentId));
    setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== documentId));

    toast.update(toastId, {
      render: 'Documento eliminado correctamente',
      type: 'success',
      autoClose: 5000
    });

    setIsLoadingPdf(false);
    return true;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || "Error al eliminar el documento";
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