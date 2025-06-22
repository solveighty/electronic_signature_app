import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";
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
  Divider,
  Box,
  Grid,
  Tabs,
  Loader,
  ActionIcon,
  Modal
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
  IconAlertCircle
} from '@tabler/icons-react';
import SignDocument from './SignDocument';
import { toast } from 'react-toastify';
import { useDocumentManager } from '../hooks/useDocumentManager';
import { useDisclosure } from '@mantine/hooks';

const Dashboard = () => {
  const { 
    documents, 
    pdfDocuments, 
    certificateFile, 
    isLoading, 
    isLoadingDocuments, 
    handleFileChange, 
    refreshDocuments,
    deleteCertificate,
    deletePdf
  } = useDocumentManager();
  
  const { setToken, userName } = useAuth();
  const navigate = useNavigate();

  // Estado para los modales de confirmación
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [deleteCertificateModalOpened, { open: openDeleteCertificateModal, close: closeDeleteCertificateModal }] = useDisclosure(false);

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
      closeDeleteCertificateModal();
    }
  };

  return (
    <Container size="lg" py={40}>
      {/* Header con saludo personalizado */}
      <Paper radius="md" p="md" withBorder mb="lg">
        <Group justify="space-between" align="center">
          <Group>
            <IconUser size={24} />
            <Box>
              <Text size="sm" c="dimmed">Bienvenido</Text>
              <Text fw={700}>Hola, {userName || 'Usuario'}</Text>
            </Box>
          </Group>
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

      <Tabs defaultValue="upload" mb="xl">
        <Tabs.List grow>
          <Tabs.Tab value="upload" leftSection={<IconUpload size={16} />}>
            Subir Archivos
          </Tabs.Tab>
          <Tabs.Tab value="sign" leftSection={<IconSignature size={16} />}>
            Firmar Documentos
          </Tabs.Tab>
          <Tabs.Tab value="documents" leftSection={<IconFile size={16} />}>
            Mis Documentos
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="upload" pt="md">
          <Grid>
            {/* Certificado Digital */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper radius="md" p="xl" withBorder h="100%">
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
                        loading={isLoading}
                        color="teal"
                      >
                        {isLoading 
                          ? 'Procesando...' 
                          : certificateFile 
                            ? 'Reemplazar certificado' 
                            : 'Seleccionar certificado'}
                        <input
                          id="certificate-upload"
                          name="certificate-upload"
                          type="file"
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileChange(e, 'p12')}
                          accept=".p12"
                          disabled={isLoading}
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
                        disabled={isLoading}
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
              <Paper radius="md" p="xl" withBorder h="100%">
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
                      loading={isLoading}
                      color="blue"
                    >
                      {isLoading ? 'Subiendo...' : 'Seleccionar PDF'}
                      <input
                        id="pdf-upload"
                        name="pdf-upload"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileChange(e, 'pdf')}
                        accept=".pdf"
                        disabled={isLoading}
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
                  <Card withBorder radius="md" mb="lg" padding="md">
                    <Group justify="space-between" align="center">
                      <Group>
                        <IconCertificate size={20} />
                        <Text fw={500}>{certificateFile.name}</Text>
                      </Group>
                      <Group>
                        <Badge color="teal">{certificateFile.status}</Badge>
                        <ActionIcon 
                          color="red" 
                          variant="subtle" 
                          onClick={openDeleteCertificateModal}
                          disabled={isLoading}
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
                  <Divider mb="md" />
                  
                  {pdfDocuments.map((doc) => (
                    <Card key={doc.id} withBorder radius="md" mb="sm" padding="md">
                      <Group justify="space-between" align="center">
                        <Group>
                          <IconFile size={20} />
                          <div>
                            <Text fw={500}>{doc.name}</Text>
                            {doc.createdAt && (
                              <Text size="xs" c="dimmed">
                                Subido el {formatDate(doc.createdAt)}
                              </Text>
                            )}
                          </div>
                        </Group>
                        <Group>
                          <Badge color="yellow">{doc.status}</Badge>
                          <ActionIcon 
                            color="red" 
                            variant="subtle" 
                            onClick={() => handleDeletePdf(doc.id.toString())}
                            disabled={isLoading}
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Card>
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
          <Button color="red" onClick={confirmDeletePdf} loading={isLoading}>
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
          <Button color="red" onClick={confirmDeleteCertificate} loading={isLoading}>
            Eliminar certificado
          </Button>
        </Group>
      </Modal>
    </Container>
  );
};

export default Dashboard;