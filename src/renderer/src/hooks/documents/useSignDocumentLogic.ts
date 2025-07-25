import { useState, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { useDocumentManager } from './useDocumentManager';
import { useAuth } from '../../context/AuthContext';
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
import axios from 'axios';
import QRCode from 'qrcode';
import { getPdfDocumentUrl } from '../../utils/api/api';

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

      // Enviar al backend para firmar con estampa con coordenadas dinámicas
      await axios.post("http://localhost:3000/api/sign-pdf", {
        documentId: selectedDocumentId,
        certId: selectedCertificateFile.id.toString(),
        certPassword: certificatePassword,
        stampImageBase64,
        userName: userName || 'Usuario',
        x: parseFloat(signaturePosition.x),
        y: parseFloat(signaturePosition.y),
        page: parseInt(signaturePosition.page) - 1
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Actualizar estado
      const pdfResponse = await getPdfDocumentUrl(selectedDocumentId);
      setSignedDocumentUrl(pdfResponse || null);
      setActive(3);
      
      toast.success('Documento firmado con éxito');
      await refreshDocuments();
      
    } catch (error: any) {
      console.error('Error al firmar el documento:', error);
      setError(error.message || 'Error al firmar el documento');
      toast.error('Error al firmar el documento');
    } finally {
      setIsSigningInProgress(false);
    }
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
  };
}
