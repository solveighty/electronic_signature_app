import { Modal, Box, Text, Paper, Divider, Group, Button } from '@mantine/core';

interface SignaturePreviewModalProps {
  opened: boolean;
  onClose: () => void;
  signaturePosition: { page: string; x: string; y: string };
}

const SignaturePreviewModal = ({
  opened,
  onClose,
  signaturePosition,
}: SignaturePreviewModalProps) => (
  <Modal
    opened={opened}
    onClose={onClose}
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
          overflow: 'hidden',
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
            color: '#aaa',
          }}
        >
          <Text size="xs">Página {signaturePosition.page}</Text>
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
            left: `${signaturePosition.x}%`,
            top: `${signaturePosition.y}%`,
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
        <Button onClick={onClose}>Cerrar</Button>
      </Group>
    </Box>
  </Modal>
);

export default SignaturePreviewModal;