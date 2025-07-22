import { useState, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { useDocumentManager } from './useDocumentManager';
import { toast } from 'react-toastify';
import { signPdfWithStamp, signPdfDocument, getPdfDocumentUrl } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export function useSignDocumentLogic() {
  const [active, setActive] = useState(0);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [certificatePassword, setCertificatePassword] = useState('');
  const [signaturePosition, setSignaturePosition] = useState({ page: '1', x: '50', y: '50' });
  const [isSigningInProgress, setIsSigningInProgress] = useState(false);
  const [signedDocumentUrl, setSignedDocumentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const {
    pdfDocuments,
    certificateFile,
    isLoadingDocuments,
    refreshDocuments,
    refreshCertificate,
    hasCertificate
  } = useDocumentManager();

  const { token } = useAuth();

  const selectedDocument = pdfDocuments.find(doc => doc.id === selectedDocumentId);

  const documentOptions = pdfDocuments
    .filter(doc => doc.status === 'Pendiente de firma')
    .map(doc => ({
      value: doc.id.toString(),
      label: doc.name
    }));

  useEffect(() => {
    if (active === 1 && !hasCertificate) {
      setActive(0);
    }
  }, [hasCertificate, active]);

  const handleRefresh = () => {
    refreshCertificate();
    refreshDocuments();
    toast.info('Estado actualizado');
  };

  const canProceedToPassword = hasCertificate && selectedDocumentId;
  const canProceedToPosition = canProceedToPassword && certificatePassword.length >= 1;
  const canSignDocument = canProceedToPosition &&
    signaturePosition.page &&
    signaturePosition.x &&
    signaturePosition.y;

  const handleSignDocument = async () => {
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

      // LOG para depuración
      console.log('Coordenadas que se envían:', signaturePosition);

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

      // Obtener URL del PDF firmado para descargar/previsualizar
      const url = await getPdfDocumentUrl(selectedDocumentId);
      setSignedDocumentUrl(url);

      setActive(3); // Paso final del Stepper: completado
      toast.success('Documento firmado con éxito');
      handleDownloadSignedDocument();
      await refreshDocuments();
    } catch (error: any) {
      setError(error.message || 'Error al firmar el documento');
      toast.error('Error al firmar el documento');
    } finally {
      setIsSigningInProgress(false);
    }
  };

  const handleDownloadSignedDocument = () => {
    if (signedDocumentUrl) {
      window.open(signedDocumentUrl, '_blank');
      toast.info('Descargando documento firmado...');
    }
  };

  const handleReset = () => {
    setActive(0);
    setSelectedDocumentId(null);
    setCertificatePassword('');
    setSignaturePosition({ page: '1', x: '50', y: '50' });
    setSignedDocumentUrl(null);
    setError(null);
  };

  return {
    active,
    setActive,
    selectedDocumentId,
    setSelectedDocumentId,
    certificatePassword,
    setCertificatePassword,
    signaturePosition,
    setSignaturePosition,
    isSigningInProgress,
    signedDocumentUrl,
    error,
    opened,
    open,
    close,
    pdfDocuments,
    certificateFile,
    isLoadingDocuments,
    refreshDocuments,
    refreshCertificate,
    hasCertificate,
    selectedDocument,
    documentOptions,
    handleRefresh,
    canProceedToPassword,
    canProceedToPosition,
    canSignDocument,
    handleSignDocument,
    handleDownloadSignedDocument,
    handleReset,
  };
}
