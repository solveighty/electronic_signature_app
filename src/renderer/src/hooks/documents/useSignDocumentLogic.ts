import { useState, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { useDocumentManager } from './useDocumentManager';
import { useAuth } from '../../context/AuthContext';
import {
  handleSignDocumentLogic,
  handleDownloadSignedDocumentLogic,
  handleRefreshLogic,
  handleResetLogic,
} from './pdf/signer/signDocumentLogic';
import { getDocumentOptions } from './pdf/crud/options/getDocumentOptions';
import {
  canProceedToPassword,
  canProceedToPosition,
  canSignDocument
} from './pdf/validatorSteps/stepValidation';
import { CertificateFileType } from './types/CertificateFileType';

export function useSignDocumentLogic() {
  const [active, setActive] = useState(0);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedCertificateId, setSelectedCertificateId] = useState<string | null>(null);
  const [certificatePassword, setCertificatePassword] = useState('');
  const [signaturePosition, setSignaturePosition] = useState({ page: '1', x: '50', y: '50' });
  const [isSigningInProgress, setIsSigningInProgress] = useState(false);
  const [signedDocumentUrl, setSignedDocumentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);

  const {
    pdfDocuments,
    certificateFiles,
    isLoadingDocuments,
    refreshDocuments,
    refreshCertificate,
    hasCertificate
  } = useDocumentManager();

  const { token } = useAuth();

  const selectedDocument = pdfDocuments.find(doc => doc.id === selectedDocumentId);
  const selectedCertificateFile = certificateFiles.find(cert => cert.id === selectedCertificateId) ?? null;

  const documentOptions = getDocumentOptions(pdfDocuments);

  useEffect(() => {
    if (active === 1 && !hasCertificate) {
      setActive(0);
    }
  }, [hasCertificate, active]);

  const handleSignDocument = async () => {
    await handleSignDocumentLogic({
      selectedDocumentId,
      certificatePassword,
      hasCertificate,
      certificateFile: selectedCertificateFile,
      signaturePosition,
      token,
      setIsSigningInProgress,
      setError,
      setSignedDocumentUrl,
      setActive,
      refreshDocuments,
      handleDownloadSignedDocument,
    });
  };

  const handleDownloadSignedDocument = () => {
    handleDownloadSignedDocumentLogic(signedDocumentUrl);
  };

  const handleRefresh = () => {
    handleRefreshLogic(refreshCertificate, refreshDocuments);
  };

  const handleReset = () => {
    handleResetLogic(
      setActive,
      setSelectedDocumentId,
      setCertificatePassword,
      setSignaturePosition,
      setSignedDocumentUrl,
      setError
    );
  };

  const canProceedToPasswordValue = canProceedToPassword(hasCertificate, selectedDocumentId);
  const canProceedToPositionValue = canProceedToPosition(canProceedToPasswordValue, certificatePassword);
  const canSignDocumentValue = canSignDocument(canProceedToPositionValue, signaturePosition);

  return {
    active,
    setActive,
    selectedDocumentId,
    setSelectedDocumentId,
    selectedCertificateId,
    setSelectedCertificateId,
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
    certificateFiles, // <-- Cambia aquí
    selectedCertificateFile,
    isLoadingDocuments,
    refreshDocuments,
    refreshCertificate,
    hasCertificate,
    selectedDocument,
    documentOptions,
    handleRefresh,
    canProceedToPassword: canProceedToPasswordValue,
    canProceedToPosition: canProceedToPositionValue,
    canSignDocument: canSignDocumentValue,
    handleSignDocument,
    handleDownloadSignedDocument,
    handleReset,
  };
}
