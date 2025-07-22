import { Container, Title, Paper, Text, Button, Group, Box, Tabs, Modal, PasswordInput } from '@mantine/core';
import { IconUpload, IconLogout, IconFile, IconUser, IconCertificate, IconSignature, IconAlertCircle, IconLock, IconEye, IconEyeOff } from '@tabler/icons-react';
import { useDashboardLogic } from '../hooks/index/useDashboardLogic';
import UploadPanel from '../components/Dashboard/Tabs/UploadPanel';
import SignPanel from '../components/Dashboard/Tabs/SignPanel';
import DocumentsPanel from '../components/Dashboard/Tabs/DocumentsPanel';
import CreateCertificatePanel from '../components/Dashboard/Tabs/CreateCertificatePanel';

const Dashboard = () => {
  const logic = useDashboardLogic();

  return (
    <Container size="lg" py={40}
      className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header con saludo personalizado */}
      <Paper radius="md" p="md" withBorder mb="lg"
        className='bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
      >
        <Group justify="space-between" align="center">
          <Group>
            <IconUser size={24} />
            <Box>
              <Text size="sm" c="dimmed">Bienvenido</Text>
              <Text fw={700}>Hola, {logic.userName || 'Usuario'}</Text>
            </Box>
          </Group>
          <Button
            onClick={logic.toggleDarkMode}
            className='px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded'
          >
            Cambiar a modo {logic.darkMode ? 'claro' : 'oscuro'}
          </Button>
          <Button
            variant="subtle"
            color="gray"
            onClick={logic.handleLogout}
            leftSection={<IconLogout size={18} />}
          >
            Cerrar sesión
          </Button>
        </Group>
      </Paper>

      <Title order={2} mb="lg" ta="center">Firma Electrónica</Title>

      <Tabs value={logic.activeTab}
        onChange={logic.handleTabChange}
        mb="xl"

      >
        <Tabs.List grow
          >
          <Tabs.Tab value="upload" leftSection={<IconUpload size={16} />}>
            Subir Archivos
          </Tabs.Tab>
          <Tabs.Tab value="sign" leftSection={<IconSignature size={16} />}>
            Firmar Documentos
          </Tabs.Tab>
          <Tabs.Tab value="documents" leftSection={<IconFile size={16} />}
          >
            Mis Documentos
          </Tabs.Tab>
          <Tabs.Tab value="create-certificate" leftSection={<IconCertificate size={16} />}>
            Crear Certificado
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="upload" pt="md">
          <UploadPanel logic={logic} />
        </Tabs.Panel>

        <Tabs.Panel value="sign" pt="md">
          <SignPanel />
        </Tabs.Panel>

        <Tabs.Panel value="documents" pt="md">
          <DocumentsPanel logic={logic} />
        </Tabs.Panel>

        <Tabs.Panel value="create-certificate" pt="md">
          <CreateCertificatePanel logic={logic} />
        </Tabs.Panel>
      </Tabs>

      {/* Modal de confirmación para eliminar PDF */}
      <Modal
        opened={logic.deleteModalOpened}
        onClose={logic.closeDeleteModal}
        title={
          <Group>
            <IconAlertCircle size={20} color="red" />
            <Text fw={700}>Eliminar documento</Text>
          </Group>
        }
        centered
      >
        <Text mb="xl">
          ¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={logic.closeDeleteModal}>
            Cancelar
          </Button>
          <Button color="red" onClick={logic.confirmDeletePdf} loading={logic.isLoadingPdf}>
            Eliminar
          </Button>
        </Group>
      </Modal>

      {/* Modal de confirmación para eliminar certificado */}
      <Modal
        opened={logic.deleteCertificateModalOpened}
        onClose={logic.closeDeleteCertificateModal}
        title={
          <Group>
            <IconAlertCircle size={20} color="red" />
            <Text fw={700}>Eliminar certificado</Text>
          </Group>
        }
        centered
      >
        <Text mb="xl">
          ¿Estás seguro de que deseas eliminar tu certificado digital? Esta acción no se puede deshacer y no podrás firmar documentos hasta que subas un nuevo certificado.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={logic.closeDeleteCertificateModal}>
            Cancelar
          </Button>
          <Button color="red" onClick={logic.confirmDeleteCertificate} loading={logic.isLoadingCertificate}>
            Eliminar certificado
          </Button>
        </Group>
      </Modal>

      {/* Modal para solicitar clave personal */}
      <Modal
        opened={logic.certificateKeyModalOpened}
        onClose={logic.closeCertificateKeyModal}
        title={
          <Group>
            <IconLock size={20} color="teal" />
            <Text fw={700}>Clave personal</Text>
          </Group>
        }
        centered
      >
        <Text mb="md">
          Ingresa una clave personal para proteger tu certificado digital. Esta clave será
          utilizada como segunda capa de seguridad y deberás recordarla para futuras operaciones.
        </Text>

        <PasswordInput
          label="Clave personal"
          placeholder="Ingresa una clave personal segura"
          value={logic.certificateKey}
          onChange={(e) => logic.setCertificateKey(e.target.value)}
          required
          mb="xl"
          leftSection={<IconLock size={16} />}
          visibilityToggleIcon={({ reveal }) =>
            reveal ? <IconEyeOff size={16} /> : <IconEye size={16} />
          }
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={() => {
            logic.closeCertificateKeyModal();
            logic.setTempCertificateFile(null);
            logic.setCertificateKey('');
          }}>
            Cancelar
          </Button>
          <Button
            color="teal"
            onClick={logic.confirmCertificateUpload}
            disabled={logic.certificateKey.trim() === ''}
          >
            Confirmar
          </Button>
        </Group>
      </Modal>
    </Container>
  );
};

export default Dashboard;