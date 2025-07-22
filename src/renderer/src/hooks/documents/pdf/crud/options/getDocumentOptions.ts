import { Document } from "../../../../../types/document";

export function getDocumentOptions(pdfDocuments: Document[]) {
  return pdfDocuments
    .filter(doc => doc.status === 'Pendiente de firma')
    .map(doc => ({
      value: doc.id.toString(),
      label: doc.name
    }));
}