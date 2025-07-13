import multer from "multer";
import { Request, Response } from "express";
import * as path from "path";
import { fileURLToPath } from 'url';
import * as fs from 'fs';
import { storePdfDocument, getUserPdfDocuments } from "../services/pdfService";
import { storeCertificate, getUserCertificates, decryptandretrieveCertificate } from "../services/crtService";
import jwt from "jsonwebtoken";
import 'dotenv/config';
import { deleteCertificateFromDB, deletePdfDocumentFromDB } from "../services/deleteService";
import {generateP12ForUser} from "../services/p12GeneratorService";

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
    
    /*
    console.log('Archivo recibido:', req.file);
    console.log('Ruta del archivo:', req.file.path);
    */

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

    const password = req.body.password;
    if (!password) {
      return res.status(400).json({ error: "Contraseña no proporcionada" });
    }


    /*
    console.log('Archivo de certificado recibido:', req.file);
    console.log('Ruta del archivo de certificado:', req.file.path);
    */

    // Extraer el ID del usuario del token
    const userId = extractUserIdFromToken(req);

    // 1. Guardar el hash y metadatos en MongoDB, y eliminar el archivo local
    const certificateId = await storeCertificate(
      req.file.path,
      req.file.originalname,
      userId,
      password
    );

    // 2. Recuperar el documento recién guardado desde la base de datos
    const certDoc = await getUserCertificates(userId);
    const justSaved = certDoc.find(c => (c as { _id: { toString(): string } })._id.toString() === certificateId);

    if (!justSaved) {
      throw new Error('No se pudo recuperar el certificado recién guardado');
    }

    // 3. Desencriptar el hash del documento recuperado
    const { _id } = justSaved as { _id: { toString(): string } };
    const decryptedHash = await decryptandretrieveCertificate(_id.toString(), password);
    //console.log('Hash desencriptado tras guardar:', decryptedHash);

    // Responder al cliente
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

    /*
    console.log('Archivo de certificado recibido (PUT):', req.file);
    console.log('Ruta del archivo de certificado:', req.file.path);
    */

    // Extraer el ID del usuario del token
    const userId = extractUserIdFromToken(req);

    // Guardar solo el hash y metadatos en MongoDB, y eliminar el archivo local
    const certificateId = await storeCertificate(
      req.file.path,
      req.file.originalname,
      userId,
      req.body.password
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

// Controlador para crear el certificado P12 del usuario
export const generateCertificate = async (req: Request, res: Response) => {
  try {
    const userId = extractUserIdFromToken(req);
    const {
      country,
      state,
      locality,
      organization,
      orgUnit,
      commonName,
      email,
      challengePassword,
      optionalCompany
    } = req.body;

    if (!country || !state || !locality || !organization || !commonName || !email || !challengePassword) {
      return res.status(400).json({ error: "Faltan campos obligatorios para generar el certificado" });
    }

    const p12Path = await generateP12ForUser({
      userId,
      country,
      state,
      locality,
      organization,
      orgUnit,
      commonName,
      email,
      challengePassword,
      optionalCompany
    });

    const certificateId = await storeCertificate(
      p12Path,
      `${userId}-cert.p12`,
      userId,
      challengePassword
    );

    // Eliminar el archivo P12 temporal sólo si existe
    if (fs.existsSync(p12Path)) {
      fs.unlinkSync(p12Path);
      console.log(`Archivo temporal P12 eliminado: ${p12Path}`);
    } else {
      console.warn(`No se encontró el archivo P12 para eliminar: ${p12Path}`);
    }

    return res.status(200).json({
      message: "Certificado P12 generado y guardado correctamente",
      certificateId
    });
  } catch (error: any) {
    console.error("Error al generar certificado P12:", error);
    return res.status(500).json({
      error: error.message || "Error al generar el certificado P12"
    });
  }
};

export const getUserCertificate = async (req: Request, res: Response) => {
  try {
    // Extraer el ID del usuario del token
    const userId = extractUserIdFromToken(req);
    
    // Obtener el certificado del usuario (solo el más reciente)
    const certificates = await getUserCertificates(userId);
    
    // Devolver solo el más reciente (o null si no hay ninguno)
    res.status(200).json({
      certificate: certificates.length > 0 ? certificates[0] : null
    });
  } catch (error: any) {
    console.error('Error en getUserCertificate:', error);
    res.status(error.message === 'No autorizado' ? 401 : 500).json({
      error: error.message || "Error al obtener certificado"
    });
  }
};

export const deletePdfDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: "ID de documento no proporcionado" });
    }
    
    // Extraer el ID del usuario del token
    const userId = extractUserIdFromToken(req);
    
    // Eliminar el documento
    const result = await deletePdfDocumentFromDB(id, userId);
    
    if (result.success) {
      return res.status(200).json({ 
        message: "Documento eliminado correctamente",
        documentId: id
      });
    } else {
      return res.status(result.code || 400).json({ 
        error: result.message 
      });
    }
  } catch (error: any) {
    console.error('Error al eliminar documento PDF:', error);
    return res.status(error.message === 'No autorizado' ? 401 : 500).json({
      error: error.message || "Error al eliminar el documento"
    });
  }
};

export const deleteCertificateHandler = async (req: Request, res: Response) => {
  try {
    // Extraer el ID del usuario del token
    const userId = extractUserIdFromToken(req);
    
    // Eliminar el certificado
    const result = await deleteCertificateFromDB(userId);
    
    if (result.success) {
      return res.status(200).json({ 
        message: "Certificado eliminado correctamente"
      });
    } else {
      return res.status(result.code || 404).json({ 
        error: result.message 
      });
    }
  } catch (error: any) {
    console.error('Error al eliminar certificado:', error);
    return res.status(error.message === 'No autorizado' ? 401 : 500).json({
      error: error.message || "Error al eliminar el certificado"
    });
  }
};