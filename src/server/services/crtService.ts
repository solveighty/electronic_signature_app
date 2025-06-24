import * as fs from 'fs';
import * as crypto from 'crypto';
import Certificate from '../models/Certificate';
import 'dotenv/config';
import mongoose from 'mongoose';

const ENCRYPTION_SECRET = process.env.ENCRYPTION_KEY_CERTIFICATE;

if (!ENCRYPTION_SECRET) {
  throw new Error('ENCRYPTION_KEY_CERTIFICATE no está definido en las variables de entorno');
}

/**
 * Guarda el hash de un certificado .p12 en MongoDB y elimina el archivo local
 * Doble cifrado: primero con clave del usuario, luego con clave del servidor.
 */
export const storeCertificate = async (
  filePath: string,
  fileName: string,
  userId: string,
  password: string
): Promise<string> => {
  try {
    // Verificar primero si el usuario ya tiene un certificado
    const existingCertificates = await Certificate.find({ userId });
    if (existingCertificates.length > 0) {
      await Certificate.deleteOne({ _id: existingCertificates[0]._id });
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`El archivo no existe en la ruta: ${filePath}`);
    }

    // Leer el archivo y crear un hash SHA-256
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // --- PRIMER CIFRADO: con clave del usuario ---
    const userSalt = crypto.randomBytes(16);
    const userIV = crypto.randomBytes(16);
    const userKey = crypto.pbkdf2Sync(password, userSalt, 100000, 32, 'sha256');
    const userCipher = crypto.createCipheriv('aes-256-cbc', userKey, userIV);
    let userEncrypted = userCipher.update(hash, 'utf8', 'hex');
    userEncrypted += userCipher.final('hex');

    // --- SEGUNDO CIFRADO: con clave del servidor ---
    const encryptionSalt = crypto.randomBytes(16);
    const encryptionIV = crypto.randomBytes(16);
    const serverKey = crypto.pbkdf2Sync(ENCRYPTION_SECRET, encryptionSalt, 100000, 32, 'sha256');
    const serverCipher = crypto.createCipheriv('aes-256-cbc', serverKey, encryptionIV);
    let serverEncrypted = serverCipher.update(userEncrypted, 'hex', 'hex');
    serverEncrypted += serverCipher.final('hex');

    // Guardar en MongoDB
    const certDoc = new Certificate({
      userId,
      fileName,
      encryptionSalt: encryptionSalt.toString('hex'),
      encryptionIV: encryptionIV.toString('hex'),
      certificateData: serverEncrypted,
      userSalt: userSalt.toString('hex'),
      userIV: userIV.toString('hex'),
      type: 'p12'
    });

    await certDoc.save();

    // Eliminar el archivo temporal
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
 * Doble descifrado: primero con clave del servidor, luego con clave del usuario.
 */
export const decryptandretrieveCertificate = async (
  certificateId: string,
  password: string
): Promise<string> => {
  try {
    const cert = await Certificate.findById(certificateId);
    if (!cert) throw new Error('Certificado no encontrado');

    // Verificar que todos los campos necesarios estén presentes
    if (!cert.encryptionSalt || !cert.encryptionIV || !cert.certificateData || !cert.userSalt || !cert.userIV) {
      throw new Error('El certificado no tiene el formato esperado');
    }

    // --- PRIMER DESCIFRADO: con clave del servidor ---
    const encryptionSalt = Buffer.from(cert.encryptionSalt, 'hex');
    const encryptionIV = Buffer.from(cert.encryptionIV, 'hex');
    const serverKey = crypto.pbkdf2Sync(ENCRYPTION_SECRET, encryptionSalt, 100000, 32, 'sha256');
    const serverDecipher = crypto.createDecipheriv('aes-256-cbc', serverKey, encryptionIV);

    let userEncrypted: string;
    try {
      userEncrypted = serverDecipher.update(cert.certificateData, 'hex', 'hex');
      userEncrypted += serverDecipher.final('hex');
    } catch (e) {
      console.error('Error descifrando con clave del servidor:', e);
      throw new Error('Error descifrando con clave del servidor');
    }

    // --- SEGUNDO DESCIFRADO: con clave del usuario ---
    const userSalt = Buffer.from(cert.userSalt, 'hex');
    const userIV = Buffer.from(cert.userIV, 'hex');
    const userKey = crypto.pbkdf2Sync(password, userSalt, 100000, 32, 'sha256');
    const userDecipher = crypto.createDecipheriv('aes-256-cbc', userKey, userIV);

    let decrypted: string;
    try {
      decrypted = userDecipher.update(userEncrypted, 'hex', 'utf8');
      decrypted += userDecipher.final('utf8');
      console.log('Hash desencriptado correctamente:', decrypted); // Log de prueba --eliminar en producción
    } catch (e) {
      console.error('Error descifrando con clave del usuario:', e);
      throw new Error('Error descifrando con clave del usuario (¿clave incorrecta?)');
    }

    return decrypted;
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
    if (!userId) {
      throw new Error("ID de usuario no proporcionado");
    }

    const certificates = await Certificate.find({ userId })
      .sort({ createdAt: -1 })
      .limit(1);
    return certificates;
  } catch (error) {
    console.error('Error al obtener certificados del usuario:', error);
    throw new Error('No se pudieron obtener los certificados');
  }
};

/**
 * Verifica si el usuario ya tiene un certificado
 */
export const userHasCertificate = async (userId: string): Promise<boolean> => {
  try {
    const count = await Certificate.countDocuments({ userId });
    return count > 0;
  } catch (error) {
    console.error('Error al verificar certificado del usuario:', error);
    return false;
  }
};
