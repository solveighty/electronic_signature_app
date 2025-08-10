import { Group, Title, Button, Center, Loader, Card, Box, Badge, Paper, Text, ActionIcon, SimpleGrid, Modal, TextInput, Select } from '@mantine/core';
import { IconCertificate, IconTrash, IconFile, IconDownload, IconRefresh } from '@tabler/icons-react';
import { useState } from 'react';
import { useFriendsLogic } from '../../../hooks/home/useFriendsLogic';
import { useSendSignatureRequest } from '../../../hooks/home/useSendSignatureRequest';
import DeletePdfModal from '../Modals/DeletePdfModal';
import CertificateForm from '../../../components/CertificateCreator/CertificateForm';
import CertificateHeader from '../../../components/CertificateCreator/CertificateHeader';
import CertificateActions from '../../../components/CertificateCreator/CertificateActions';
import { useCertificateCreatorLogic } from '../../../hooks/documents/useCertificateCreatorLogic';
import { toast } from 'react-toastify';

const DocumentsPanel = ({ logic }: { logic: any }) => {
  const [deletingDocs, setDeletingDocs] = useState<{ [id: string]: boolean }>({});
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const { friends } = useFriendsLogic();
  const { sendSignatureRequest, loading: sending, error: sendError, success } = useSendSignatureRequest();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<string | null>(null);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedCertId, setSelectedCertId] = useState<string | null>(null);
  const [requestCertOpen, setRequestCertOpen] = useState(false);
  const certLogic = useCertificateCreatorLogic(() => {
    setRequestCertOpen(false);
    logic.refreshCertificate();
  });

  const handleDeletePdf = async (documentId: string) => {
    setDeletingDocs(prev => ({ ...prev, [documentId]: true }));
    await logic.deletePdf(documentId);
    setDeletingDocs(prev => ({ ...prev, [documentId]: false }));
  };

  const handleDownloadCertificate = async () => {
    if (selectedCertId && password) {
      const url = await logic.getCertificateUrl(selectedCertId, password);
      if (url === 'invalid-password') {
        toast.error('Contraseña incorrecta. Por favor, verifica e intenta nuevamente.');
        return;
      }
      if (url) {
        window.open(url, '_blank');
        setPasswordModalOpen(false);
        setPassword('');
        setSelectedCertId(null);
      } else {
        toast.error('No se pudo obtener el certificado. Por favor, verifica tus credenciales e intenta nuevamente.');
      }
    }
  };

  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={4}>Mis Documentos</Title>
        <Button
          variant="subtle"
          leftSection={<IconRefresh size={16} />}
          onClick={logic.refreshDocuments}
          loading={logic.isLoadingDocuments}
        >
          Actualizar
        </Button>
      </Group>

      {logic.isLoadingDocuments ? (
        <Center py="xl">
          <Loader />
        </Center>
      ) : (
        <>
          {/* Sección de Certificados - siempre visible */}
          <Group justify="space-between" align="center" mb="sm">
            <Title order={5}>Mis Certificados Digitales</Title>
            {!logic.isAdmin && (
              <Button color="teal" variant="light" onClick={() => setRequestCertOpen(true)}>
                Solicitar certificado
              </Button>
            )}
          </Group>
          {logic.certificateFiles && logic.certificateFiles.length > 0 ? (
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg" mb="xl">
              {logic.certificateFiles.map((cert: any) => (
                <Card
                  key={cert.id}
                  withBorder
                  radius="xl"
                  shadow="lg"
                  padding="xl"
                  style={{
                    background: logic.darkMode
                      ? "linear-gradient(135deg, #1f2430 0%, #0f172a 100%)"
                      : "linear-gradient(135deg, #e0f7fa 0%, #ffffff 100%)",
                    border: logic.darkMode ? '1px solid #2b3545' : undefined,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                    boxShadow: logic.darkMode
                      ? "0 6px 18px rgba(0,0,0,0.35)"
                      : "0 2px 12px rgba(0,0,0,0.08)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <Center mb="md">
                    <IconCertificate size={48} color="#26A69A" />
                  </Center>
                  <Text
                    fw={700}
                    size="lg"
                    ta="center"
                    mb={4}
                    style={{ wordBreak: "break-all", color: logic.darkMode ? '#e2e8f0' : undefined }}
                  >
                    {cert.name}
                  </Text>
                  {cert.createdAt && (
                    <Text size="xs" c={logic.darkMode ? undefined : "dimmed"} ta="center" mb={8} style={{ color: logic.darkMode ? '#cbd5e1' : undefined }}>
                      Subido el {logic.formatDate(cert.createdAt)}
                    </Text>
                  )}
                  <Center mb="md">
                    <Badge color="teal" variant="filled" size="md">
                      {cert.status || "CERTIFICADO DISPONIBLE"}
                    </Badge>
                  </Center>
                  <Center>
                    <ActionIcon
                      color="blue"
                      variant={logic.darkMode ? "subtle" : "light"}
                      onClick={() => {
                        setSelectedCertId(cert.id);
                        setPasswordModalOpen(true);
                      }}
                      size="lg"
                      title="Descargar certificado"
                      style={{ marginRight: 8 }}
                    >
                      <IconDownload size={22} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      variant={logic.darkMode ? "subtle" : "light"}
                      onClick={() => {
                        logic.setSelectedCertId(cert.id);
                        logic.openDeleteCertificateModal();
                      }}
                      disabled={logic.isLoadingCertificate}
                      size="lg"
                      title="Eliminar certificado"
                    >
                      <IconTrash size={22} />
                    </ActionIcon>
                  </Center>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            <Center py="md" mb="xl">
              <Text c="dimmed" size="sm">No tienes certificados digitales subidos</Text>
            </Center>
          )}

          {/* Sección de PDFs - siempre visible */}
          <Title order={5} mb="sm" ta="center">Mis Documentos PDF</Title>
          {logic.pdfDocuments.length > 0 ? (
            <Paper
              withBorder
              p="xs"
              mb="xs"
              radius="lg"
              shadow="md"
              style={{ overflow: 'hidden' }}
              className="pdf-documents-list"
            >
              <Group
                gap={0}
                justify="space-between"
                align="center"
                style={{
                  padding: '12px 24px',
                  background: logic.darkMode ? '#23293a' : '#f7fafc',
                  borderBottom: logic.darkMode ? '1px solid #2b3545' : '1px solid #e0e0e0',
                }}
              >
                <Text fw={700} size="sm" style={{ flex: 2, color: logic.darkMode ? '#e2e8f0' : undefined }}>Nombre del documento</Text>
                <Text fw={700} size="sm" style={{ flex: 1, color: logic.darkMode ? '#e2e8f0' : undefined }}>Fecha de subida</Text>
                <Text fw={700} size="sm" style={{ flex: 1, color: logic.darkMode ? '#e2e8f0' : undefined }}>Estado</Text>
                <Text fw={700} size="sm" style={{ flex: 1, textAlign: 'center', color: logic.darkMode ? '#e2e8f0' : undefined }}>Acción</Text>
              </Group>
              {logic.pdfDocuments.map((doc: any) => (
                <Group
                  key={doc.id}
                  gap={0}
                  justify="space-between"
                  align="center"
                  style={{
                    padding: '16px 24px',
                    borderBottom: logic.darkMode ? '1px solid #2a3240' : '1px solid #f0f0f0',
                    background: logic.darkMode ? '#1f2430' : '#fff',
                    borderRadius: 12,
                    marginBottom: 8,
                    transition: 'box-shadow 0.2s, background 0.2s',
                    boxShadow: logic.darkMode ? '0 2px 8px rgba(0,0,0,0.25)' : '0 2px 8px rgba(33,150,243,0.04)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = logic.darkMode ? 'rgba(59,130,246,0.12)' : '#e3f0ff')}
                  onMouseLeave={e => (e.currentTarget.style.background = logic.darkMode ? '#1f2430' : '#fff')}
                >
                  <Group gap="xs" style={{ flex: 2 }}>
                    <IconFile size={20} color="#2196F3" />
                    <Text fw={500} style={{ wordBreak: 'break-all' }}>{doc.name}</Text>
                  </Group>
                  <Text size="sm" c="dimmed" style={{ flex: 1 }}>
                    {doc.createdAt && logic.formatDate(doc.createdAt)}
                  </Text>
                  <Box ta="center" style={{ flex: 1 }}>
                    <Badge
                      color={doc.status === "Firmado" ? "green" : "yellow"}
                      variant="filled"
                      size="md"
                      radius="sm"
                      style={{ fontWeight: 600, letterSpacing: 0.5 }}
                    >
                      {doc.status === "Firmado" ? "FIRMADO" : "PENDIENTE DE FIRMA"}
                    </Badge>
                  </Box>
                  <Group gap="xs" style={{ flex: 1, justifyContent: 'center' }}>
                    <ActionIcon
                      color="blue"
                      variant="subtle"
                      onClick={() => logic.handleDownloadPdf(doc.id.toString())}
                      title="Descargar"
                    >
                      <IconDownload size={18} />
                    </ActionIcon>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => {
                        setDocToDelete(doc.id.toString());
                        setDeleteModalOpen(true);
                      }}
                      title="Eliminar"
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                    <Button
                      size="xs"
                      color="teal"
                      variant="outline"
                      onClick={() => {
                        setSelectedDocId(doc.id.toString());
                        setSendModalOpen(true);
                      }}
                    >
                      Enviar a firmar
                    </Button>
                    <Modal
                      opened={sendModalOpen}
                      onClose={() => {
                        setSendModalOpen(false);
                        setSelectedDocId(null);
                        setSelectedFriendId(null);
                      }}
                      title="Enviar documento a firmar"
                    >
                      <Select
                        label="Selecciona un amigo para enviar la solicitud de firma"
                        placeholder="Selecciona un amigo"
                        data={friends.map(f => ({ value: f.id, label: f.name }))}
                        value={selectedFriendId}
                        onChange={setSelectedFriendId}
                      />
                      <Button
                        mt="md"
                        fullWidth
                        loading={sending}
                        disabled={!selectedFriendId || !selectedDocId}
                        onClick={async () => {
                          if (selectedDocId && selectedFriendId) {
                            await sendSignatureRequest(selectedDocId, logic.userId, selectedFriendId);
                            if (!sendError) {
                              toast.success('Solicitud de firma enviada');
                            }
                            setSendModalOpen(false);
                            setSelectedDocId(null);
                            setSelectedFriendId(null);
                          }
                        }}
                      >
                        Enviar solicitud
                      </Button>
                      {sendError && <Text color="red" mt={8}>{sendError}</Text>}
                      {success && <Text color="green" mt={8}>Solicitud enviada correctamente</Text>}
                    </Modal>
                  </Group>
                </Group>
              ))}
            </Paper>
          ) : (
            <Center py="md">
              <Text c="dimmed" size="sm">No tienes documentos PDF subidos</Text>
            </Center>
          )}
        </>
      )}

      <DeletePdfModal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={async () => {
          if (docToDelete) {
            await handleDeletePdf(docToDelete);
            setDeleteModalOpen(false);
            setDocToDelete(null);
          }
        }}
        loading={!!deletingDocs[docToDelete ?? ""]}
      />

      <Modal
        opened={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        title="Ingrese la contraseña para descargar el certificado"
      >
        <TextInput
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={handleDownloadCertificate} mt="md">
          Descargar
        </Button>
      </Modal>

      {/* Modal para solicitar certificado (usuario) */}
      <Modal
        opened={requestCertOpen}
        onClose={() => setRequestCertOpen(false)}
        title="Solicitar Certificado Digital"
        size="lg"
      >
        <div>
          <CertificateHeader />
          <CertificateForm form={certLogic.form} handleChange={certLogic.handleChange} />
          <CertificateActions error={certLogic.error} loading={certLogic.loading} onCreate={certLogic.handleCreateCertificate} />
        </div>
      </Modal>
    </>
  );
};

export default DocumentsPanel;