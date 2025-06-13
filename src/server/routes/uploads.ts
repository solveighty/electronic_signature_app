import { Router } from "express";
import { upload } from "../controllers/uploadsController";


const router = Router();

router.post("/uploads", upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  res.status(200).json({ file: req.file });
});

export default router;
