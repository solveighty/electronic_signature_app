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
    // Verificar si no existe un certificado con el mismo nombre
    const existingCertificates = await Certificate.findOne({ userId, fileName });
    if (existingCertificates) {
      throw new Error (`Ya existe un certificado con el nombre: ${fileName}`);
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`El archivo no existe en la ruta: ${filePath}`);
    }

    // Leer el archivo como buffer
    const fileBuffer = fs.readFileSync(filePath);

    // --- PRIMER CIFRADO: con clave del usuario ---
    const userSalt = crypto.randomBytes(16);
    const userIV = crypto.randomBytes(16);
    const userKey = crypto.pbkdf2Sync(password, userSalt, 100000, 32, 'sha256');
    const userCipher = crypto.createCipheriv('aes-256-cbc', userKey, userIV);
    const userEncryptedBuffer = Buffer.concat([
      userCipher.update(fileBuffer),
      userCipher.final()
    ]);

    // --- SEGUNDO CIFRADO: con clave del servidor ---
    const encryptionSalt = crypto.randomBytes(16);
    const encryptionIV = crypto.randomBytes(16);
    const serverKey = crypto.pbkdf2Sync(ENCRYPTION_SECRET, encryptionSalt, 100000, 32, 'sha256');
    const serverCipher = crypto.createCipheriv('aes-256-cbc', serverKey, encryptionIV);
    const serverEncryptedBuffer = Buffer.concat([
      serverCipher.update(userEncryptedBuffer),
      serverCipher.final()
    ]);

    // Guardar en MongoDB
    const certDoc = new Certificate({
      userId,
      fileName,
      encryptionSalt: encryptionSalt.toString('hex'),
      encryptionIV: encryptionIV.toString('hex'),
      certificateData: serverEncryptedBuffer.toString('base64'),
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

//Eliminar certificado localmente
export const deleteLocalFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Archivo local eliminado:', filePath);
    } else {
      console.warn('Archivo local no existe:', filePath);
    }
  } catch (error) {
    console.error('Error al eliminar archivo local:', error);
  }
};

/**
 * Recupera buffer del certificado y lo descifra
 * Doble descifrado: primero con clave del servidor, luego con clave del usuario.
 */
export const decryptandretrieveCertificate = async (
  certificateId: string,
  password: string
): Promise<Buffer> => {
  try {
    const cert = await Certificate.findById(certificateId);
    if (!cert) throw new Error('Certificado no encontrado');

    // Verificar que todos los campos necesarios estén presentes
    if (!cert.encryptionSalt || !cert.encryptionIV || !cert.certificateData || !cert.userSalt || !cert.userIV) {
      throw new Error('El certificado no tiene el formato esperado');
    }

    console.log('encryptionSalt (hex):', cert.encryptionSalt);
    console.log('encryptionIV (hex):', cert.encryptionIV);
    console.log('userSalt (hex):', cert.userSalt);
    console.log('userIV (hex):', cert.userIV);
    console.log('certificateData (base64, length):', cert.certificateData.length);

    // --- PRIMER DESCIFRADO: con clave del servidor ---
    const encryptionSalt = Buffer.from(cert.encryptionSalt, 'hex');
    const encryptionIV = Buffer.from(cert.encryptionIV, 'hex');
    const serverKey = crypto.pbkdf2Sync(ENCRYPTION_SECRET, encryptionSalt, 100000, 32, 'sha256');
    const serverDecipher = crypto.createDecipheriv('aes-256-cbc', serverKey, encryptionIV);

    // Convertir certificateData de base64 a buffer
    const encryptedDataBuffer = Buffer.from(cert.certificateData, 'base64');

    let userEncrypted = serverDecipher.update(encryptedDataBuffer);
    userEncrypted = Buffer.concat([
      userEncrypted,
      serverDecipher.final()
    ]);

    // --- SEGUNDO DESCIFRADO: con clave del usuario ---
    const userSalt = Buffer.from(cert.userSalt, 'hex');
    const userIV = Buffer.from(cert.userIV, 'hex');
    const userKey = crypto.pbkdf2Sync(password, userSalt, 100000, 32, 'sha256');
    const userDecipher = crypto.createDecipheriv('aes-256-cbc', userKey, userIV);

    let decrypted = userDecipher.update(userEncrypted);
    decrypted = Buffer.concat([
      decrypted,
      userDecipher.final()
    ]);

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
