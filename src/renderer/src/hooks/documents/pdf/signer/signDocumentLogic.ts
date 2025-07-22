import { toast } from 'react-toastify';
import { signPdfWithStamp, signPdfDocument, getPdfDocumentUrl } from '../../../../utils/api/api';

export async function handleSignDocumentLogic({
  selectedDocumentId,
  certificatePassword,
  hasCertificate,
  certificateFile,
  signaturePosition,
  token,
  setIsSigningInProgress,
  setError,
  setSignedDocumentUrl,
  setActive,
  refreshDocuments,
  handleDownloadSignedDocument,
}: {
  selectedDocumentId: string | null;
  certificatePassword: string;
  hasCertificate: boolean;
  certificateFile: { id: string | number } | null;
  signaturePosition: { page: string; x: string; y: string };
  token: string | null;
  setIsSigningInProgress: (v: boolean) => void;
  setError: (v: string | null) => void;
  setSignedDocumentUrl: (v: string | null) => void;
  setActive: (v: number) => void;
  refreshDocuments: () => Promise<void>;
  handleDownloadSignedDocument: () => void;
}) {
  if (!selectedDocumentId || !certificatePassword || !hasCertificate || !certificateFile?.id) {
    setError('Falta información requerida para firmar el documento');
    return;
  }

  try {
    setIsSigningInProgress(true);
    setError(null);

    const canvas = document.querySelector('#signature-stamp-canvas') as HTMLCanvasElement;
    let stampBlob: Blob | null = null;
    if (canvas) {
      stampBlob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((blob) => resolve(blob), 'image/png')
      );
    }

    if (stampBlob) {
      await signPdfWithStamp(
        selectedDocumentId,
        certificateFile.id.toString(),
        certificatePassword,
        stampBlob,
        token || '',
        Number(signaturePosition.page),
        Number(signaturePosition.x),
        Number(signaturePosition.y)
      );
    } else {
      await signPdfDocument(
        selectedDocumentId,
        certificateFile.id.toString(),
        certificatePassword,
        token || ''
      );
    }

    const url = await getPdfDocumentUrl(selectedDocumentId);
    setSignedDocumentUrl(url);

    setActive(3);
    toast.success('Documento firmado con éxito');
    handleDownloadSignedDocument();
    await refreshDocuments();
  } catch (error: any) {
    setError(error.message || 'Error al firmar el documento');
    toast.error('Error al firmar el documento');
  } finally {
    setIsSigningInProgress(false);
  }
}

export function handleDownloadSignedDocumentLogic(signedDocumentUrl: string | null) {
  if (signedDocumentUrl) {
    window.open(signedDocumentUrl, '_blank');
    toast.info('Descargando documento firmado...');
  }
}

export function handleRefreshLogic(refreshCertificate: () => void, refreshDocuments: () => void) {
  refreshCertificate();
  refreshDocuments();
  toast.info('Estado actualizado');
}

export function handleResetLogic(
  setActive: (v: number) => void,
  setSelectedDocumentId: (v: string | null) => void,
  setCertificatePassword: (v: string) => void,
  setSignaturePosition: (v: { page: string; x: string; y: string }) => void,
  setSignedDocumentUrl: (v: string | null) => void,
  setError: (v: string | null) => void
) {
  setActive(0);
  setSelectedDocumentId(null);
  setCertificatePassword('');
  setSignaturePosition({ page: '1', x: '50', y: '50' });
  setSignedDocumentUrl(null);
  setError(null);
}