import multer from "multer";
import { Request } from "express";

// Storage para PDF
export const storagePdf = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, "files/pdf");
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".pdf");
  },
});

export const fileFilterPdf = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Solo archivos PDF son permitidos"));
};

export const uploadPdf = multer({ storage: storagePdf, fileFilter: fileFilterPdf });

// Storage para P12
export const storageP12 = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, "files/certificates");
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".p12");
  },
});

export const fileFilterP12 = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === "application/x-pkcs12" || file.originalname.endsWith(".p12")) cb(null, true);
  else cb(new Error("Solo archivos P12 son permitidos"));
};

export const uploadP12 = multer({ storage: storageP12, fileFilter: fileFilterP12 });
