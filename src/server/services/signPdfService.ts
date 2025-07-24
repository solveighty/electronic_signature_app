import { SignPdf, plainAddPlaceholder } from "node-signpdf";
import { decryptandretrieveCertificate, deleteLocalFile } from "./crtService";
import { retrievePdfDocument, updateSignedPdf } from "./pdfService";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { PDFDocument } from "pdf-lib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputDir = join(__dirname, "..", "..", "files", "pdf");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Esta función agrega un texto y una imagen al PDF
async function addStampToPdf(
  pdfBuffer: Buffer,
  stampText: string,
  stampImageBuffer?: Buffer,
  page: number = 1,
  x: number = 50, // porcentaje
  y: number = 50 // porcentaje
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();

  // Log para depuración
  console.log(
    `[addStampToPdf] Página solicitada: ${page}, Total páginas: ${pages.length}`
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
  const xPx = (x / 100) * pageWidth - (stampWidth - 10) / 2;
  const yPx = pageHeight - (y / 100) * pageHeight - stampHeight / 2;

  if (stampImageBuffer) {
    const pngImage = await pdfDoc.embedPng(stampImageBuffer);
    targetPage.drawImage(pngImage, {
      x: xPx,
      y: yPx,
      width: stampWidth,
      height: stampHeight,
    });
  }

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

    // 2. Recuperar el certificado desencriptado
    let p12Buffer;
    try {
      p12Buffer = await decryptandretrieveCertificate(certId, certPassword);
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('bad decrypt')) {
        throw new Error('Contraseña incorrecta. Por favor, verifica e intenta nuevamente.');
      }
      throw err;
    }

    // 3. Agregar estampado visual usando la imagen recibida
    const stampText = "Firmado electrónicamente por PUCESE"; // Personaliza el texto
    // Si tienes un buffer de imagen (por ejemplo, QR generado), pásalo como segundo argumento
    pdfBuffer = await addStampToPdf(
      pdfBuffer,
      stampText,
      stampImageBuffer,
      page,
      x,
      y
    );

    // 4. Verificar que el PDF termina con %%EOF
    const eofMarker = Buffer.from("%%EOF");
    if (!pdfBuffer.slice(-eofMarker.length).equals(eofMarker)) {
      pdfBuffer = Buffer.concat([pdfBuffer, Buffer.from("\n%%EOF")]);
    }

    // 5. Agregar placeholder y firmar como ya lo haces
    console.log("[signPdfAndReplace] Agregando placeholder para firma...");
    const pdfWithPlaceholder = plainAddPlaceholder({
      pdfBuffer,
      reason: "Firmado digitalmente",
      signatureLength: 8192,
    });


    console.log("[signPdfAndReplace] Firmando el PDF...");
    const signer = new SignPdf();
    const signedPdf = signer.sign(pdfWithPlaceholder, p12Buffer, {
      passphrase: certPassword,
    });
    console.log(
      `[signPdfAndReplace] PDF firmado. Tamaño: ${signedPdf.length} bytes`
    );
   
    try {
      const signedPdfPath = path.join(outputDir, `${documentId}_firmado.pdf`);
      if (fs.existsSync(signedPdfPath)) {
        fs.unlinkSync(signedPdfPath);
        console.log(`[signPdfAndReplace] Archivo temporal eliminado: ${signedPdfPath}`);
      }
    } catch (err) {
      console.warn(`[signPdfAndReplace] No se pudo eliminar archivo temporal:`, err);
    }

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
    throw new Error("Fallo al firmar el documento");
  }
}
