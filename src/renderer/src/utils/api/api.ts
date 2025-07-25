import api from "./config/axiosConfig";

export * from "./endpoints/auth/authApi";
export * from "./endpoints/certificate/certificateApi";
export {
  getUserDocuments,
  uploadPdfDocument,
  deletePdfDocument,
  getPdfDocumentUrl,
  signPdfDocument,
  signPdfWithStamp as signPdfWithStampFromDocumentApi
} from "./endpoints/pdf/documentApi";

export default api;