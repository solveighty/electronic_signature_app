import multer from "multer";
import { Request, Response } from "express";
import * as path from "path";
import { fileURLToPath } from 'url';
import * as fs from 'fs';
import { storePdfDocument, getUserPdfDocuments } from "../services/pdfService";
import { storeCertificate } from "../services/crtService";
import jwt from "jsonwebtoken";
import 'dotenv/config';

// Obtener la ruta base del proyecto
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');

// Crear directorios si no existen
const filesDir = path.join(rootDir, "files");
const pdfDir = path.join(filesDir, "pdf");
const certDir = path.join(filesDir, "certificates");

if (!fs.existsSync(filesDir)) fs.mkdirSync(filesDir, { recursive: true });
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true });

// Storage para PDF con rutas absolutas
export const storagePdf = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, pdfDir);
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
    cb(null, certDir);
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

// Extraer el ID de usuario del token JWT
const extractUserIdFromToken = (req: Request): string => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new Error('Token no proporcionado');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as { id: string };
    return decoded.id;
  } catch (error) {
    console.error('Error al extraer ID de usuario del token:', error);
    throw new Error('No autorizado');
  }
};

// Controlador para manejar la subida de PDF
export const handlePdfUpload = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se ha subido ningún archivo" });
    }
    
    console.log('Archivo recibido:', req.file);
    console.log('Ruta del archivo:', req.file.path);
    
    // Extraer el ID del usuario del token
    const userId = extractUserIdFromToken(req);
    
    // Almacenar el PDF cifrado en MongoDB
    const documentId = await storePdfDocument(
      req.file.path,
      req.file.originalname,
      userId
    );
    
    // Aquí está guardado exitosamente, ASEGÚRATE de enviar una respuesta
    console.log('Enviando respuesta al cliente...');
    return res.status(200).json({
      message: "Archivo subido y cifrado correctamente",
      documentId,
      fileName: req.file.originalname
    });
  } catch (error: any) {
    console.error('Error en handlePdfUpload:', error);
    // Asegúrate de siempre enviar una respuesta incluso en caso de error
    return res.status(error.message === 'No autorizado' ? 401 : 500).json({
      error: error.message || "Error al procesar el archivo"
    });
  }
};

// Controlador para obtener los documentos PDF del usuario
export const getUserDocuments = async (req: Request, res: Response) => {
  try {
    // Extraer el ID del usuario del token
    const userId = extractUserIdFromToken(req);
    
    // Obtener documentos del usuario
    const documents = await getUserPdfDocuments(userId);
    
    res.status(200).json({
      documents
    });
  } catch (error: any) {
    console.error('Error en getUserDocuments:', error);
    res.status(error.message === 'No autorizado' ? 401 : 500).json({
      error: error.message || "Error al obtener documentos"
    });
  }
};

// Controlador para manejar la subida de certificados P12

export const handleCertificateUpload = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se ha subido ningún archivo" });
    }

    console.log('Archivo de certificado recibido:', req.file);
    console.log('Ruta del archivo de certificado:', req.file.path);

    // Extraer el ID del usuario del token
    const userId = extractUserIdFromToken(req);

    // Guardar solo el hash y metadatos en MongoDB, y eliminar el archivo local
    const certificateId = await storeCertificate(
      req.file.path,
      req.file.originalname,
      userId
    );

    // Aquí está guardado exitosamente, ASEGÚRATE de enviar una respuesta
    console.log('Enviando respuesta al cliente...');
    return res.status(200).json({
      message: "Certificado subido y hash guardado correctamente",
      certificateId,
      fileName: req.file.originalname
    });
  } catch (error: any) {
    console.error('Error en handleCertificateUpload:', error);
    return res.status(error.message === 'No autorizado' ? 401 : 500).json({
      error: error.message || "Error al procesar el certificado"
    });
  }
};

export const updateCertificate = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se ha subido ningún archivo" });
    }

    console.log('Archivo de certificado recibido (PUT):', req.file);
    console.log('Ruta del archivo de certificado:', req.file.path);

    // Extraer el ID del usuario del token
    const userId = extractUserIdFromToken(req);

    // Guardar solo el hash y metadatos en MongoDB, y eliminar el archivo local
    const certificateId = await storeCertificate(
      req.file.path,
      req.file.originalname,
      userId
    );

    // Aquí está guardado exitosamente, ASEGÚRATE de enviar una respuesta
    console.log('Enviando respuesta al cliente (PUT)...');
    return res.status(200).json({
      message: "Certificado actualizado y hash guardado correctamente",
      certificateId,
      fileName: req.file.originalname
    });
  } catch (error: any) {
    console.error('Error en updateCertificate:', error);
    return res.status(error.message === 'No autorizado' ? 401 : 500).json({
      error: error.message || "Error al actualizar el certificado"
    });
  }
};