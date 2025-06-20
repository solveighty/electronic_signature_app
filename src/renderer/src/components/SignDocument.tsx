import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Paper,
  Text,
  Button,
  Group,
  Select,
  TextInput,
  Modal,
  Stepper,
  Box,
  Card,
  Badge,
  Center,
  PasswordInput,
  Alert,
  Loader,
  Flex,
  Divider
} from '@mantine/core';
import { 
  IconFile, 
  IconCertificate, 
  IconSignature,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconLock,
  IconEye,
  IconEyeOff,
  IconDownload
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useDocumentManager, Document } from '../hooks/useDocumentManager';
import { toast } from 'react-toastify';


const SignDocument = () => {
  // Estado local para la interfaz de firma
  const [active, setActive] = useState(0);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [certificatePassword, setCertificatePassword] = useState('');
  const [signaturePosition, setSignaturePosition] = useState({ page: '1', x: '50', y: '50' });
  const [isSigningInProgress, setIsSigningInProgress] = useState(false);
  const [signedDocumentUrl, setSignedDocumentUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  
  // Obtenemos los documentos y el certificado del usuario
  const { pdfDocuments, certificateFile, isLoadingDocuments, refreshDocuments } = useDocumentManager();
  
  // Documento seleccionado actualmente
  const selectedDocument = pdfDocuments.find(doc => doc.id === selectedDocumentId);
  
  // Opciones de documentos para el select
  const documentOptions = pdfDocuments
    .filter(doc => doc.status === 'Pendiente de firma')
    .map(doc => ({
      value: doc.id.toString(),
      label: doc.name
    }));
  
  // Verificar si hay certificado disponible
  const hasCertificate = !!certificateFile;
  
  // Verificar si podemos avanzar al siguiente paso
  const canProceedToPassword = hasCertificate && selectedDocumentId;
  const canProceedToPosition = canProceedToPassword && certificatePassword.length >= 4;
  const canSignDocument = canProceedToPosition && 
    signaturePosition.page && 
    signaturePosition.x && 
    signaturePosition.y;
  
  // Función para manejar la firma del documento
  const handleSignDocument = async () => {
    if (!selectedDocumentId || !certificatePassword || !hasCertificate) {
      setError('Falta información requerida para firmar el documento');
      return;
    }
    
    try {
      setIsSigningInProgress(true);
      setError(null);
      
      // Aquí iría la llamada a la API para firmar el documento
      // Por ahora simulamos un proceso de firma
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular URL de documento firmado (en la implementación real, esto vendría del backend)
      console.log('Documento firmado:', selectedDocumentId);
      
      // Avanzar al último paso
      setActive(3);
      toast.success('Documento firmado con éxito');
      
      // Refrescar lista de documentos
      await refreshDocuments();
      
    } catch (error: any) {
      console.error('Error al firmar el documento:', error);
      setError(error.message || 'Error al firmar el documento');
      toast.error('Error al firmar el documento');
    } finally {
      setIsSigningInProgress(false);
    }
  };
  
  // Función para descargar el documento firmado
  const handleDownloadSignedDocument = () => {
    if (signedDocumentUrl) {
      // Aquí implementaríamos la descarga real
      window.open(signedDocumentUrl, '_blank');
      toast.info('Descargando documento firmado...');
    }
  };
  
  // Reiniciar el proceso
  const handleReset = () => {
    setActive(0);
    setSelectedDocumentId(null);
    setCertificatePassword('');
    setSignaturePosition({ page: '1', x: '50', y: '50' });
    setSignedDocumentUrl(null);
    setError(null);
  };
  
  return (
    <>
      <Container size="lg" py="md">
        <Title order={3} mb="lg">Firma de Documentos</Title>
        
        {/* Tarjeta de estado general */}
        <Card withBorder radius="md" mb="xl" padding="md">
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
                color={hasCertificate ? 'teal' : 'red'} 
                variant="light"
                leftSection={hasCertificate ? <IconCheck size={14} /> : <IconX size={14} />}
              >
                {hasCertificate ? 'Certificado disponible' : 'Sin certificado'}
              </Badge>
              
              <Badge 
                color={documentOptions.length > 0 ? 'teal' : 'red'} 
                variant="light"
                leftSection={documentOptions.length > 0 ? <IconCheck size={14} /> : <IconX size={14} />}
              >
                {documentOptions.length > 0 
                  ? `${documentOptions.length} documentos por firmar` 
                  : 'Sin documentos para firmar'}
              </Badge>
            </Group>
          </Group>
        </Card>
        
        {/* Stepper para el proceso de firma */}
        <Stepper active={active} onStepClick={setActive} mb="xl">
          <Stepper.Step
            label="Seleccionar documento"
            description="Elige un PDF para firmar"
            allowStepSelect={true}
          >
            <Paper radius="md" p="xl" withBorder mt="xl">
              <Text fw={500} mb="md">Selecciona un documento para firmar</Text>
              
              {isLoadingDocuments ? (
                <Center py="xl">
                  <Loader />
                </Center>
              ) : documentOptions.length > 0 ? (
                <>
                  <Select
                    label="Documento a firmar"
                    placeholder="Selecciona un documento"
                    data={documentOptions}
                    value={selectedDocumentId}
                    onChange={setSelectedDocumentId}
                    mb="md"
                    searchable
                    clearable
                  />
                  
                  {selectedDocument && (
                    <Card withBorder radius="md" mb="md" padding="xs">
                      <Group>
                        <IconFile size={20} />
                        <div>
                          <Text size="sm" fw={500}>{selectedDocument.name}</Text>
                          {selectedDocument.createdAt && (
                            <Text size="xs" c="dimmed">
                              Subido el {new Date(selectedDocument.createdAt).toLocaleDateString()}
                            </Text>
                          )}
                        </div>
                      </Group>
                    </Card>
                  )}
                  
                  {!hasCertificate && (
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
                      onClick={() => setActive(1)}
                      disabled={!canProceedToPassword}
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
                  No tienes documentos pendientes de firma. Sube un documento PDF primero.
                </Alert>
              )}
            </Paper>
          </Stepper.Step>
          
          <Stepper.Step
            label="Contraseña"
            description="Ingresa la contraseña del certificado"
            allowStepSelect={!!canProceedToPassword}
          >
            <Paper radius="md" p="xl" withBorder mt="xl">
              <Text fw={500} mb="md">Ingresa la contraseña de tu certificado digital</Text>
              
              {certificateFile && (
                <Card withBorder radius="md" mb="md" padding="xs">
                  <Group>
                    <IconCertificate size={20} />
                    <div>
                      <Text size="sm" fw={500}>{certificateFile.name}</Text>
                      <Text size="xs" c="dimmed">Certificado digital P12</Text>
                    </div>
                  </Group>
                </Card>
              )}
              
              <PasswordInput
                label="Contraseña del certificado"
                placeholder="Ingresa la contraseña de tu certificado P12"
                value={certificatePassword}
                onChange={(e) => setCertificatePassword(e.target.value)}
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
                <Button variant="default" onClick={() => setActive(0)}>
                  Atrás
                </Button>
                <Button
                  onClick={() => setActive(2)}
                  disabled={!canProceedToPosition}
                >
                  Siguiente
                </Button>
              </Group>
            </Paper>
          </Stepper.Step>
          
          <Stepper.Step
            label="Posición de firma"
            description="Define dónde aparecerá la firma"
            allowStepSelect={!!canProceedToPosition}
          >
            <Paper radius="md" p="xl" withBorder mt="xl">
              <Text fw={500} mb="md">Define la posición de la firma en el documento</Text>
              
              <Group grow mb="md">
                <TextInput
                  label="Página"
                  placeholder="Número de página"
                  type="number"
                  min={1}
                  value={signaturePosition.page}
                  onChange={(e) => setSignaturePosition({...signaturePosition, page: e.target.value})}
                />
                <TextInput
                  label="Posición X (%)"
                  placeholder="Posición horizontal"
                  type="number"
                  min={0}
                  max={100}
                  value={signaturePosition.x}
                  onChange={(e) => setSignaturePosition({...signaturePosition, x: e.target.value})}
                />
                <TextInput
                  label="Posición Y (%)"
                  placeholder="Posición vertical"
                  type="number"
                  min={0}
                  max={100}
                  value={signaturePosition.y}
                  onChange={(e) => setSignaturePosition({...signaturePosition, y: e.target.value})}
                />
              </Group>
              
              <Alert 
                icon={<IconAlertCircle size={16} />} 
                title="Previsualización" 
                color="blue" 
                mb="md"
              >
                La firma se colocará en la página {signaturePosition.page}, 
                a {signaturePosition.x}% desde la izquierda y {signaturePosition.y}% desde arriba.
              </Alert>
              
              <Button
                onClick={open}
                fullWidth
                variant="outline"
                mb="md"
              >
                Previsualizar posición de la firma
              </Button>
              
              {error && (
                <Alert 
                  icon={<IconAlertCircle size={16} />} 
                  title="Error" 
                  color="red" 
                  mb="md"
                >
                  {error}
                </Alert>
              )}
              
              <Group justify="space-between" mt="xl">
                <Button variant="default" onClick={() => setActive(1)}>
                  Atrás
                </Button>
                <Button
                  onClick={handleSignDocument}
                  disabled={!canSignDocument}
                  loading={isSigningInProgress}
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
              
              {selectedDocument && (
                <Card withBorder radius="md" mb="xl" padding="md">
                  <Group justify="space-between">
                    <Group>
                      <IconFile size={20} />
                      <div>
                        <Text fw={500}>{selectedDocument.name}</Text>
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
                  onClick={handleDownloadSignedDocument}
                  color="teal"
                >
                  Descargar documento firmado
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleReset}
                >
                  Firmar otro documento
                </Button>
              </Flex>
            </Paper>
          </Stepper.Completed>
        </Stepper>
      </Container>
      
      {/* Modal de previsualización */}
      <Modal 
        opened={opened} 
        onClose={close} 
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
            {/* Simulación de página PDF */}
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
              <Text size="xs">Página {signaturePosition.page}</Text>
              <Text size="lg" fw={700}>CONTENIDO DEL DOCUMENTO</Text>
            </Box>
            
            {/* Cuadro que representa la firma */}
            <Box
              style={{
                position: 'absolute',
                width: '150px',
                height: '50px',
                backgroundColor: 'rgba(0, 156, 140, 0.3)',
                border: '2px dashed #009c8c',
                borderRadius: '4px',
                left: `${signaturePosition.x}%`,
                top: `${signaturePosition.y}%`,
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
            <Button onClick={close}>Cerrar</Button>
          </Group>
        </Box>
      </Modal>
    </>
  );
};

export default SignDocument;