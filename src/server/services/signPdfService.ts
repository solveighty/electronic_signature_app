import fs from 'fs';
import path from 'path';
import { SignPdf } from 'node-signpdf';
import { plainAddPlaceholder } from 'node-signpdf/dist/helpers/index.js';
import { retrievePdfDocument, updateSignedPdf } from './pdfService';
import { decryptandretrieveCertificate } from './crtService';



// Función para contar firmas existentes
function countExistingSignatures(pdfBuffer: Buffer): number {
  const pdfContent = pdfBuffer.toString('latin1');
  const signatureRegex = /\/Type\s*\/Sig/g;
  const matches = pdfContent.match(signatureRegex);
  return matches ? matches.length : 0;
}

// ⭐ NUEVA ESTRATEGIA: Integrar estampa ANTES de cualquier firma
async function addStampBeforeSignature(
  pdfBuffer: Buffer,
  stampImageBase64: string
): Promise<Buffer> {
  try {
    console.log("[addStampBeforeSignature] 🎯 Agregando estampa ANTES de cualquier modificación de firma...");
    
    const { PDFDocument } = await import('pdf-lib');
    
    // Configuración ultra-conservadora para evitar alteraciones
    const pdfDoc = await PDFDocument.load(pdfBuffer, { 
      ignoreEncryption: true,
      capNumbers: false,
      throwOnInvalidObject: false,
      parseSpeed: 0,
      updateMetadata: false
    });
    
    console.log("[addStampBeforeSignature] PDF original cargado exitosamente.");
    
    const firstPage = pdfDoc.getPages()[0];
    const { width, height } = firstPage.getSize();
    
    console.log(`[addStampBeforeSignature] Dimensiones página: ${width} x ${height}`);
    
    // Procesar imagen
    const imageData = stampImageBase64.replace(/^data:image\/png;base64,/, "");
    const stampImage = await pdfDoc.embedPng(Buffer.from(imageData, 'base64'));
    
    console.log("[addStampBeforeSignature] Imagen embebida exitosamente.");
    
    // Posición de estampa
    const stampWidth = 200;
    const stampHeight = 80;
    const xPos = width - stampWidth - 20;
    const yPos = height - stampHeight - 20;
    
    console.log(`[addStampBeforeSignature] Dibujando estampa en: x=${xPos}, y=${yPos}`);
    
    // Dibujar estampa
    firstPage.drawImage(stampImage, {
      x: xPos,
      y: yPos,
      width: stampWidth,
      height: stampHeight,
      opacity: 0.9
    });
    
    console.log("[addStampBeforeSignature] Estampa dibujada exitosamente.");
    
    // Guardar con configuraciones que minimicen cambios estructurales
    const modifiedPdfBytes = await pdfDoc.save({
      useObjectStreams: false,
      addDefaultPage: false,
      updateFieldAppearances: false,
    });
    
    console.log("[addStampBeforeSignature] PDF con estampa guardado. Tamaño:", modifiedPdfBytes.length);
    console.log("[addStampBeforeSignature] ✅ Estampa integrada ANTES de firma exitosamente!");
    
    return Buffer.from(modifiedPdfBytes);
    
  } catch (error) {
    console.error("[addStampBeforeSignature] ❌ Error:", error);
    console.log("[addStampBeforeSignature] Devolviendo PDF original debido al error.");
    return pdfBuffer;
  }
}

export async function signPdfAndReplace(
  documentId: string,
  certId: string,
  certPassword: string,
  stampImageBase64?: string,
  userName?: string,
  userId?: string
): Promise<void> {
  try {
    console.log("[signPdfAndReplace] 🚀 NUEVA ESTRATEGIA: Estampa ANTES de firmar...");
    
    console.log("[signPdfAndReplace] Recuperando PDF original...");
    let pdfBuffer = await retrievePdfDocument(documentId);

    console.log("[signPdfAndReplace] Recuperando certificado desencriptado...");
    const p12Buffer = await decryptandretrieveCertificate(certId, certPassword);
    console.log(`[signPdfAndReplace] Certificado recuperado. Tamaño: ${p12Buffer.length} bytes`);

    // ⭐ PASO 1: Agregar estampa ANTES de cualquier proceso de firma
    if (stampImageBase64) {
      console.log("[signPdfAndReplace] 🎯 Integrando estampa ANTES de firmar...");
      try {
        pdfBuffer = await addStampBeforeSignature(pdfBuffer, stampImageBase64);
        console.log("[signPdfAndReplace] ✅ Estampa integrada exitosamente ANTES de firmar.");
      } catch (error) {
        console.error("[signPdfAndReplace] ⚠️ Error integrando estampa:", error);
        console.log("[signPdfAndReplace] Continuando con firma sin estampa.");
      }
    }

    const existingSignatureCount = countExistingSignatures(pdfBuffer);
    console.log(`[signPdfAndReplace] Firmas existentes encontradas: ${existingSignatureCount}`);

    // ⭐ PASO 2: Agregar placeholder para firma (en PDF con estampa ya integrada)
    console.log("[signPdfAndReplace] Agregando placeholder para firma...");
    const pdfWithPlaceholder = plainAddPlaceholder({
      pdfBuffer,
      reason: "Firmado digitalmente",
      signatureLength: 8192,
    });
    console.log("[signPdfAndReplace] Placeholder agregado. Tamaño del PDF:", pdfWithPlaceholder.length);

    // ⭐ PASO 3: Firmar el PDF que YA contiene la estampa
    console.log("[signPdfAndReplace] Firmando el PDF que ya contiene la estampa...");
    // Crear certificado temporal SOLO para firmar
    const tempCertPath = path.join(process.cwd(), `temp_cert_${certId}.p12`);
    fs.writeFileSync(tempCertPath, p12Buffer);

    const signer = new SignPdf();
    console.log("[signPdfAndReplace] Certificado temporal creado en:", tempCertPath);

    try {
      const signedPdf = signer.sign(pdfWithPlaceholder, fs.readFileSync(tempCertPath), {
        passphrase: "", // Certificado sin contraseña
      });

      console.log(`[signPdfAndReplace] ✅ PDF con estampa firmado exitosamente. Tamaño: ${signedPdf.length} bytes`);

      // Limpiar certificado temporal de forma segura
      if (fs.existsSync(tempCertPath)) {
        fs.unlinkSync(tempCertPath);
        console.log("[signPdfAndReplace] Certificado temporal eliminado.");
      }

      // Guardar el PDF firmado SOLO en la base de datos cifrado
      console.log("[signPdfAndReplace] Guardando PDF firmado final en base de datos...");
      await updateSignedPdf(documentId, signedPdf);
      console.log(`[signPdfAndReplace] Documento ${documentId} actualizado con PDF firmado en BD.`);

      console.log("[signPdfAndReplace] 🎉 Proceso finalizado correctamente, sin archivos locales!");
      
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
}: {
  id: string;
  certId: string;
  certPassword: string;
  stampImageBase64?: string;
  userName?: string;
  userId?: string;
}): Promise<void> {
  await signPdfAndReplace(id, certId, certPassword, stampImageBase64, userName, userId);
}
