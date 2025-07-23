import { Group, Title, Button, Center, Loader, Card, Box, Badge, Paper, Text, ActionIcon, SimpleGrid } from '@mantine/core';
import { IconCertificate, IconTrash, IconFile, IconDownload, IconRefresh } from '@tabler/icons-react';
import { useState } from 'react';
import DeletePdfModal from '../Modals/DeletePdfModal';

const DocumentsPanel = ({ logic }: { logic: any }) => {
  const [deletingDocs, setDeletingDocs] = useState<{ [id: string]: boolean }>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<string | null>(null);

  const handleDeletePdf = async (documentId: string) => {
    setDeletingDocs(prev => ({ ...prev, [documentId]: true }));
    await logic.deletePdf(documentId);
    setDeletingDocs(prev => ({ ...prev, [documentId]: false }));
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
      ) : logic.documents.length > 0 ? (
        <>
          {(logic.certificateFiles && logic.certificateFiles.length > 0) && (
            <>
              <Title order={5} mb="sm">Mis Certificados Digitales</Title>
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                {logic.certificateFiles.map((cert: any) => (
                  <Card
                    key={cert.id}
                    withBorder
                    radius="xl"
                    shadow="lg"
                    padding="xl"
                    style={{
                      background: "linear-gradient(135deg, #e0f7fa 0%, #ffffff 100%)",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      cursor: "pointer",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                  >
                    <Center mb="md">
                      <IconCertificate size={48} color="#26A69A" />
                    </Center>
                    <Text fw={700} size="lg" ta="center" mb={4} style={{ wordBreak: "break-all" }}>
                      {cert.name}
                    </Text>
                    {cert.createdAt && (
                      <Text size="xs" c="dimmed" ta="center" mb={8}>
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
                        color="red"
                        variant="light"
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
            </>
          )}

          {logic.pdfDocuments.length > 0 && (
            <>
              <Title order={5} mb="sm" ta="center">Mis Documentos PDF</Title>
              <Paper withBorder p="xs" mb="xs" radius="lg" shadow="md" style={{ overflow: 'hidden' }}>
                <Group gap={0} justify="space-between" align="center" style={{ padding: '12px 24px', background: '#f7fafc', borderBottom: '1px solid #e0e0e0' }}>
                  <Text fw={700} size="sm" style={{ flex: 2 }}>Nombre del documento</Text>
                  <Text fw={700} size="sm" style={{ flex: 1 }}>Fecha de subida</Text>
                  <Text fw={700} size="sm" style={{ flex: 1 }}>Estado</Text>
                  <Text fw={700} size="sm" style={{ flex: 1, textAlign: 'center' }}>Acción</Text>
                </Group>
                {logic.pdfDocuments.map((doc: any) => (
                  <Group
                    key={doc.id}
                    gap={0}
                    justify="space-between"
                    align="center"
                    style={{
                      padding: '16px 24px',
                      borderBottom: '1px solid #f0f0f0',
                      background: '#fff',
                      borderRadius: 12,
                      marginBottom: 8,
                      transition: 'box-shadow 0.2s, background 0.2s',
                      boxShadow: '0 2px 8px rgba(33,150,243,0.04)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#e3f0ff')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
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
                    </Group>
                  </Group>
                ))}
              </Paper>
            </>
          )}
        </>
      ) : (
        <Center py="xl">
          <Text c="dimmed">Aún no has subido ningún archivo</Text>
        </Center>
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
    </>
  );
};

export default DocumentsPanel;