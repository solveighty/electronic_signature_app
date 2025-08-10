import { useEffect } from "react";
import { Container, Title, Tabs, Button, Group } from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
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
import DeletePdfModal from "../../components/Dashboard/Modals/DeletePdfModal";
import DeleteCertificateModal from "../../components/Dashboard/Modals/DeleteCertificateModal";
import CertificateKeyModal from "../../components/Dashboard/Modals/CertificateKeyModal";
import DashboardHeader from "../../components/Dashboard/Header/DashboardHeader";
import AdminCertificateRequestsPanel from "../../components/Dashboard/Tabs/AdminCertificateRequestsPanel";

const Dashboard = () => {
  const logic = useDashboardLogic();
  const navigate = useNavigate();
  const location = useLocation();

  // Al llegar con /main?tab=sign&doc=<id>, cambiar pestaña y precargar documento
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    const doc = params.get('doc');
    if (!logic.isAdmin && tab === 'sign') {
      logic.handleTabChange('sign');
      if (doc) {
        // Defer para asegurar que el Sign Panel esté montado
        setTimeout(() => {
          const evt = new CustomEvent('select-document-for-sign', { detail: { id: doc } });
          window.dispatchEvent(evt);
        }, 0);
      }
    }
  }, [location.search, logic.isAdmin]);

  return (
    <Container
      size="lg"
      py={40}
      className="min-h-screen"
    >
      {/* Header con saludo personalizado */}
      <DashboardHeader
        userName={logic.userName ?? ""}
        darkMode={logic.darkMode}
        onToggleDarkMode={logic.toggleDarkMode}
        onLogout={logic.handleLogout}
      />

      {/* Título principal del Dashboard */}

    <Group justify="space-between" mb="md">
        <Title order={2} ta="center">
          Firma Electrónica
        </Title>
        {!logic.isAdmin && (
          <Group>
            <Button onClick={() => navigate("/add-friends")}
              variant="outline" color="blue">
              Agregar amigos
            </Button>
            <Button onClick={() => navigate("/friends")}
              variant="outline" color="teal">
              Ver amigos y solicitudes
            </Button>
            <Button onClick={() => navigate("/pending-signatures")}
              variant="outline" color="orange">
              Documentos para firmar
            </Button>
          </Group>
        )}
      </Group>

      <Tabs value={logic.activeTab} onChange={logic.handleTabChange} mb="xl">
        <Tabs.List grow>
          {logic.isAdmin ? (
            <Tabs.Tab
              value="admin-certificate-requests"
              leftSection={<IconCertificate size={16} />}
            >
              Solicitudes de Certificado
            </Tabs.Tab>
          ) : (
            <>
              <Tabs.Tab value="upload" leftSection={<IconUpload size={16} />}>
                Subir Archivos
              </Tabs.Tab>
              <Tabs.Tab value="sign" leftSection={<IconSignature size={16} />}>
                Firmar Documentos
              </Tabs.Tab>
              <Tabs.Tab value="documents" leftSection={<IconFile size={16} />}>
                Mis Documentos
              </Tabs.Tab>
            </>
          )}
        </Tabs.List>

        {logic.isAdmin ? (
          <Tabs.Panel value="admin-certificate-requests" pt="md">
            <AdminCertificateRequestsPanel />
          </Tabs.Panel>
        ) : (
          <>
            <Tabs.Panel value="upload" pt="md">
              <UploadPanel logic={logic} />
            </Tabs.Panel>
            <Tabs.Panel value="sign" pt="md">
              <SignPanel />
            </Tabs.Panel>
            <Tabs.Panel value="documents" pt="md">
              <DocumentsPanel logic={logic} />
            </Tabs.Panel>
          </>
        )}
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
        onConfirm={() => logic.confirmDeleteCertificate(logic.selectedCertId)}
        loading={logic.isLoadingCertificate}
        logic={logic}
        selectedCertId={logic.selectedCertId}
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
