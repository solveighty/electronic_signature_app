import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from "react-router-dom";
import { useDarkMode } from '../../context/DarkMode';
import { useDocumentManager } from '../documents/useDocumentManager';
import { useDisclosure } from '@mantine/hooks';
import { toast } from 'react-toastify';
import { deleteCertificateById } from '../../utils/api/api';
import { getCertificateUrl } from '../../utils/api/api';

export function useDashboardLogic() {
  const {
    documents,
    pdfDocuments,
    certificateFiles,
    isLoadingPdf,
    isLoadingDocuments,
    refreshCertificate,
    handleFileChange,
    refreshDocuments,
    deleteCertificate,
    deletePdf,
    getPdfDocumentUrl
  } = useDocumentManager();

  const { setToken, userName, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();

  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [deleteCertificateModalOpened, { open: openDeleteCertificateModal, close: closeDeleteCertificateModal }] = useDisclosure(false);
  const [overwriteModalOpened, setOverwriteModalOpened] = useState(false);
  const [activeTab, setActiveTab] = useState(isAdmin ? 'create-certificate' : 'upload');

  useEffect(() => {
    setActiveTab(isAdmin ? 'create-certificate' : 'upload');
  }, [isAdmin]);
  const [certificateKeyModalOpened, { open: openCertificateKeyModal, close: closeCertificateKeyModal }] = useDisclosure(false);
  const [certificateKey, setCertificateKey] = useState('');
  const [tempCertificateFile, setTempCertificateFile] = useState<File | null>(null);
  const [showCreator, setShowCreator] = useState(false);

  const [selectedCertId, setSelectedCertId] = useState<string | null>(null);
  const [isLoadingCertificateLocal, setIsLoadingCertificateLocal] = useState(false);

  const handleLogout = () => {
    setToken(null);
    toast.info('Sesión cerrada correctamente');
    navigate('/login');
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeletePdf = (documentId: string) => {
    setDocumentToDelete(documentId);
    openDeleteModal();
  };

  const confirmDeletePdf = async () => {
    if (documentToDelete) {
      const success = await deletePdf(documentToDelete);
      if (success) {
        closeDeleteModal();
        setDocumentToDelete(null);
      }
    }
  };

  const confirmDeleteCertificate = async (certId: string | null) => {
    if (!certId) return;
    setIsLoadingCertificateLocal(true);
    try {
      await deleteCertificateById(certId);
      setIsLoadingCertificateLocal(false);
      setSelectedCertId(null);
      closeDeleteCertificateModal();
      refreshCertificate();
      refreshDocuments();
      toast.success('Certificado eliminado correctamente');
    } catch (error) {
      setIsLoadingCertificateLocal(false);
      toast.error('No se pudo eliminar el certificado');
    }
  };

  const handleTabChange = (value: string | null) => {
    if (value) setActiveTab(value);
  };

  const handleCertificateUploadWithKey = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setTempCertificateFile(null);
      setCertificateKey('');
      if (!file.name.endsWith('.p12') && file.type !== "application/x-pkcs12") {
        toast.error("Solo se permiten archivos P12");
        return;
      }
      setTempCertificateFile(file);
      openCertificateKeyModal();
      e.target.value = '';
    }
  };

  const confirmCertificateUpload = async () => {
    if (!tempCertificateFile || certificateKey.trim() === '') {
      toast.error("Se requiere un certificado y una clave personal");
      return;
    }
    if (certificateKey.length < 8) {
      toast.error("La clave debe tener al menos 8 caracteres");
      return;
    }
    closeCertificateKeyModal();
    try {
      const result = await handleFileChange({
        target: {
          files: [tempCertificateFile]
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>, 'p12', certificateKey);

      if (result !== false) {
        setTempCertificateFile(null);
        setCertificateKey('');
        refreshDocuments();
      }
    } catch (error: any) {
      toast.error(`Error al procesar el certificado: ${error.message || "Intente de nuevo"}`);
      setTempCertificateFile(null);
      setCertificateKey('');
    }
  };

  const handleDownloadPdf = async (documentId: string) => {
    const url = await getPdfDocumentUrl(documentId);
    if (url) {
      window.open(url, '_blank');
      toast.info('Descargando documento firmado...');
    } else {
      toast.error('No se pudo descargar el documento.');
    }
  };

  return {
    documents,
    pdfDocuments,
    certificateFiles,
    isLoadingPdf,
    isLoadingCertificate: isLoadingCertificateLocal,
    isLoadingDocuments,
    refreshCertificate,
    handleFileChange,
    refreshDocuments,
    deleteCertificate,
    deletePdf,
    setToken,
    userName,
    isAdmin,
    navigate,
    darkMode,
    toggleDarkMode,
    deleteModalOpened,
    openDeleteModal,
    closeDeleteModal,
    documentToDelete,
    setDocumentToDelete,
    deleteCertificateModalOpened,
    openDeleteCertificateModal,
    closeDeleteCertificateModal,
    overwriteModalOpened,
    setOverwriteModalOpened,
    activeTab,
    setActiveTab,
    certificateKeyModalOpened,
    openCertificateKeyModal,
    closeCertificateKeyModal,
    certificateKey,
    setCertificateKey,
    tempCertificateFile,
    setTempCertificateFile,
    showCreator,
    setShowCreator,
    handleLogout,
    formatDate,
    handleDeletePdf,
    confirmDeletePdf,
    confirmDeleteCertificate,
    handleTabChange,
    handleCertificateUploadWithKey,
    confirmCertificateUpload,
    handleDownloadPdf,
    selectedCertId,
    setSelectedCertId,
    getCertificateUrl
  };
}