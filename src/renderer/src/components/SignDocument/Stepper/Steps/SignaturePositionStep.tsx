import { Paper, Text, Group, Button, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import PdfPageViewer from '../../../PdfPageViewer';
import SignatureStamp from '../../../qrGenerator';

const SignaturePositionStep = ({
  logic,
  pdfSigner,
  securePdfUrl,
}: {
  logic: any;
  pdfSigner: any;
  securePdfUrl: string | null;
}) => (
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
);

export default SignaturePositionStep;