import { Container, Title, Tabs } from "@mantine/core";
import {
  IconUpload,
  IconFile,
  IconCertificate,
  IconSignature,
} from "@tabler/icons-react";
import { useDashboardLogic } from "../../hooks/index/useDashboardLogic";
import UploadPanel from "../../components/Dashboard/Tabs/UploadPanel";
import SignPanel from "../../components/Dashboard/Tabs/SignPanel";
import DocumentsPanel from "../../components/Dashboard/Tabs/DocumentsPanel";
import CreateCertificatePanel from "../../components/Dashboard/Tabs/CreateCertificatePanel";
import DeletePdfModal from "../../components/Dashboard/Modals/DeletePdfModal";
import DeleteCertificateModal from "../../components/Dashboard/Modals/DeleteCertificateModal";
import CertificateKeyModal from "../../components/Dashboard/Modals/CertificateKeyModal";
import DashboardHeader from "../../components/Dashboard/Header/DashboardHeader";

const Dashboard = () => {
  const logic = useDashboardLogic();

  return (
    <Container
      size="lg"
      py={40}
      className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
    >
      {/* Header con saludo personalizado */}
      <DashboardHeader
        userName={logic.userName ?? ""}
        darkMode={logic.darkMode}
        onToggleDarkMode={logic.toggleDarkMode}
        onLogout={logic.handleLogout}
      />

      {/* Título principal del Dashboard */}
      <Title order={2} mb="lg" ta="center">
        Firma Electrónica
      </Title>

      <Tabs value={logic.activeTab} onChange={logic.handleTabChange} mb="xl">
        <Tabs.List grow>
          {/* Solo mostrar la pestaña de subir si el usuario tiene permisos */}
          <Tabs.Tab value="upload" leftSection={<IconUpload size={16} />}>
            Subir Archivos
          </Tabs.Tab>
          {/* Solo mostrar la pestaña de firmar si el usuario tiene documentos */}
          <Tabs.Tab value="sign" leftSection={<IconSignature size={16} />}>
            Firmar Documentos
          </Tabs.Tab>
          {/* Solo mostrar la pestaña de documentos si el usuario tiene documentos */}
          <Tabs.Tab value="documents" leftSection={<IconFile size={16} />}>
            Mis Documentos
          </Tabs.Tab>
          {/* Solo mostrar la pestaña de certificados si el usuario tiene certificados */}
          <Tabs.Tab
            value="create-certificate"
            leftSection={<IconCertificate size={16} />}
          >
            Crear Certificado
          </Tabs.Tab>
        </Tabs.List>

        {/* Paneles de contenido para cada pestaña */}
        <Tabs.Panel value="upload" pt="md">
          <UploadPanel logic={logic} />
        </Tabs.Panel>

        {/* Panel para firmar documentos */}
        <Tabs.Panel value="sign" pt="md">
          <SignPanel />
        </Tabs.Panel>

        {/* Panel para mostrar documentos subidos */}

        <Tabs.Panel value="documents" pt="md">
          <DocumentsPanel logic={logic} />
        </Tabs.Panel>

        {/* Panel para crear certificados */}
        <Tabs.Panel value="create-certificate" pt="md">
          <CreateCertificatePanel logic={logic} />
        </Tabs.Panel>
      </Tabs>

      {/* Modal de confirmación para eliminar PDF */}
      <DeletePdfModal
        opened={logic.deleteModalOpened}
        onClose={logic.closeDeleteModal}
        onConfirm={logic.confirmDeletePdf}
        loading={logic.isLoadingPdf}
      />

      {/* Modal de confirmación para eliminar certificado */}
      <DeleteCertificateModal
        opened={logic.deleteCertificateModalOpened}
        onClose={logic.closeDeleteCertificateModal}
        onConfirm={logic.confirmDeleteCertificate}
        loading={logic.isLoadingCertificate}
      />

      {/* Modal para solicitar clave personal */}
      <CertificateKeyModal
        opened={logic.certificateKeyModalOpened}
        onClose={logic.closeCertificateKeyModal}
        onConfirm={logic.confirmCertificateUpload}
        value={logic.certificateKey}
        onChange={logic.setCertificateKey}
        onCancel={() => {
          logic.closeCertificateKeyModal();
          logic.setTempCertificateFile(null);
          logic.setCertificateKey("");
        }}
      />
    </Container>
  );
};

export default Dashboard;
