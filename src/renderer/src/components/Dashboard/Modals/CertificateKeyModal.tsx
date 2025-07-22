import { Modal, Group, Button, Text, PasswordInput } from '@mantine/core';
import { IconLock, IconEye, IconEyeOff } from '@tabler/icons-react';

interface CertificateKeyModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  value: string;
  onChange: (value: string) => void;
  onCancel: () => void;
}

const CertificateKeyModal = ({
  opened,
  onClose,
  onConfirm,
  value,
  onChange,
  onCancel,
}: CertificateKeyModalProps) => (
  <Modal
    opened={opened}
    onClose={onClose}
    title={
      <Group>
        <IconLock size={20} color="teal" />
        <Text fw={700}>Clave personal</Text>
      </Group>
    }
    centered
  >
    <Text mb="md">
      Ingresa una clave personal para proteger tu certificado digital. Esta clave será
      utilizada como segunda capa de seguridad y deberás recordarla para futuras operaciones.
    </Text>

    <PasswordInput
      label="Clave personal"
      placeholder="Ingresa una clave personal segura"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      mb="xl"
      leftSection={<IconLock size={16} />}
      visibilityToggleIcon={({ reveal }) =>
        reveal ? <IconEyeOff size={16} /> : <IconEye size={16} />
      }
    />

    <Group justify="flex-end">
      <Button variant="default" onClick={onCancel}>
        Cancelar
      </Button>
      <Button
        color="teal"
        onClick={onConfirm}
        disabled={value.trim() === ''}
      >
        Confirmar
      </Button>
    </Group>
  </Modal>
);

export default CertificateKeyModal;