import { Router } from "express";
import { uploadPdf, uploadP12, handlePdfUpload, getUserDocuments, handleCertificateUpload, updateCertificate} from "../controllers/uploadsController";

const router = Router();

router.post("/uploads/pdf", uploadPdf.single("file"), handlePdfUpload);

router.get("/documents", getUserDocuments);

router.post("/uploads/certificates", uploadP12.single("certificate"), handleCertificateUpload);

router.put("/uploads/certificates", uploadP12.single("certificate"), updateCertificate);

export default router;
