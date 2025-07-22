import { Paper, Text, Center, Loader, Select, Card, Group, Alert, Button } from '@mantine/core';
import { IconFile, IconAlertCircle } from '@tabler/icons-react';

const DocumentSelectorStep = ({ logic }: { logic: any }) => (
  <Paper radius="md" p="xl" withBorder mt="xl" className='dark:bg-gray-800 dark:shadow-lg dark:rounded-lg dark:text-gray-100'>
    <Text fw={500} mb="md">Selecciona un documento para firmar</Text>
    {logic.isLoadingDocuments ? (
      <Center py="xl">
        <Loader />
      </Center>
    ) : logic.documentOptions.length > 0 ? (
      <>
        <Select
          label="Documento a firmar"
          placeholder="Selecciona un documento"
          data={logic.documentOptions}
          value={logic.selectedDocumentId}
          onChange={logic.setSelectedDocumentId}
          mb="md"
          searchable
          clearable
        />
        {logic.selectedDocument && (
          <Card withBorder radius="md" mb="md" padding="xs">
            <Group>
              <IconFile size={20} />
              <div>
                <Text size="sm" fw={500}>{logic.selectedDocument.name}</Text>
                {logic.selectedDocument.createdAt && (
                  <Text size="xs" c="dimmed">
                    Subido el {new Date(logic.selectedDocument.createdAt).toLocaleDateString()}
                  </Text>
                )}
              </div>
            </Group>
          </Card>
        )}
        {!logic.hasCertificate && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Necesitas un certificado" 
            color="red" 
            mb="md"
          >
            Debes subir un certificado digital antes de poder firmar documentos.
          </Alert>
        )}
        <Group justify="right" mt="xl">
          <Button
            onClick={() => logic.setActive(1)}
            disabled={!logic.canProceedToPassword}
          >
            Siguiente
          </Button>
        </Group>
      </>
    ) : (
      <Alert 
        icon={<IconAlertCircle size={16} />} 
        title="Sin documentos para firmar" 
        color="yellow"
      >
        <Text className='dark:text-gray-200'>No tienes documentos pendientes de firma. Sube un documento PDF primero.</Text>
      </Alert>
    )}
  </Paper>
);

export default DocumentSelectorStep;