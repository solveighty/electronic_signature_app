import { SignPdf, plainAddPlaceholder } from "node-signpdf";
import { decryptandretrieveCertificate, deleteLocalFile } from "./crtService";
import { retrievePdfDocument, updateSignedPdf } from "./pdfService";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { PDFDocument, rgb } from "pdf-lib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputDir = join(__dirname, "..", "..", "files", "pdf");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Función para contar firmas existentes en el PDF
function countExistingSignatures(pdfBuffer: Buffer): number {
  const pdfString = pdfBuffer.toString('latin1');
  const signatureMatches = pdfString.match(/\/Type\s*\/Sig/g);
  return signatureMatches ? signatureMatches.length : 0;
}

// Esta función agrega un texto y una imagen al PDF con posición dinámica
async function addStampToPdf(
  pdfBuffer: Buffer,
  stampText: string,
  stampImageBuffer?: Buffer,
  page: number = 1,
  x: number = 50, // porcentaje
  y: number = 50, // porcentaje
  signatureCount: number = 0 // número de firmas existentes
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();

  // Log para depuración
  console.log(
    `[addStampToPdf] Página solicitada: ${page}, Total páginas: ${pages.length}, Firmas existentes: ${signatureCount}`
  );

  // Selecciona la página correcta (índice base 0)
  const pageIndex = Math.max(0, Math.min(Number(page) - 1, pages.length - 1));
  const targetPage = pages[pageIndex];

  // Tamaño de la estampa (ajusta aquí)
  const stampWidth = 120;
  const stampHeight = 60;

  // Convierte porcentaje a píxeles y ajusta el eje Y
  const pageWidth = targetPage.getWidth();
  const pageHeight = targetPage.getHeight();
  
  // Calcular posición dinámica basada en el número de firmas existentes
  const offsetY = signatureCount * (stampHeight + 10); // Separación entre estampas
  const adjustedY = Math.max(5, y - (offsetY / pageHeight) * 100); // Asegurar que no salga de la página
  
  const xPx = (x / 100) * pageWidth - (stampWidth - 10) / 2;
  const yPx = pageHeight - (adjustedY / 100) * pageHeight - stampHeight / 2;

  if (stampImageBuffer) {
    const pngImage = await pdfDoc.embedPng(stampImageBuffer);
    targetPage.drawImage(pngImage, {
      x: xPx,
      y: yPx,
      width: stampWidth,
      height: stampHeight,
    });
  }

  // Agregar texto de la estampa
  targetPage.drawText(stampText, {
    x: xPx + stampWidth + 10, // Ajustar posición del texto
    y: yPx + stampHeight / 2,
    size: 10,
    color: rgb(0, 0, 0),
  });

  const modifiedPdfBytes = await pdfDoc.save({ useObjectStreams: false });
  return Buffer.from(modifiedPdfBytes);
}

export async function signPdfAndReplace(
  documentId: string,
  certId: string,
  certPassword: string,
  stampImageBuffer?: Buffer,
  page: number = 1,
  x: number = 50,
  y: number = 50
): Promise<void> {
  try {
    console.log("[signPdfAndReplace] Recuperando PDF original...");
    // 1. Recuperar el PDF original
    let pdfBuffer = await retrievePdfDocument(documentId);

    console.log("[signPdfAndReplace] Recuperando certificado desencriptado...");
    // 2. Recuperar el certificado desencriptado
    const p12Buffer = await decryptandretrieveCertificate(certId, certPassword);

    // Validar el certificado antes de proceder
    if (!p12Buffer || p12Buffer.length === 0) {
      throw new Error("El certificado está vacío o no se pudo recuperar correctamente.");
    }

    console.log(`[signPdfAndReplace] Certificado recuperado. Tamaño: ${p12Buffer.length} bytes`);

    console.log("[signPdfAndReplace] Contando firmas existentes...");
    // 3. Contar firmas existentes para determinar el comportamiento
    const existingSignatureCount = countExistingSignatures(pdfBuffer);
    console.log(`[signPdfAndReplace] Firmas existentes encontradas: ${existingSignatureCount}`);

    // 4. Solo agregar estampa visual si es la PRIMERA firma
    if (existingSignatureCount === 0 && stampImageBuffer) {
      console.log("[signPdfAndReplace] Primera firma: Agregando estampa visual...");
      const stampText = `Firma Digital #1`;
      pdfBuffer = await addStampToPdf(
        pdfBuffer,
        stampText,
        stampImageBuffer,
        page,
        x,
        y,
        0
      );
    } else if (existingSignatureCount > 0) {
      console.log("[signPdfAndReplace] Firma adicional: Solo firmando sin modificar contenido visual...");
    }

    // 5. Verificar que el PDF termina con %%EOF
    const eofMarker = Buffer.from("%%EOF");
    if (!pdfBuffer.slice(-eofMarker.length).equals(eofMarker)) {
      pdfBuffer = Buffer.concat([pdfBuffer, Buffer.from("\n%%EOF")]);
    }

    console.log("[signPdfAndReplace] Agregando placeholder para firma...");
    // 6. Agregar placeholder y firmar
    const pdfWithPlaceholder = plainAddPlaceholder({
      pdfBuffer,
      reason: "Firmado digitalmente",
      signatureLength: 8192,
    });

    console.log("[signPdfAndReplace] Firmando el PDF...");
    
    // Guardar certificado temporalmente para node-signpdf
    const tempCertPath = path.join(outputDir, `temp_cert_${certId}.p12`);
    fs.writeFileSync(tempCertPath, p12Buffer);
    
    const signer = new SignPdf();
    // El certificado .p12 no tiene contraseña, solo se usa para descifrar el hash
    const signedPdf = signer.sign(pdfWithPlaceholder, fs.readFileSync(tempCertPath), {
      passphrase: "", // Certificado sin contraseña
      addSignature: existingSignatureCount > 0,
    });
    
    // Eliminar certificado temporal inmediatamente
    fs.unlinkSync(tempCertPath);
    
    console.log(
      `[signPdfAndReplace] PDF firmado. Tamaño: ${signedPdf.length} bytes`
    );

    // Guardar temporalmente para verificar firma
    const signedPdfPath = path.join(outputDir, `${documentId}_firmado.pdf`);
    fs.writeFileSync(signedPdfPath, signedPdf);

    console.log(
      "[signPdfAndReplace] Guardando PDF firmado en base de datos..."
    );
    await updateSignedPdf(documentId, signedPdf);
    console.log(
      `[signPdfAndReplace] Documento ${documentId} actualizado con PDF firmado en BD.`
    );

    console.log("[signPdfAndReplace] Eliminando certificado temporal...");
    deleteLocalFile(certId);

    console.log("[signPdfAndReplace] Proceso finalizado correctamente.");
  } catch (error) {
    console.error("[signPdfAndReplace] Error durante el proceso:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    throw new Error(`Fallo al firmar el documento: ${errorMessage}`);
  }
}
