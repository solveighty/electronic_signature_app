import { Modal, Group, Button, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

interface DeletePdfModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const DeletePdfModal = ({
  opened,
  onClose,
  onConfirm,
  loading
}: DeletePdfModalProps) => (
  <Modal
    opened={opened}
    onClose={onClose}
    title={
      <Group>
        <IconAlertCircle size={20} color="red" />
        <Text fw={700}>Eliminar documento</Text>
      </Group>
    }
    centered
  >
    <Text mb="xl">
      ¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.
    </Text>
    <Group justify="flex-end">
      <Button variant="default" onClick={onClose}>
        Cancelar
      </Button>
      <Button color="red" onClick={onConfirm} loading={loading}>
        Eliminar
      </Button>
    </Group>
  </Modal>
);

export default DeletePdfModal;