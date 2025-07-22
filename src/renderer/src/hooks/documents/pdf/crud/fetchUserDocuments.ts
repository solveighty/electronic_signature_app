import { getUserDocuments } from '../../../../utils/api';
import { Document } from '../../useDocumentManager';

export const fetchUserDocuments = async (): Promise<Document[]> => {
  const response = await getUserDocuments();
  return response.data.documents.map((doc: any) => ({
    id: doc._id,
    name: doc.fileName,
    type: 'pdf' as const,
    status: doc.status,
    createdAt: new Date(doc.createdAt)
  }));
};