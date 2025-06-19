import { Router } from "express";
import { uploadPdf, uploadP12, handlePdfUpload, getUserDocuments } from "../controllers/uploadsController";

const router = Router();

router.post("/uploads/pdf", uploadPdf.single("file"), handlePdfUpload);

router.get("/documents", getUserDocuments);

router.post("/uploads/certificates", uploadP12.single("certificate"), (req, res) => {
  if(!req.file){
    res.status(400).json({error: "No certificate uploaded"});
    return;
  }
  res.status(200).json({file:req.file});
});

export default router;
