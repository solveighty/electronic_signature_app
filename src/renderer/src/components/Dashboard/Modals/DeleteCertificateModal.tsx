import { Modal, Group, Button, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { DeleteCertificateModalProps } from './types/deleteCertificateModal';

const DeleteCertificateModal = ({
  opened,
  onClose,
  loading,
  logic,
  selectedCertId
}: DeleteCertificateModalProps) => (
  <Modal
    opened={opened}
    onClose={onClose}
    title={
      <Group>
        <IconAlertCircle size={20} color="red" />
        <Text fw={700}>Eliminar certificado</Text>
      </Group>
    }
    centered
  >
    <Text mb="xl">
      ¿Estás seguro de que deseas eliminar tu certificado digital? Esta acción no se puede deshacer y no podrás firmar documentos hasta que subas un nuevo certificado.
    </Text>
    <Group justify="flex-end">
      <Button variant="default" onClick={onClose}>
        Cancelar
      </Button>
      <Button
        color="red"
        onClick={() => {
          console.log('Eliminar certificado', selectedCertId);
          logic.confirmDeleteCertificate(selectedCertId);
        }}
        loading={loading}
      >
        Eliminar certificado
      </Button>
    </Group>
  </Modal>
);

export default DeleteCertificateModal;