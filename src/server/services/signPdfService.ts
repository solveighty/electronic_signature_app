import { SignPdf } from '@signpdf/signpdf';
import forge from 'node-forge';
import { P12Signer } from '@signpdf/signer-p12';
import { plainAddPlaceholder } from '@signpdf/placeholder-plain';
import { SUBFILTER_ETSI_CADES_DETACHED } from '@signpdf/utils';
import { retrievePdfDocument, updateSignedPdf } from './pdfService';
import { decryptandretrieveCertificate } from './crtService';

// Añade sello visual usando pdf-lib
async function addStampBeforeSignature(pdf: Buffer, stampImageBase64: string, x?: number, y?: number, page?: number): Promise<Buffer> {
  try {
    const { PDFDocument } = await import('pdf-lib');
    const doc = await PDFDocument.load(pdf, { ignoreEncryption: true });
    const pages = doc.getPages();
    const idx = (page ?? 0) >= 0 && (page ?? 0) < pages.length ? (page ?? 0) : 0;
    const p = pages[idx];
    const { width, height } = p.getSize();
    const imgData = stampImageBase64.replace(/^data:image\/png;base64,/, '');
    const img = await doc.embedPng(Buffer.from(imgData, 'base64'));
    const w = 150, h = 60;
    let fx = typeof x === 'number' ? x : width - w - 20;
    let fy = typeof y === 'number' ? y : height - h - 20;
    if (fx < 0) fx = 0; if (fy < 0) fy = 0; if (fx + w > width) fx = width - w; if (fy + h > height) fy = height - h;
    p.drawImage(img, { x: fx, y: fy, width: w, height: h, opacity: 0.9 });
    return Buffer.from(await doc.save({ useObjectStreams: false }));
  } catch (e) {
    console.error('[addStampBeforeSignature] Error:', e);
    return pdf;
  }
}

class IncrementalPdfSigner {
  private defaultSignatureLength = 12000;

  private addPlaceholder({ pdfBuffer, userName, userId, page, x, y }: { pdfBuffer: Buffer; userName?: string; userId?: string; page?: number; x?: number; y?: number }): Buffer {
    const w = 150, h = 60;
    const hasCoords = typeof x === 'number' && typeof y === 'number';
    
    return plainAddPlaceholder({
      pdfBuffer,
      reason: 'Firmado digitalmente',
      name: userName || 'Usuario',
      location: 'Sistema',
      contactInfo: userId || '',
      signatureLength: this.defaultSignatureLength,
      subFilter: SUBFILTER_ETSI_CADES_DETACHED,
      page,
      rect: hasCoords ? [x as number, y as number, (x as number) + w, (y as number) + h] : undefined,
    } as any);
  }

  private async signWithP12(pdf: Buffer, p12: Buffer, passphrase: string) {
    const tryParse = (buf: Buffer, pw: string) => {
      try { 
        const asn1 = forge.asn1.fromDer(buf.toString('binary')); 
        forge.pkcs12.pkcs12FromAsn1(asn1, false, pw || ''); 
        return true; 
      }
      catch (e: any) { 
        if (e && /Invalid password|MAC could not be verified/i.test(e.message)) return false; 
        throw e; 
      }
    };
    
    let effective = ''; 
    let ok = tryParse(p12, effective);
    if (!ok && passphrase) { 
      if (tryParse(p12, passphrase)) { 
        effective = passphrase; 
        ok = true; 
      } 
    }
    if (!ok) throw new Error('El archivo .p12 parece requerir otra contraseña o está corrupto.');
    
    return await new SignPdf().sign(pdf, new P12Signer(p12, { passphrase: effective }));
  }

  async sign({ documentId, certId, certPassword, stampImageBase64, userName, userId, x, y, page }: { documentId: string; certId: string; certPassword: string; stampImageBase64?: string; userName?: string; userId?: string; x?: number; y?: number; page?: number; }): Promise<void> {
    let pdf = await retrievePdfDocument(documentId);
    const p12 = await decryptandretrieveCertificate(certId, certPassword);
    
    // Añadir sello visual si se proporciona
    if (stampImageBase64) {
      pdf = await addStampBeforeSignature(pdf, stampImageBase64, x, y, page);
    }
    
    // Añadir placeholder y firmar
    pdf = this.addPlaceholder({ pdfBuffer: pdf, userName, userId, page, x, y });
    const signed = await this.signWithP12(pdf, p12, certPassword);
    
    await updateSignedPdf(documentId, signed);
    console.log('[IncrementalPdfSigner] Firma aplicada exitosamente');
  }
}

export async function signPdfAndReplace(documentId: string, certId: string, certPassword: string, stampImageBase64?: string, userName?: string, userId?: string, x?: number, y?: number, page?: number): Promise<void> {
  await new IncrementalPdfSigner().sign({ documentId, certId, certPassword, stampImageBase64, userName, userId, x, y, page });
}

export async function signPdfWithStamp({ id, certId, certPassword, stampImageBase64, userName, userId, x, y, page }: { id: string; certId: string; certPassword: string; stampImageBase64?: string; userName?: string; userId?: string; x?: number; y?: number; page?: number; }): Promise<void> {
  await signPdfAndReplace(id, certId, certPassword, stampImageBase64, userName, userId, x, y, page);
}
