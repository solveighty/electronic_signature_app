import { 
  Container, Title, Paper, Text, Button, Group, Modal, Box, Card, Badge, Divider
} from '@mantine/core';
import { IconSignature, IconCheck, IconX, IconRefresh
} from '@tabler/icons-react';
import { useSignDocumentLogic } from '../hooks/documents/useSignDocumentLogic';
import { usePdfSignerLogic } from '../hooks/documents/usePdfSignerLogic';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import { useEffect, useState } from 'react';
import SignStepper from '../components/SignDocument/SignStepper';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as any).version}/pdf.worker.min.js`;

const SignDocument = () => {
  const logic = useSignDocumentLogic();
  const pdfSigner = usePdfSignerLogic();

  const [securePdfUrl, setSecurePdfUrl] = useState<string | null>(null);


  useEffect(() => {
    if (logic.selectedDocument) {
      pdfSigner.fetchPdfUrl(String(logic.selectedDocument.id)).then(setSecurePdfUrl);
    } else {
      setSecurePdfUrl(null);
    }
  }, [logic.selectedDocument]);

  useEffect(() => {
    if (pdfSigner.signaturePosition) {
      logic.setSignaturePosition({
        page: String(pdfSigner.signaturePosition.page),
        x: String(pdfSigner.signaturePosition.x),
        y: String(pdfSigner.signaturePosition.y),
      });
    }
  }, [pdfSigner.signaturePosition]);

  return (
    <>
      <Container size="lg" py="md" className='dark:bg-gray-900 dark:text-gray-100'>
        <Group justify="space-between" mb="lg" className='dark:bg-gray-800 dark:shadow-lg dark:rounded-lg p-4'>
          <Title order={3}>Firma de Documentos</Title>
          <Button 
            variant="subtle" 
            leftSection={<IconRefresh size={16} />}
            onClick={logic.handleRefresh}
            loading={logic.isLoadingDocuments}
          >
            Actualizar estado
          </Button>
        </Group>
        <Card withBorder radius="md" mb="xl" padding="md" className='dark:bg-gray-800 dark:shadow-lg dark:rounded-lg dark:text-gray-100'>
          <Group justify="space-between">
            <Group>
              <IconSignature size={24} />
              <div>
                <Text fw={500}>Estado de Firma</Text>
                <Text size="xs" c="dimmed">Verifica que tengas documentos y certificado</Text>
              </div>
            </Group>
            <Group>
              <Badge 
                color={logic.hasCertificate ? 'teal' : 'red'} 
                variant="light"
                leftSection={logic.hasCertificate ? <IconCheck size={14} /> : <IconX size={14} />}
              >
                {logic.hasCertificate ? 'Certificado disponible' : 'Sin certificado'}
              </Badge>
              <Badge 
                color={logic.documentOptions.length > 0 ? 'teal' : 'red'} 
                variant="light"
                leftSection={logic.documentOptions.length > 0 ? <IconCheck size={14} /> : <IconX size={14} />}
              >
                {logic.documentOptions.length > 0 
                  ? `${logic.documentOptions.length} documentos por firmar` 
                  : 'Sin documentos para firmar'}
              </Badge>
            </Group>
          </Group>
        </Card>
        <SignStepper logic={logic} pdfSigner={pdfSigner} securePdfUrl={securePdfUrl} />
      </Container>
      <Modal 
        opened={logic.opened} 
        onClose={logic.close} 
        title="Previsualización de la firma" 
        size="lg"
        centered
      >
        <Box py="md">
          <Text mb="md">
            Este es un ejemplo de cómo se verá posicionada la firma en el documento:
          </Text>
          <Paper
            style={{
              position: 'relative',
              width: '100%',
              height: '400px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              overflow: 'hidden'
            }}
          >
            <Box
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                color: '#aaa'
              }}
            >
              <Text size="xs">Página {logic.signaturePosition.page}</Text>
              <Text size="lg" fw={700}>CONTENIDO DEL DOCUMENTO</Text>
            </Box>
            <Box
              style={{
                position: 'absolute',
                width: '150px',
                height: '50px',
                backgroundColor: 'rgba(0, 156, 140, 0.3)',
                border: '2px dashed #009c8c',
                borderRadius: '4px',
                left: `${logic.signaturePosition.x}%`,
                top: `${logic.signaturePosition.y}%`,
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Text size="xs" fw={500}>Firma Electrónica</Text>
            </Box>
          </Paper>
          <Text size="sm" c="dimmed" mt="md">
            Nota: Esta es solo una representación aproximada. La posición real puede variar ligeramente 
            dependiendo del formato del documento.
          </Text>
          <Divider my="md" />
          <Group justify="right">
            <Button onClick={logic.close}>Cerrar</Button>
          </Group>
        </Box>
      </Modal>
    </>
  );
};

export default SignDocument;