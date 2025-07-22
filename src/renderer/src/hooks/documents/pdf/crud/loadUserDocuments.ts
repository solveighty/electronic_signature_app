import { toast } from "react-toastify";
import { fetchUserDocuments } from "./fetchUserDocuments";
import { Document } from '../../../../types/document';

export const loadUserDocuments = async (
  setPdfDocuments: (docs: Document[]) => void,
  setDocuments: (docs: Document[]) => void,
  setIsLoadingDocuments: (loading: boolean) => void
) => {
  setIsLoadingDocuments(true);
  try {
    const fetchedDocuments = await fetchUserDocuments();
    setPdfDocuments(fetchedDocuments);
    setDocuments([...fetchedDocuments]);
  } catch (error: any) {
    toast.error(error.response?.data?.error || error.message || "Error al cargar documentos");
  } finally {
    setIsLoadingDocuments(false);
  }
};