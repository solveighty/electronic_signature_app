import { useState, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { useDocumentManager } from './useDocumentManager';
import { toast } from 'react-toastify';

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
  const canProceedToPosition = canProceedToPassword && certificatePassword.length >= 4;
  const canSignDocument = canProceedToPosition &&
    signaturePosition.page &&
    signaturePosition.x &&
    signaturePosition.y;

  const handleSignDocument = async () => {
    if (!selectedDocumentId || !certificatePassword || !hasCertificate) {
      setError('Falta información requerida para firmar el documento');
      return;
    }

    try {
      setIsSigningInProgress(true);
      setError(null);

      // Simulación de proceso de firma
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simular URL de documento firmado
      setSignedDocumentUrl('https://ejemplo.com/documento-firmado.pdf');

      setActive(3);
      toast.success('Documento firmado con éxito');
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