import * as fs from 'fs';
import * as crypto from 'crypto';
import PdfDocument from '../models/PdfDocument';
import 'dotenv/config';

const ENCRYPTION_SECRET = process.env.ENCRYPTION_KEY_PDF;
if (!ENCRYPTION_SECRET) {
  throw new Error('ENCRYPTION_KEY_PDF no está definido en las variables de entorno');
}

/**
 * Cifra un archivo PDF y lo almacena en MongoDB
 */
export const storePdfDocument = async (
  filePath: string,
  fileName: string,
  userId: string
): Promise<string> => {
  try {
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      throw new Error(`El archivo no existe en la ruta: ${filePath}`);
    }

    console.log('Cifrando archivo:', filePath);

    // Leer el archivo PDF como un Buffer
    const fileBuffer = fs.readFileSync(filePath);
    console.log(`Archivo leído: ${fileBuffer.length} bytes`);

    // Crear un hash del secreto para usarlo como clave de cifrado (más eficiente)
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_SECRET)).digest();
    const iv = crypto.randomBytes(16); // Vector de inicialización

    console.time('encryption-time');

    // Cifrar con crypto nativo (mucho más rápido que CryptoJS)
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encryptedData = Buffer.concat([
      cipher.update(fileBuffer),
      cipher.final()
    ]);

    // Guardar el IV y los datos cifrados
    const encryptedContent = iv.toString('hex') + ':' + encryptedData.toString('base64');
    console.timeEnd('encryption-time');

    console.time('mongodb-save-time');
    // Crear un nuevo documento en la colección
    const pdfDoc = new PdfDocument({
      userId,
      fileName,
      encryptedContent,
      status: 'Pendiente de firma'
    });

    // Guardar en la base de datos
    await pdfDoc.save();
    console.timeEnd('mongodb-save-time');

    console.log('Documento guardado en MongoDB exitosamente con ID:', pdfDoc._id);

    // Una vez guardado en BD, podemos eliminar el archivo temporal
    fs.unlinkSync(filePath);

    return (pdfDoc._id as unknown as { toString(): string }).toString();
  } catch (error) {
    console.error('Error al almacenar el PDF cifrado:', error);
    if (error instanceof Error) {
      throw new Error(`No se pudo almacenar el archivo PDF: ${error.message}`);
    }
    throw new Error('No se pudo almacenar el archivo PDF');
  }
};

/**
 * Recupera un archivo PDF de MongoDB y lo descifra
 */
export const retrievePdfDocument = async (documentId: string): Promise<Buffer> => {
  try {
    console.log(`[retrievePdfDocument] Buscando documento con ID: ${documentId}`);
    const pdfDoc = await PdfDocument.findById(documentId);
    console.log(`[retrievePdfDocument] Documento encontrado:`, pdfDoc ? 'SÍ' : 'NO');

    if (!pdfDoc) {
      throw new Error('Documento no encontrado');
    }

    // Separar el IV y el contenido cifrado
    const parts = pdfDoc.encryptedContent.split(':');
    if (parts.length !== 2) {
      throw new Error('Formato de datos cifrados no válido');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = Buffer.from(parts[1], 'base64');

    // Clave derivada del secreto
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_SECRET)).digest();

    // Descifrar
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const pdfBuffer = Buffer.concat([
      decipher.update(encryptedData),
      decipher.final()
    ]);
    return pdfBuffer;
  } catch (error) {
    console.error('Error al recuperar el PDF:', error);
    throw new Error('No se pudo recuperar el archivo PDF');
  }
};

/**
 * Obtiene todos los documentos PDF de un usuario
 */
export const getUserPdfDocuments = async (userId: string) => {
  try {
    const documents = await PdfDocument.find(
      { userId },
      { encryptedContent: 0 }
    ).sort({ createdAt: -1 });

    return documents;
  } catch (error) {
    console.error('Error al obtener documentos del usuario:', error);
    throw new Error('No se pudieron obtener los documentos');
  }
};

export const getDecryptedPdfBuffer = async (documentId: string, userId: string): Promise<Buffer> => {
  const doc = await PdfDocument.findOne({ _id: documentId, userId });
  if (!doc) throw new Error("Documento no encontrado");

  const parts = doc.encryptedContent.split(':');
  if (parts.length !== 2) {
    throw new Error('Formato de datos cifrados no válido');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const encryptedData = Buffer.from(parts[1], 'base64');
  const key = crypto.createHash('sha256').update(String(ENCRYPTION_SECRET)).digest();

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([
    decipher.update(encryptedData),
    decipher.final()
  ]);
};

//Actualizar el pdf firmado
export const updateSignedPdf = async (
  documentId: string,
  signedPdf: Buffer
): Promise<void> => {
  try {
    console.log('[updateSignedPdf] Iniciando guardado...');
    console.log('[updateSignedPdf] Buffer firmado tamaño:', signedPdf.length);

    const pdfDoc = await PdfDocument.findById(documentId);
    if (!pdfDoc) {
      throw new Error('Documento no encontrado');
    }

    const key = crypto.createHash('sha256').update(String(process.env.ENCRYPTION_KEY_PDF)).digest();
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encryptedData = Buffer.concat([
      cipher.update(signedPdf),
      cipher.final(),
    ]);

    pdfDoc.encryptedContent = iv.toString('hex') + ':' + encryptedData.toString('base64');
    pdfDoc.status = 'Firmado';

    console.log('[updateSignedPdf] Guardando documento en BD...');
    await pdfDoc.save();
    console.log('[updateSignedPdf] Documento guardado exitosamente.');
  } catch (error) {
    console.error('[updateSignedPdf] Error al guardar PDF firmado:', error);
    throw new Error('No se pudo actualizar el PDF firmado');
  }
};
