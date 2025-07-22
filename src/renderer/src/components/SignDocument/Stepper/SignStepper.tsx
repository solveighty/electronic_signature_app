import {
  Stepper, Paper, Text, Center, Loader, Select, Card, Group, Alert, Button, PasswordInput, Badge, Flex
} from '@mantine/core';
import {
  IconFile,
  IconAlertCircle,
  IconLock,
  IconEyeOff,
  IconEye,
  IconCertificate,
  IconDownload,
  IconCheck
} from '@tabler/icons-react';
import PdfPageViewer from '../../PdfPageViewer';
import SignatureStamp from '../../qrGenerator';

const SignStepper = ({
  logic,
  pdfSigner,
  securePdfUrl
}: {
  logic: any;
  pdfSigner: any;
  securePdfUrl: string | null;
}) => (
  <Stepper active={logic.active} onStepClick={logic.setActive} mb="xl">
    {/* Paso 1: Seleccionar documento */}
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
    {/* Paso 2: Contraseña */}
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
    {/* Paso 3: Posición de firma */}
    <Stepper.Step
      label="Posición de firma"
      description="Define dónde aparecerá la firma"
      allowStepSelect={!!logic.canProceedToPosition}
    >
      <Paper radius="md" p="xl" withBorder mt="xl">
        <Text fw={500} mb="md">Selecciona la posición de la firma en el documento PDF</Text>
        {securePdfUrl && (
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
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
                disabled={pdfSigner.selectedPage >= pdfSigner.totalPages}
                onClick={() => {
                  if (pdfSigner.selectedPage < pdfSigner.totalPages) {
                    pdfSigner.setSelectedPage(pdfSigner.selectedPage + 1);
                  }
                }}
              >
                Página siguiente
              </Button>
            </Group>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                position: 'relative',
              }}
              onClick={pdfSigner.handlePdfClick}
            >
              <PdfPageViewer
                fileUrl={securePdfUrl}
                pageNumber={pdfSigner.selectedPage}
                width={600}
              />
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
    {/* Paso 4: Completado */}
    <Stepper.Completed>
      <Paper radius="md" p="xl" withBorder mt="xl">
        <Center mb="lg">
          <IconCheck size={48} color="green" stroke={1.5} />
        </Center>
        <Text ta="center" mb="md" fw={700}>¡Documento firmado correctamente!</Text>
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
);

export default SignStepper;