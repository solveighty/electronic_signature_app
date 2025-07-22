import { 
  Container, Title, Paper, Text, Button, Group, Select, Modal, Stepper, Box, Card, Badge, Center, PasswordInput, Alert, Loader, Flex, Divider
} from '@mantine/core';
import { 
  IconFile, IconCertificate, IconSignature, IconCheck, IconX, IconAlertCircle, IconLock, IconEye, IconEyeOff, IconDownload, IconRefresh
} from '@tabler/icons-react';
import { useSignDocumentLogic } from '../hooks/documents/useSignDocumentLogic';
import { usePdfSignerLogic } from '../hooks/documents/usePdfSignerLogic';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import { useEffect, useState } from 'react';
import SignatureStamp from '../components/qrGenerator';
import PdfPageViewer from '../components/PdfPageViewer';

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
        <Stepper active={logic.active} onStepClick={logic.setActive} mb="xl">
          <Stepper.Step
            label="Seleccionar documento"
            description="Elige un PDF para firmar"
            allowStepSelect={true}
          >
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
          </Stepper.Step>
          <Stepper.Step
            label="Contraseña"
            description="Ingresa la contraseña del certificado"
            allowStepSelect={!!logic.canProceedToPassword}
          >
            <Paper radius="md" p="xl" withBorder mt="xl">
              <Text fw={500} mb="md">Ingresa la contraseña de tu certificado digital</Text>
              {logic.certificateFile && (
                <Card withBorder radius="md" mb="md" padding="xs">
                  <Group>
                    <IconCertificate size={20} />
                    <div>
                      <Text size="sm" fw={500}>{logic.certificateFile.name}</Text>
                      <Text size="xs" c="dimmed">Certificado digital P12</Text>
                    </div>
                  </Group>
                </Card>
              )}
              <PasswordInput
                label="Contraseña del certificado"
                placeholder="Ingresa la contraseña de tu certificado P12"
                value={logic.certificatePassword}
                onChange={(e) => logic.setCertificatePassword(e.target.value)}
                leftSection={<IconLock size={16} />}
                visibilityToggleIcon={({ reveal }) =>
                  reveal ? <IconEyeOff size={16} /> : <IconEye size={16} />
                }
                mb="md"
                required
              />
              <Alert 
                icon={<IconAlertCircle size={16} />} 
                title="Información importante" 
                color="blue" 
                mb="md"
              >
                La contraseña de tu certificado no se almacena en nuestros servidores. 
                Solo se utiliza para realizar la firma electrónica.
              </Alert>
              <Group justify="space-between" mt="xl">
                <Button variant="default" onClick={() => logic.setActive(0)}>
                  Atrás
                </Button>
                <Button
                  onClick={() => logic.setActive(2)}
                  disabled={!logic.canProceedToPosition}
                >
                  Siguiente
                </Button>
              </Group>
            </Paper>
          </Stepper.Step>
          <Stepper.Step
            label="Posición de firma"
            description="Define dónde aparecerá la firma"
            allowStepSelect={!!logic.canProceedToPosition}
          >
            <Paper radius="md" p="xl" withBorder mt="xl">
              <Text fw={500} mb="md">Selecciona la posición de la firma en el documento PDF</Text>
              {securePdfUrl && (
                <div style={{ position: 'relative', border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden', marginBottom: 24 }}>
                  <Group justify="center" mb="xs">
                    <Button
                      size="xs"
                      variant="light"
                      disabled={pdfSigner.selectedPage <= 1}
                      onClick={() => pdfSigner.setSelectedPage(pdfSigner.selectedPage - 1)}
                    >
                      Página anterior
                    </Button>
                    <Text size="sm" mx="md">Página {pdfSigner.selectedPage}</Text>
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => pdfSigner.setSelectedPage(pdfSigner.selectedPage + 1)}
                    >
                      Página siguiente
                    </Button>
                  </Group>
                  <div
                    style={{ cursor: 'crosshair' }}
                    onClick={pdfSigner.handlePdfClick}
                  >
                    <PdfPageViewer
                      fileUrl={securePdfUrl}
                      pageNumber={pdfSigner.selectedPage}
                      width={600}
                    />
                  </div>
                  {pdfSigner.signaturePosition && (
                    <div
                      style={{
                        position: 'absolute',
                        left: `${pdfSigner.signaturePosition.x}%`,
                        top: `${pdfSigner.signaturePosition.y}%`,
                        width: 160,
                        height: 80,
                        pointerEvents: 'none',
                        transform: 'translate(-50%, -50%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.8)',
                        borderRadius: 8,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                      }}
                    >
                      <SignatureStamp
                        text={logic.selectedDocument?.name || "Documento"}
                        documentId={logic.selectedDocument?.id?.toString() || ""}
                        certId={logic.certificateFile?.id?.toString() || ""}
                        certPassword={logic.certificatePassword}
                      />
                    </div>
                  )}
                </div>
              )}
              <Alert 
                icon={<IconAlertCircle size={16} />} 
                title="Previsualización" 
                color="blue" 
                mb="md"
              >
                Haz clic en el PDF para seleccionar la posición de la firma.
              </Alert>
              <Group justify="space-between" mt="xl">
                <Button variant="default" onClick={() => logic.setActive(1)}>
                  Atrás
                </Button>
                <Button
                  onClick={logic.handleSignDocument}
                  disabled={!logic.canSignDocument}
                  loading={logic.isSigningInProgress}
                  color="green"
                >
                  Firmar documento
                </Button>
              </Group>
            </Paper>
          </Stepper.Step>
          <Stepper.Completed>
            <Paper radius="md" p="xl" withBorder mt="xl">
              <Center mb="lg">
                <IconCheck size={48} color="green" stroke={1.5} />
              </Center>
              <Title order={3} ta="center" mb="md">¡Documento firmado correctamente!</Title>
              <Text ta="center" c="dimmed" mb="xl">
                Tu documento ha sido firmado digitalmente y está listo para descargar.
              </Text>
              {logic.selectedDocument && (
                <Card withBorder radius="md" mb="xl" padding="md">
                  <Group justify="space-between">
                    <Group>
                      <IconFile size={20} />
                      <div>
                        <Text fw={500}>{logic.selectedDocument.name}</Text>
                        <Text size="xs" c="dimmed">
                          Firmado electrónicamente el {new Date().toLocaleDateString()}
                        </Text>
                      </div>
                    </Group>
                    <Badge color="green">Firmado</Badge>
                  </Group>
                </Card>
              )}
              <Flex gap="md" justify="center">
                <Button
                  leftSection={<IconDownload size={16} />}
                  onClick={logic.handleDownloadSignedDocument}
                  color="teal"
                >
                  Descargar documento firmado
                </Button>
                <Button
                  variant="outline"
                  onClick={logic.handleReset}
                >
                  Firmar otro documento
                </Button>
              </Flex>
            </Paper>
          </Stepper.Completed>
        </Stepper>
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