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
  deleteCertificateByIdHandler,
  generateCertificate,
  signPdfDocument,
  downloadPdfDocument,
  downloadCertificate,
  signPdfWithStamp
} from "../controllers/uploadsController";
import multer from 'multer';

const router = Router();
const stampUpload = multer();

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
router.get("/certificates", (req, res, next) => {
  getUserCertificate(req, res).catch(next);
});
router.delete("/documents/:id", (req, res, next) => {
  deletePdfDocument(req, res).catch(next);
});
router.delete("/certificates/:id", (req, res, next) => {
  deleteCertificateByIdHandler(req, res).catch(next);
});
router.post("/uploads/certificates/generate", (req, res, next) => {
  generateCertificate(req, res).catch(next);
});
router.get('/pdf/:id/download', (req, res, next) => {
  downloadPdfDocument(req, res).catch(next);
});

router.post('/pdf/:id/sign', (req, res, next) => {
  signPdfDocument(req, res).catch(next);
});

router.get('/certificates/:id/download', (req, res, next) => {
  downloadCertificate(req, res).catch(next);
});

router.post('/certificates/:id/download', (req, res, next) => {
  downloadCertificate(req, res).catch(next);
});

router.post('/pdf/:id/sign-with-stamp', stampUpload.single('stampImage'), (req, res, next) => {
  signPdfWithStamp(req, res).catch(next);
});

export default router;
