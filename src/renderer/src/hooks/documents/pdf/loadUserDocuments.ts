import { toast } from "react-toastify";
import { fetchUserDocuments } from "./fetchUserDocuments";
import { Document } from "../useDocumentManager";

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