import { useState, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { useDocumentManager } from './useDocumentManager';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
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
import { toast } from 'react-toastify';
import QRCode from 'qrcode';
import { getPdfDocumentUrl } from '../../utils/api/api';
import { signPdfWithStampBase64, getCertificateUrl } from '../../utils/api/api';

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    pdfDocuments,
    certificateFiles,
    isLoadingDocuments,
    refreshDocuments,
    refreshCertificate,
    hasCertificate,
    fetchDocumentById
  } = useDocumentManager();

  const { token, userName } = useAuth();

  const selectedDocument = pdfDocuments.find(doc => doc.id === selectedDocumentId);
  const selectedCertificateFile = certificateFiles.find(cert => cert.id === selectedCertificateId) ?? null;

  const documentOptions = getDocumentOptions(pdfDocuments);

  useEffect(() => {
    if (active === 1 && !hasCertificate) {
      setActive(0);
    }
  }, [hasCertificate, active]);

  // Función para generar estampa
  const generateStamp = async (userName: string): Promise<string> => {
    const timestamp = new Date().toISOString().substring(0, 10);
    const qrText = `Firma Electrónica:\n${userName}\n${timestamp}\nPUCESE`;

    const qrDataUrl = await QRCode.toDataURL(qrText, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 120,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Crear canvas temporal para generar la estampa
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo crear el canvas');

    return new Promise((resolve) => {
      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      qrImg.onload = () => {
        ctx.font = "14px sans-serif";
        const lines = qrText.split("\n");
        const textWidth = Math.max(...lines.map((line) => ctx.measureText(line).width));
        const padding = 10;
        const width = qrImg.width + textWidth + padding;
        const height = Math.max(qrImg.height, lines.length * 18 + 10);

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(qrImg, 0, 0);

        ctx.fillStyle = "#000";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        lines.forEach((line, i) => {
          ctx.fillText(line, qrImg.width + 8, 8 + i * 18);
        });

        const stampImageBase64 = canvas.toDataURL("image/png");
        resolve(stampImageBase64);
      };
    });
  };

  const handleSignDocument = async () => {
    if (!selectedDocumentId || !selectedCertificateFile || !certificatePassword) {
      toast.error('Faltan datos requeridos para la firma');
      return;
    }

    try {
      setIsSigningInProgress(true);
      setError(null);

      // Generar estampa
      const stampImageBase64 = await generateStamp(userName || 'Usuario');

      // Llamada a la función movida
      await signPdfWithStampBase64(
        selectedDocumentId,
        selectedCertificateFile.id.toString(),
        certificatePassword,
        stampImageBase64,
        userName || 'Usuario',
        parseFloat(signaturePosition.x),
        parseFloat(signaturePosition.y),
        parseInt(signaturePosition.page) - 1,
        token || ''
      );

      // Actualizar estado
      const pdfResponse = await getPdfDocumentUrl(selectedDocumentId);
      setSignedDocumentUrl(pdfResponse || null);
      setActive(3);
      
      toast.success('Documento firmado con éxito');
      await refreshDocuments();

      // Verificar si necesitamos redirigir de vuelta a solicitudes pendientes
      const returnTo = searchParams.get('returnTo');
      const requestId = searchParams.get('requestId');
      
      if (returnTo === 'pending-signatures' && requestId) {
        // Redirigir con parámetros para actualizar el estado
        setTimeout(() => {
          navigate(`/pending-signatures?signed=true&requestId=${requestId}`);
        }, 2000); // Dar tiempo para que el usuario vea el mensaje de éxito
      }
      
    } catch (error: any) {
      console.error('Error al firmar el documento:', error);
      setError(error.message || 'Error al firmar el documento');
      toast.error('Error al firmar el documento');
    } finally {
      setIsSigningInProgress(false);
    }
  };

  // Cuando nos piden preseleccionar un documento que no está cargado aún
  useEffect(() => {
    const handlePreselect = async (e: any) => {
      const id = e?.detail?.id as string | undefined;
      if (!id) return;
      // Si no existe en lista, intentar obtenerlo del backend
      const exists = pdfDocuments.some(d => d.id === id);
      if (!exists) {
        await fetchDocumentById(id);
      }
      setSelectedDocumentId(id);
    };
    window.addEventListener('select-document-for-sign', handlePreselect);
    return () => window.removeEventListener('select-document-for-sign', handlePreselect);
  }, [pdfDocuments]);

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

  const validateCertificatePassword = async (
    certId: string | null,
    password: string
  ): Promise<boolean> => {
    if (!certId || !password.trim()) return false;
    try {
      const url = await getCertificateUrl(certId, password);
      if (url) {
        // Solo usamos esta llamada para validar; revocar el objeto URL inmediatamente
        URL.revokeObjectURL(url);
        return true;
      }
      return false;
    } catch {
      return false;
    }
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
    certificateFiles, 
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
    validateCertificatePassword,
  };
}
