import forge from 'node-forge';
import { plainAddPlaceholder } from 'node-signpdf';
import { sign } from 'node-signpdf'; 
import {
    decryptandretrieveCertificate,
    deleteCertificate,
} from './crtService';
import {
    retrievePdfDocument,
    updateSignedPdf,
} from './pdfService';

export async function signPdfAndReplace(
    documentId: string,
    certId: string,
    certPassword: string
): Promise<void> {
    try {
        const pdfBuffer = await retrievePdfDocument(documentId);
        const p12Buffer = await decryptandretrieveCertificate(certId, certPassword);

        const pdfWithPlaceholder = plainAddPlaceholder({
            pdfBuffer,
            reason: 'Firmado digitalmente',
            signatureLength: 8192,
        });

        const p12Der = forge.util.createBuffer(p12Buffer.toString('binary'));
        const p12Asn1 = forge.asn1.fromDer(p12Der);
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, certPassword);

        const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
        const keyBagArray = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag];
        if (!keyBagArray || keyBagArray.length === 0 || !keyBagArray[0].key) {
            throw new Error('No se encontró la clave privada en el certificado');
        }
        const privateKeyPem = forge.pki.privateKeyToPem(keyBagArray[0].key);

        const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
        const certBagArray = certBags[forge.pki.oids.certBag];
        if (!certBagArray || certBagArray.length === 0 || !certBagArray[0].cert) {
            throw new Error('No se encontró el certificado X.509 en el .p12');
        }
        const certPem = forge.pki.certificateToPem(certBagArray[0].cert);

        // Usar la función sign directamente
        const signedPdf = sign(pdfWithPlaceholder, {
            key: Buffer.from(privateKeyPem),
            cert: Buffer.from(certPem),
            passphrase: certPassword,
        });

        await updateSignedPdf(documentId, signedPdf);
        await deleteCertificate(certId);

        console.log('Documento firmado y certificado eliminado correctamente.');
    } catch (error) {
        console.error('Error durante el proceso de firma:', error);
        throw new Error('Fallo al firmar el documento');
    }
}
