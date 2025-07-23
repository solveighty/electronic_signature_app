import { Group, Title, Button, Center, Loader, Card, Box, Badge, Paper, Text, ActionIcon } from '@mantine/core';
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
          {logic.certificateFiles.length > 0 && (
            <>
              <Title order={5} mb="sm">Mis Certificados Digitales</Title>
              {logic.certificateFiles.map((cert: any) => (
                <Card
                  key={cert.id}
                  withBorder
                  radius="md"
                  mb="lg"
                  padding="md"
                  className='dark:bg-gray-800 dark:shadow-lg dark:rounded-lg dark:text-gray-100'
                >
                  <Group justify="space-between" align="flex-start">
                    <Group align="flex-start" wrap="nowrap">
                      <IconCertificate size={20} style={{ marginTop: 4 }} />
                      <Box>
                        <Text fw={500}>{cert.name}</Text>
                        {cert.createdAt && (
                          <Text size="xs" c="dimmed">
                            Subido el {logic.formatDate(cert.createdAt)}
                          </Text>
                        )}
                      </Box>
                    </Group>
                    <Group>
                      <Badge color="teal" variant="filled">
                        {cert.status || "CERTIFICADO DISPONIBLE"}
                      </Badge>
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => logic.openDeleteCertificateModal(cert.id)}
                        disabled={logic.isLoadingCertificate}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              ))}
            </>
          )}

          {logic.pdfDocuments.length > 0 && (
            <>
              <Title order={5} mb="sm">Mis Documentos PDF</Title>
              <Paper withBorder p="xs" mb="xs" radius="md">
                <Group grow gap={0} justify="space-between">
                  <Text fw={700} size="sm" pl={8}>Nombre del documento</Text>
                  <Text fw={700} size="sm" style={{ maxWidth: '180px' }}>Fecha de subida</Text>
                  <Text fw={700} size="sm" ta="center">Estado</Text>
                  <Text fw={700} size="sm" ta="center" style={{ maxWidth: '80px' }}>Acción</Text>
                </Group>
              </Paper>
              {logic.pdfDocuments.map((doc: any) => (
                <Paper key={doc.id} withBorder p="xs" mb="xs" radius="md">
                  <Group grow gap={0} justify="space-between" align="center">
                    <Group wrap="nowrap" gap="xs">
                      <IconFile size={20} />
                      <Text lineClamp={1}>
                        {doc.name}
                      </Text>
                    </Group>
                    <Text size="sm" c="dimmed" style={{ maxWidth: '180px' }}>
                      {doc.createdAt && logic.formatDate(doc.createdAt)}
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
                        color="blue"
                        variant="subtle"
                        onClick={() => logic.handleDownloadPdf(doc.id.toString())}
                        mx="auto"
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
                        disabled={!!deletingDocs[doc.id]}
                        loading={!!deletingDocs[doc.id]}
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