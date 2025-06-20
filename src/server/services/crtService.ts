import * as fs from 'fs';
import * as crypto from 'crypto';
import Certificate from '../models/Certificate';
import 'dotenv/config';
import mongoose from 'mongoose';

const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;

if (!ENCRYPTION_SECRET) {
  throw new Error('ENCRYPTION_SECRET no está definido en las variables de entorno');
}

/**
 * Guarda el hash de un certificado .p12 en MongoDB y elimina el archivo local
 */
export const storeCertificate = async (
  filePath: string,
  fileName: string,
  userId: string
): Promise<string> => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`El archivo no existe en la ruta: ${filePath}`);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(16);
    const key = crypto.pbkdf2Sync(ENCRYPTION_SECRET, salt, 100000, 32, 'sha256');

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encryptedHash = cipher.update(hash, 'utf8', 'hex');
    encryptedHash += cipher.final('hex');

    // Guardar todo junto: salt:iv:encryptedHash
    const hashBundle = `${salt.toString('hex')}:${iv.toString('hex')}:${encryptedHash}`;

    const certDoc = new Certificate({
      userId,
      fileName,
      hash: hashBundle,
      type: 'p12'
    });

    //guardar el documento en MongoDB
    await certDoc.save();

    // Log para verificar que se guardó correctamente
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.error('Error al borrar el archivo:', unlinkError);
    }

    return (certDoc._id as mongoose.Types.ObjectId).toString();
  } catch (error) {
    console.error('Error al almacenar el certificado:', error);
    if (error instanceof Error) {
      throw new Error(`No se pudo almacenar el certificado: ${error.message}`);
    }
    throw new Error('No se pudo almacenar el certificado');
  }
};

/**
 * Recupera el hash de un certificado desde MongoDB
 */
export const retrieveCertificateHash = async (certificateId: string): Promise<string> => {
  try {
    const cert = await Certificate.findById(certificateId);
    if (!cert) throw new Error('Certificado no encontrado');
    return cert.hash;
  } catch (error) {
    console.error('Error al recuperar el hash del certificado:', error);
    throw new Error('No se pudo recuperar el hash del certificado');
  }
};

/**
 * Obtiene todos los certificados de un usuario
 */
export const getUserCertificates = async (userId: string) => {
  try {
    const certificates = await Certificate.find(
      { userId }
    ).sort({ createdAt: -1 });

    return certificates;
  } catch (error) {
    console.error('Error al obtener certificados del usuario:', error);
    throw new Error('No se pudieron obtener los certificados');
  }
};
