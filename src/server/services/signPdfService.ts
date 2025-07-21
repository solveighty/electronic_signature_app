import { SignPdf, plainAddPlaceholder } from 'node-signpdf';
import { decryptandretrieveCertificate, deleteLocalFile } from './crtService';
import { retrievePdfDocument, updateSignedPdf } from './pdfService';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputDir = join(__dirname, '..', '..', 'files', 'pdf');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

export async function signPdfAndReplace(
    documentId: string,
    certId: string,
    certPassword: string
): Promise<void> {
    try {
        console.log('[signPdfAndReplace] Recuperando PDF original...');
        const pdfBuffer = await retrievePdfDocument(documentId);
        console.log(`[signPdfAndReplace] PDF recuperado: ${pdfBuffer.length} bytes`);

        console.log('[signPdfAndReplace] Recuperando certificado .p12...');
        const p12Buffer = await decryptandretrieveCertificate(certId, certPassword);
        console.log(`[signPdfAndReplace] Certificado recuperado: ${p12Buffer.length} bytes`);

        console.log('[signPdfAndReplace] Agregando placeholder para firma...');
        const pdfWithPlaceholder = plainAddPlaceholder({
            pdfBuffer,
            reason: 'Firmado digitalmente',
            signatureLength: 8192,
        });

        // Guardar temporalmente para verificar
        const placeholderPath = path.join(outputDir, `debug_pdf_with_placeholder_${documentId}.pdf`);
        fs.writeFileSync(placeholderPath, pdfWithPlaceholder);
        console.log(`[signPdfAndReplace] Placeholder guardado en: ${placeholderPath}`);

        console.log('[signPdfAndReplace] Firmando el PDF...');
        const signer = new SignPdf();
        const signedPdf = signer.sign(pdfWithPlaceholder, p12Buffer, {
            passphrase: certPassword,
        });
        console.log(`[signPdfAndReplace] PDF firmado. Tamaño: ${signedPdf.length} bytes`);

        // Guardar temporalmente para verificar firma
        const signedPdfPath = path.join(outputDir, `debug_signed_pdf_${documentId}.pdf`);
        fs.writeFileSync(signedPdfPath, signedPdf);
        console.log(`[signPdfAndReplace] PDF firmado guardado temporalmente en: ${signedPdfPath}`);

        console.log('[signPdfAndReplace] Guardando PDF firmado en base de datos...');
        await updateSignedPdf(documentId, signedPdf);
        console.log(`[signPdfAndReplace] Documento ${documentId} actualizado con PDF firmado en BD.`);

        console.log('[signPdfAndReplace] Eliminando certificado temporal...');
        deleteLocalFile(certId);

        console.log('[signPdfAndReplace] Proceso finalizado correctamente.');
    } catch (error) {
        console.error('[signPdfAndReplace] Error durante el proceso:', error);
        throw new Error('Fallo al firmar el documento');
    }
}
