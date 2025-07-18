import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";
import { useDarkMode } from '../context/DarkMode';
import {
  Container,
  Title,
  Paper,
  Text,
  Button,
  Center,
  Group,
  Badge,
  Card,
  Box,
  Grid,
  Tabs,
  Loader,
  ActionIcon,
  Modal,
  PasswordInput
} from '@mantine/core';
import {
  IconUpload,
  IconLogout,
  IconFileUpload,
  IconFile,
  IconUser,
  IconCertificate,
  IconFileText,
  IconKey,
  IconRefresh,
  IconSignature,
  IconTrash,
  IconAlertCircle,
  IconLock,
  IconEye,
  IconEyeOff
} from '@tabler/icons-react';
import SignDocument from './SignDocument';
import { toast } from 'react-toastify';
import { useDocumentManager } from '../hooks/useDocumentManager';
import { useDisclosure } from '@mantine/hooks';
import CertificateCreator from './CertificateCreator';

const Dashboard = () => {
  const {
    documents,
    pdfDocuments,
    certificateFile,
    isLoadingPdf,
    isLoadingCertificate,
    isLoadingDocuments,
    refreshCertificate,
    handleFileChange,
    refreshDocuments,
    deleteCertificate,
    deletePdf
  } = useDocumentManager();

  const { setToken, userName } = useAuth();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();

  // Estado para los modales de confirmación
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [deleteCertificateModalOpened, { open: openDeleteCertificateModal, close: closeDeleteCertificateModal }] = useDisclosure(false);

  // Nuevo estado para el modal de confirmación de sobreescritura
  const [overwriteModalOpened, setOverwriteModalOpened] = useState(false);

  // Manejar el cambio de pestañas
  const [activeTab, setActiveTab] = useState('upload');
  // Estado para el modal de clave del certificado
  const [certificateKeyModalOpened, { open: openCertificateKeyModal, close: closeCertificateKeyModal }] = useDisclosure(false);
  const [certificateKey, setCertificateKey] = useState('');
  const [tempCertificateFile, setTempCertificateFile] = useState<File | null>(null);
  const [showCreator, setShowCreator] = useState(false);

  const handleLogout = () => {
    setToken(null);
    toast.info('Sesión cerrada correctamente');
    navigate('/login');
  };

  // Formato de fecha
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

  // Manejar la eliminación de un documento PDF
  const handleDeletePdf = (documentId: string) => {
    setDocumentToDelete(documentId);
    openDeleteModal();
  };

  // Confirmar eliminación de un documento PDF
  const confirmDeletePdf = async () => {
    if (documentToDelete) {
      const success = await deletePdf(documentToDelete);
      if (success) {
        closeDeleteModal();
        setDocumentToDelete(null);
      }
    }
  };

  // Confirmar eliminación de certificado
  const confirmDeleteCertificate = async () => {
    const success = await deleteCertificate();
    if (success) {
      // Limpiar todos los estados
      setTempCertificateFile(null);
      setCertificateKey('');
      closeDeleteCertificateModal();

      // Recargar los documentos para asegurar que el estado está sincronizado
      refreshDocuments();
    }
  };

  // Función para manejar el cambio de pestañas (simplificada para evitar refrescos automáticos)
  const handleTabChange = (value: string | null) => {
    if (value) {
      setActiveTab(value);
      // Eliminamos los refrescos automáticos
    }
  };

  // Función de handleFileChange para mostrar el modal
  const handleCertificateUploadWithKey = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Limpiar estados anteriores 
      setTempCertificateFile(null);
      setCertificateKey('');

      // Validar si es un archivo p12
      if (!file.name.endsWith('.p12') && file.type !== "application/x-pkcs12") {
        toast.error("Solo se permiten archivos P12");
        return;
      }

      // Guardar el archivo temporalmente
      setTempCertificateFile(file);

      // Abrir el modal para solicitar la clave
      openCertificateKeyModal();

      // Limpiar el input para subir nuevamente el archivo
      e.target.value = '';
    }
  };

  // Función para confirmar la subida con la clave
  const confirmCertificateUpload = async () => {
    if (!tempCertificateFile || certificateKey.trim() === '') {
      toast.error("Se requiere un certificado y una clave personal");
      return;
    }

    // Cerrar el modal
    closeCertificateKeyModal();

    // Mostrar la clave en consola, TODO: implementar api - borrar en producción
    console.log("Clave personal insertada", certificateKey);

    try {
      const result = await handleFileChange({
        target: {
          files: [tempCertificateFile]
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>, 'p12', certificateKey);

      // Verificar si la subida fue exitosa
      if (result !== false) {
        // Limpiar estados temporales
        setTempCertificateFile(null);
        setCertificateKey('');

        // Actualizar la lista de documentos para reflejar el cambio
        refreshDocuments();
      }
    } catch (error: any) {
      console.error("Error al procesar el certificado:", error);
      toast.error(`Error al procesar el certificado: ${error.message || "Intente de nuevo"}`);

      // Limpiar también en caso de error
      setTempCertificateFile(null);
      setCertificateKey('');
    }
  };

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
              <Text fw={700}>Hola, {userName || 'Usuario'}</Text>
            </Box>
          </Group>
          <Button
            onClick={toggleDarkMode}
            className='px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded'
          >
            Cambiar a modo {darkMode ? 'claro' : 'oscuro'}
          </Button>
          <Button
            variant="subtle"
            color="gray"
            onClick={handleLogout}
            leftSection={<IconLogout size={18} />}
          >
            Cerrar sesión
          </Button>
        </Group>
      </Paper>

      <Title order={2} mb="lg" ta="center">Firma Electrónica</Title>

      <Tabs value={activeTab}
        onChange={handleTabChange}
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
          <Grid>
            {/* Certificado Digital */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper radius="md" p="xl" withBorder h="100%"
                className='bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'>
                <Center style={{ flexDirection: 'column' }} py="lg">
                  <IconCertificate size={48} color="teal" />
                  <Title order={3} mt="md">Certificado Digital</Title>
                  <Text c="dimmed" mt="xs" mb="lg" ta="center">
                    {certificateFile
                      ? "Ya tienes un certificado. Puedes reemplazarlo si lo necesitas."
                      : "Sube tu archivo .p12 para firmar documentos"}
                  </Text>

                  <Group>
                    <label htmlFor="certificate-upload">
                      <Button
                        component="span"
                        leftSection={<IconKey size={18} />}
                        style={{ cursor: 'pointer' }}
                        loading={isLoadingCertificate}
                        color="teal"
                      >
                        {isLoadingCertificate
                          ? 'Procesando...'
                          : certificateFile
                            ? 'Reemplazar certificado'
                            : 'Seleccionar certificado'}
                        <input
                          id="certificate-upload"
                          name="certificate-upload"
                          type="file"
                          style={{ display: 'none' }}
                          onChange={handleCertificateUploadWithKey}
                          accept=".p12"
                          disabled={isLoadingCertificate}
                        />
                      </Button>
                    </label>

                    {/* Botón para eliminar certificado */}
                    {certificateFile && (
                      <Button
                        color="red"
                        variant="outline"
                        onClick={openDeleteCertificateModal}
                        leftSection={<IconTrash size={18} />}
                        disabled={isLoadingCertificate}
                      >
                        Eliminar
                      </Button>
                    )}
                  </Group>

                  {isLoadingDocuments ? (
                    <Center>
                      <Loader size="sm" />
                    </Center>
                  ) : (
                    certificateFile && (
                      <Box mt="md">
                        <Text size="sm" c="dimmed" mb="xs">Certificado actual:</Text>
                        <Badge color="teal" size="lg" variant="light">
                          {certificateFile.name}
                        </Badge>
                        {certificateFile.createdAt && (
                          <Text size="xs" c="dimmed" mt={5}>
                            Subido el {formatDate(certificateFile.createdAt)}
                          </Text>
                        )}
                      </Box>
                    )
                  )}
                </Center>
              </Paper>
            </Grid.Col>

            {/* Documento PDF */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper radius="md" p="xl" withBorder h="100%"
                className='bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'>
                <Center style={{ flexDirection: 'column' }} py="lg">
                  <IconFileText size={48} color="blue" />
                  <Title order={3} mt="md">Documento PDF</Title>
                  <Text c="dimmed" mt="xs" mb="lg" ta="center">
                    Sube el documento PDF que quieres firmar
                  </Text>

                  <label htmlFor="pdf-upload">
                    <Button
                      component="span"
                      leftSection={<IconFileUpload size={18} />}
                      style={{ cursor: 'pointer' }}
                      loading={isLoadingPdf}
                      color="blue"
                    >
                      {isLoadingPdf ? 'Subiendo...' : 'Seleccionar PDF'}
                      <input
                        id="pdf-upload"
                        name="pdf-upload"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileChange(e, 'pdf')}
                        accept=".pdf"
                        disabled={isLoadingPdf}
                      />
                    </Button>
                  </label>
                </Center>
              </Paper>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="sign" pt="md">
          <SignDocument />
        </Tabs.Panel>

        <Tabs.Panel value="documents" pt="md">
          <Group justify="space-between" mb="md">
            <Title order={4}>Mis Documentos</Title>
            <Button
              variant="subtle"
              leftSection={<IconRefresh size={16} />}
              onClick={refreshDocuments}
              loading={isLoadingDocuments}
            >
              Actualizar
            </Button>
          </Group>

          {isLoadingDocuments ? (
            <Center py="xl">
              <Loader />
            </Center>
          ) : documents.length > 0 ? (
            <>
              {certificateFile && (
                <>
                  <Title order={5} mb="sm">Mi Certificado Digital</Title>
                  <Card withBorder radius="md" mb="lg" padding="md"
                    className='dark:bg-gray-800 dark:shadow-lg dark:rounded-lg dark:text-gray-100'>
                    <Group justify="space-between" align="flex-start">
                      <Group align="flex-start" wrap="nowrap">
                        <IconCertificate size={20} style={{ marginTop: 4 }} />
                        <Box>
                          <Text fw={500}>{certificateFile.name}</Text>
                          {certificateFile.createdAt && (
                            <Text size="xs" c="dimmed">
                              Subido el {formatDate(certificateFile.createdAt)}
                            </Text>
                          )}
                        </Box>
                      </Group>
                      <Group>
                        <Badge color="teal" variant="filled">
                          {certificateFile.status || "CERTIFICADO DISPONIBLE"}
                        </Badge>
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={openDeleteCertificateModal}
                          disabled={isLoadingCertificate}
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                </>
              )}

              {pdfDocuments.length > 0 && (
                <>
                  <Title order={5} mb="sm">Mis Documentos PDF</Title>

                  {/* Tabla de cabecera */}
                  <Paper withBorder p="xs" mb="xs" radius="md">
                    <Group grow gap={0} justify="space-between">
                      <Text fw={700} size="sm" pl={8}>Nombre del documento</Text>
                      <Text fw={700} size="sm" style={{ maxWidth: '180px' }}>Fecha de subida</Text>
                      <Text fw={700} size="sm" ta="center">Estado</Text>
                      <Text fw={700} size="sm" ta="center" style={{ maxWidth: '80px' }}>Acción</Text>
                    </Group>
                  </Paper>

                  {/* Filas de documentos */}
                  {pdfDocuments.map((doc) => (
                    <Paper key={doc.id} withBorder p="xs" mb="xs" radius="md">
                      <Group grow gap={0} justify="space-between" align="center">
                        <Group wrap="nowrap" gap="xs">
                          <IconFile size={20} />
                          <Text lineClamp={1}>
                            {doc.name}
                          </Text>
                        </Group>

                        <Text size="sm" c="dimmed" style={{ maxWidth: '180px' }}>
                          {doc.createdAt && formatDate(doc.createdAt)}
                        </Text>

                        <Box ta="center">
                          <Badge
                            color={doc.status === "Firmado" ? "green" : "yellow"}
                            variant="filled"
                          >
                            {doc.status}
                          </Badge>
                        </Box>

                        <Box ta="center" style={{ maxWidth: '80px' }}>
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => handleDeletePdf(doc.id.toString())}
                            disabled={isLoadingPdf}
                            mx="auto"
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Box>
                      </Group>
                    </Paper>
                  ))}
                </>
              )}
            </>
          ) : (
            <Center py="xl">
              <Text c="dimmed">Aún no has subido ningún archivo</Text>
            </Center>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="create-certificate" pt="md">
          <Group justify="center">
            <Button
              onClick={() => {
                if (certificateFile) {
                  setOverwriteModalOpened(true);
                } else {
                  setShowCreator((prev) => !prev);
                }
              }}
              color={showCreator ? "red" : "teal"}
              leftSection={<IconCertificate size={18} />}
            >
              {showCreator ? 'Cancelar' : 'Crear Certificado'}
            </Button>
          </Group>

          {showCreator && (
            <Box mt="xl">
              <CertificateCreator onSuccess={() => {
                setShowCreator(false);
                refreshCertificate();
                refreshDocuments();
              }} />
            </Box>
          )}

          {/* Modal de confirmación para sobreescribir certificado */}
          <Modal
            opened={overwriteModalOpened}
            onClose={() => setOverwriteModalOpened(false)}
            title={
              <Group>
                <IconAlertCircle size={20} color="orange" />
                <Text fw={700}>Sobrescribir certificado</Text>
              </Group>
            }
            centered
          >
            <Text mb="xl">
              Actualmente ya cuentas con un certificado digital. ¿Deseas sobrescribirlo? Esta acción reemplazará tu certificado actual.
            </Text>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setOverwriteModalOpened(false)}>
                Cancelar
              </Button>
              <Button
                color="teal"
                onClick={() => {
                  setOverwriteModalOpened(false);
                  setShowCreator(true);
                }}
              >
                Sí, sobrescribir
              </Button>
            </Group>
          </Modal>
        </Tabs.Panel>
      </Tabs>

      {/* Modal de confirmación para eliminar PDF */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
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
          <Button variant="default" onClick={closeDeleteModal}>
            Cancelar
          </Button>
          <Button color="red" onClick={confirmDeletePdf} loading={isLoadingPdf}>
            Eliminar
          </Button>
        </Group>
      </Modal>

      {/* Modal de confirmación para eliminar certificado */}
      <Modal
        opened={deleteCertificateModalOpened}
        onClose={closeDeleteCertificateModal}
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
          <Button variant="default" onClick={closeDeleteCertificateModal}>
            Cancelar
          </Button>
          <Button color="red" onClick={confirmDeleteCertificate} loading={isLoadingCertificate}>
            Eliminar certificado
          </Button>
        </Group>
      </Modal>

      {/* Modal para solicitar clave personal */}
      <Modal
        opened={certificateKeyModalOpened}
        onClose={closeCertificateKeyModal}
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
          value={certificateKey}
          onChange={(e) => setCertificateKey(e.target.value)}
          required
          mb="xl"
          leftSection={<IconLock size={16} />}
          visibilityToggleIcon={({ reveal }) =>
            reveal ? <IconEyeOff size={16} /> : <IconEye size={16} />
          }
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={() => {
            closeCertificateKeyModal();
            setTempCertificateFile(null);
            setCertificateKey('');
          }}>
            Cancelar
          </Button>
          <Button
            color="teal"
            onClick={confirmCertificateUpload}
            disabled={certificateKey.trim() === ''}
          >
            Confirmar
          </Button>
        </Group>
      </Modal>
    </Container>
  );
};

export default Dashboard;