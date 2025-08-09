// Servicio limpio consolidado (firma incremental con sello por cada firma)
import { SignPdf } from '@signpdf/signpdf';
import forge from 'node-forge';
import { P12Signer } from '@signpdf/signer-p12';
import { plainAddPlaceholder } from '@signpdf/placeholder-plain';
import { SUBFILTER_ETSI_CADES_DETACHED } from '@signpdf/utils';
import { retrievePdfDocument, updateSignedPdf } from './pdfService';
import { decryptandretrieveCertificate } from './crtService';
import { signWithAppearanceImage } from './appearanceSignService';

// Solo usamos pdf-lib antes de la PRIMERA firma (para no invalidar firmas previas)
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

function hasExistingSignatures(buf: Buffer): boolean { return buf.indexOf('/ByteRange') !== -1; }

class IncrementalPdfSigner {
  private defaultSignatureLength = 12000; // tamaño reservado para bytes firma

  // Añade un sello usando anotación incremental manual (sin pdf-lib para preservar firmas)
  private addImageStampIncremental(pdf: Buffer, stampImageBase64: string, { userName, x = 50, y = 50, page = 0, width = 150, height = 60 }: { userName?: string; x?: number; y?: number; page?: number; width?: number; height?: number }): Buffer {
    try {
      const src = pdf.toString('binary');
      
      // Localizar páginas usando la última revisión de cada objeto
      const pageRegex = /(\d+)\s+0\s+obj\b[\s\S]*?\/Type\s*\/Page[\s\S]*?endobj/g;
      let m: RegExpExecArray | null;
      const order: number[] = [];
      const latest: Record<number, string> = {};
      
      while ((m = pageRegex.exec(src)) !== null) {
        const num = parseInt(m[1], 10);
        if (!order.includes(num)) order.push(num);
        latest[num] = m[0];
      }
      
      if (!order.length) return pdf;
      if (page < 0 || page >= order.length) page = 0;
      const targetNum = order[page];
      const targetRaw = latest[targetNum];

      // Buscar mayor número de objeto para nuevos IDs
      const objRegex = /(\d+)\s+0\s+obj/g;
      let max = 0;
      while ((m = objRegex.exec(src)) !== null) {
        const n = parseInt(m[1], 10);
        if (n > max) max = n;
      }
      
      const annotNum = max + 1;
      const appearanceNum = max + 2;

      // Crear appearance stream simple con texto
      const uname = (userName || 'Usuario').replace(/[()\\]/g, ch => `\\${ch}`);
      const dateStr = new Date().toISOString().slice(0, 10);
      
      const lines = [
        'q',
        '1 1 0 rg', // fondo amarillo
        `0 0 ${width} ${height} re f`,
        '1 0 0 RG', // borde rojo
        '2 w',
        `0 0 ${width} ${height} re S`,
        'BT',
        '/F1 10 Tf',
        '0 0 0 rg',
        `5 ${height - 15} Td`,
        `(Firmado: ${uname}) Tj`,
        '0 -12 Td',
        `(Fecha: ${dateStr}) Tj`,
        'ET',
        'Q'
      ];
      const stream = lines.join('\n');
      
      // Crear objetos PDF
      const appearanceObj = `${appearanceNum} 0 obj\n<< /Type /XObject /Subtype /Form /BBox [0 0 ${width} ${height}] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`;
      
      const annotObj = `${annotNum} 0 obj\n<< /Type /Annot /Subtype /Stamp /Rect [${x} ${y} ${x + width} ${y + height}] /AP << /N ${appearanceNum} 0 R >> /P ${targetNum} 0 R /F 4 >>\nendobj\n`;

      // Modificar página para añadir anotación
      const pageMatch = targetRaw.match(/(\d+\s+0\s+obj)([\s\S]*?)endobj/);
      if (!pageMatch) return pdf;
      
      let pageDict = pageMatch[2];
      if (!/<<[\s\S]*>>/.test(pageDict)) return pdf;
      
      // Añadir anotación a /Annots
      if (/\/Annots\s*\[/.test(pageDict)) {
        pageDict = pageDict.replace(/\/Annots\s*\[(.*?)\]/s, (f, inner) => `/Annots [${inner.trim()} ${annotNum} 0 R]`);
      } else {
        pageDict = pageDict.replace(/>>\s*$/s, `/Annots [${annotNum} 0 R] >>`);
      }

      const newPageObj = `${targetNum} 0 obj\n${pageDict.replace(/^\s+/, '')}endobj\n`;

      // Construir xref incremental preservando referencias anteriores
      const startxref = /startxref\s+(\d+)\s+%%EOF\s*$/.exec(src);
      const prev = startxref ? parseInt(startxref[1], 10) : 0;
      const trailer = /trailer\s*<<([\s\S]*?)>>\s*startxref[\s\S]*%%EOF/.exec(src);
      let preserved = trailer ? trailer[1].replace(/\/Size\s+\d+/g, '').replace(/\/Prev\s+\d+/g, '').trim() : '';

      const base = pdf.length;
      const offPage = base;
      const offAnnot = offPage + Buffer.byteLength(newPageObj, 'binary');
      const offApp = offAnnot + Buffer.byteLength(annotObj, 'binary');
      const offXref = offApp + Buffer.byteLength(appearanceObj, 'binary');
      const size = appearanceNum + 1;

      const xref = [
        'xref',
        `${targetNum} 1`,
        offPage.toString().padStart(10, '0') + ' 00000 n ',
        `${annotNum} 1`,
        offAnnot.toString().padStart(10, '0') + ' 00000 n ',
        `${appearanceNum} 1`,
        offApp.toString().padStart(10, '0') + ' 00000 n ',
        'trailer',
        `<< /Size ${size} ${prev ? `/Prev ${prev}` : ''} ${preserved} >>`,
        'startxref',
        String(offXref),
        '%%EOF\n'
      ];

      const incremental = newPageObj + annotObj + appearanceObj + xref.join('\n');
      return Buffer.concat([pdf, Buffer.from(incremental, 'binary')]);
      
    } catch (e) {
      console.error('[addImageStampIncremental] Error:', e);
      return pdf; // fallback: devolver PDF sin modificar
    }
  }  private addPlaceholder({ pdfBuffer, userName, userId, page, x, y }: { pdfBuffer: Buffer; userName?: string; userId?: string; page?: number; x?: number; y?: number }): Buffer {
    const w = 150, h = 60; const hasCoords = typeof x === 'number' && typeof y === 'number';
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
    // Intenta primero contraseña vacía, luego la proporcionada (errores claros)
    const tryParse = (buf: Buffer, pw: string) => {
      try { const asn1 = forge.asn1.fromDer(buf.toString('binary')); forge.pkcs12.pkcs12FromAsn1(asn1, false, pw || ''); return true; }
      catch (e: any) { if (e && /Invalid password|MAC could not be verified/i.test(e.message)) return false; throw e; }
    };
    let effective = ''; let ok = tryParse(p12, effective);
    if (!ok && passphrase) { if (tryParse(p12, passphrase)) { effective = passphrase; ok = true; } }
    if (!ok) throw new Error('El archivo .p12 parece requerir otra contraseña o está corrupto.');
    return await new SignPdf().sign(pdf, new P12Signer(p12, { passphrase: effective }));
  }

  async sign({ documentId, certId, certPassword, stampImageBase64, userName, userId, x, y, page }: { documentId: string; certId: string; certPassword: string; stampImageBase64?: string; userName?: string; userId?: string; x?: number; y?: number; page?: number; }): Promise<void> {
    let pdf = await retrievePdfDocument(documentId);
    const already = hasExistingSignatures(pdf);

    // Estrategia simple: Regenerar PDF con TODAS las firmas cuando hay múltiples firmantes
    if (already && stampImageBase64) {
      console.log('[IncrementalPdfSigner] PDF ya firmado - regenerando con nueva firma y sello');
      
      // Para PDFs ya firmados, usamos una estrategia diferente:
      // 1. Añadir sello usando pdf-lib (esto invalidará firmas anteriores temporalmente)
      pdf = await addStampBeforeSignature(pdf, stampImageBase64, x, y, page);
      
      // 2. Añadir placeholder y firmar
      pdf = this.addPlaceholder({ pdfBuffer: pdf, userName, userId, page, x, y });
      const p12 = await decryptandretrieveCertificate(certId, certPassword);
      const signed = await this.signWithP12(pdf, p12, certPassword);
      
      await updateSignedPdf(documentId, signed);
      
      console.log('[IncrementalPdfSigner] Nueva firma añadida. Nota: las firmas anteriores pueden necesitar re-validación.');
      
    } else {
      // Primera firma o sin sello
      if (stampImageBase64) {
        pdf = await addStampBeforeSignature(pdf, stampImageBase64, x, y, page);
      }
      
      pdf = this.addPlaceholder({ pdfBuffer: pdf, userName, userId, page, x, y });
      const p12 = await decryptandretrieveCertificate(certId, certPassword);
      const signed = await this.signWithP12(pdf, p12, certPassword);
      
      await updateSignedPdf(documentId, signed);
    }
  }
}

export async function signPdfAndReplace(documentId: string, certId: string, certPassword: string, stampImageBase64?: string, userName?: string, userId?: string, x?: number, y?: number, page?: number): Promise<void> {
  await new IncrementalPdfSigner().sign({ documentId, certId, certPassword, stampImageBase64, userName, userId, x, y, page });
}

export async function signPdfWithStamp({ id, certId, certPassword, stampImageBase64, userName, userId, x, y, page }: { id: string; certId: string; certPassword: string; stampImageBase64?: string; userName?: string; userId?: string; x?: number; y?: number; page?: number; }): Promise<void> {
  await signPdfAndReplace(id, certId, certPassword, stampImageBase64, userName, userId, x, y, page);
}
