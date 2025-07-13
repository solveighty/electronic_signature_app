import { Router } from "express";
import { 
  uploadPdf, 
  uploadP12, 
  handlePdfUpload, 
  getUserDocuments, 
  handleCertificateUpload, 
  updateCertificate, 
  getUserCertificate,
  deletePdfDocument,
  deleteCertificateHandler,
  generateCertificate
} from "../controllers/uploadsController";

const router = Router();

router.post("/uploads/pdf", uploadPdf.single("file"), (req, res, next) => {
  handlePdfUpload(req, res).catch(next);
});
router.get("/documents", getUserDocuments);
router.post("/uploads/certificates", uploadP12.single("certificate"), (req, res, next) => {
  handleCertificateUpload(req, res).catch(next);
});
router.put("/uploads/certificates", uploadP12.single("certificate"), (req, res, next) => {
  updateCertificate(req, res).catch(next);
});
router.get("/certificate", (req, res, next) => {
  getUserCertificate(req, res).catch(next);
});
router.delete("/documents/:id", (req, res, next) => {
  deletePdfDocument(req, res).catch(next);
});
router.delete("/certificate", (req, res, next) => {
  deleteCertificateHandler(req, res).catch(next);
});
router.post("/uploads/certificates/generate", (req, res, next) => {
  generateCertificate(req, res).catch(next);
});

export default router;
