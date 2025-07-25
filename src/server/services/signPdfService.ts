import fs from 'fs';
import path from 'path';
import { SignPdf } from 'node-signpdf';
import { plainAddPlaceholder } from 'node-signpdf/dist/helpers/index.js';
import { retrievePdfDocument, updateSignedPdf } from './pdfService';
import { decryptandretrieveCertificate } from './crtService';

// ⭐ NUEVA ESTRATEGIA: Integrar estampa ANTES de cualquier firma
async function addStampBeforeSignature(
  pdfBuffer: Buffer,
  stampImageBase64: string,
  x?: number,
  y?: number,
  page?: number
): Promise<Buffer> {
  try {
    const { PDFDocument } = await import('pdf-lib');
    
    // Configuración ultra-conservadora para evitar alteraciones
    const pdfDoc = await PDFDocument.load(pdfBuffer, { 
      ignoreEncryption: true,
      capNumbers: false,
      throwOnInvalidObject: false,
      parseSpeed: 0,
      updateMetadata: false
    });
    
    const pages = pdfDoc.getPages();
    
    // Seleccionar página objetivo
    let targetPageIndex = 0; // Por defecto página 1 (índice 0)
    if (typeof page === 'number' && page >= 0 && page < pages.length) {
      targetPageIndex = page;
    }
    
    const targetPage = pages[targetPageIndex];
    const { width, height } = targetPage.getSize();

    // Validar y procesar imagen
    if (!stampImageBase64) {
      throw new Error("No se proporcionó imagen base64 para la estampa");
    }
    
    const imageData = stampImageBase64.replace(/^data:image\/png;base64,/, "");
    
    if (imageData.length === 0) {
      throw new Error("Imagen base64 vacía después de limpiar prefijo");
    }
    
    const stampImage = await pdfDoc.embedPng(Buffer.from(imageData, 'base64'));

    // Tamaño de la estampa - Reducido para ser más pequeña
    const stampWidth = 150;  // Reducido de 200 a 150
    const stampHeight = 60;  // Reducido de 80 a 60
    
    // Calcular coordenadas finales
    let xPos: number;
    let yPos: number;
    
    if (typeof x === 'number' && typeof y === 'number') {
      // Usar coordenadas proporcionadas
      xPos = x;
      yPos = y;
    } else {
      // Coordenadas por defecto en la esquina inferior derecha
      xPos = width - stampWidth - 20;
      yPos = height - stampHeight - 20;
    }
    
    // Validar que las coordenadas estén dentro de los límites de la página
    if (xPos < 0) xPos = 0;
    if (yPos < 0) yPos = 0;
    if (xPos + stampWidth > width) xPos = width - stampWidth;
    if (yPos + stampHeight > height) yPos = height - stampHeight;

    // Dibujar estampa
    targetPage.drawImage(stampImage, {
      x: xPos,
      y: yPos,
      width: stampWidth,
      height: stampHeight,
      opacity: 0.9
    });
    
    // Guardar con configuraciones que minimicen cambios estructurales
    const modifiedPdfBytes = await pdfDoc.save({
      useObjectStreams: false,
      addDefaultPage: false,
      updateFieldAppearances: false,
    });
    
    return Buffer.from(modifiedPdfBytes);
    
  } catch (error) {
    console.error("[addStampBeforeSignature] Error:", error);
    return pdfBuffer;
  }
}

export async function signPdfAndReplace(
  documentId: string,
  certId: string,
  certPassword: string,
  stampImageBase64?: string,
  userName?: string,
  userId?: string,
  x?: number,
  y?: number,
  page?: number
): Promise<void> {
  try {
    let pdfBuffer = await retrievePdfDocument(documentId);

    const p12Buffer = await decryptandretrieveCertificate(certId, certPassword);

    // ⭐ PASO 1: Agregar estampa ANTES de cualquier proceso de firma
    if (stampImageBase64) {
      try {
        pdfBuffer = await addStampBeforeSignature(pdfBuffer, stampImageBase64, x, y, page);
      } catch (error) {
        console.error("[signPdfAndReplace] Error integrando estampa:", error);
      }
    }

    // ⭐ PASO 2: Agregar placeholder para firma (en PDF con estampa ya integrada)
    const pdfWithPlaceholder = plainAddPlaceholder({
      pdfBuffer,
      reason: "Firmado digitalmente",
      signatureLength: 8192,
    });

    // ⭐ PASO 3: Firmar el PDF que YA contiene la estampa
    // Crear certificado temporal SOLO para firmar
    const tempCertPath = path.join(process.cwd(), `temp_cert_${certId}.p12`);
    fs.writeFileSync(tempCertPath, p12Buffer);

    const signer = new SignPdf();

    try {
      const signedPdf = signer.sign(pdfWithPlaceholder, fs.readFileSync(tempCertPath), {
        passphrase: "", // Certificado sin contraseña
      });

      // Limpiar certificado temporal de forma segura
      if (fs.existsSync(tempCertPath)) {
        fs.unlinkSync(tempCertPath);
      }

      // Guardar el PDF firmado SOLO en la base de datos cifrado
      await updateSignedPdf(documentId, signedPdf);
      
    } catch (signError) {
      // Limpiar certificado temporal si ocurre error
      if (fs.existsSync(tempCertPath)) {
        fs.unlinkSync(tempCertPath);
      }
      console.error("[signPdfAndReplace] Error durante la firma:", signError);
      throw new Error("Error al firmar el PDF.");
    }
  } catch (error) {
    console.error("[signPdfAndReplace] Error durante el proceso:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    throw new Error(`Fallo al firmar el documento: ${errorMessage}`);
  }
}

export async function signPdfWithStamp({
  id,
  certId,
  certPassword,
  stampImageBase64,
  userName,
  userId,
  x,
  y,
  page,
}: {
  id: string;
  certId: string;
  certPassword: string;
  stampImageBase64?: string;
  userName?: string;
  userId?: string;
  x?: number;
  y?: number;
  page?: number;
}): Promise<void> {
  await signPdfAndReplace(id, certId, certPassword, stampImageBase64, userName, userId, x, y, page);
}
