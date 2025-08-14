import { Modal, Group, Button, Text, PasswordInput } from '@mantine/core';
import { IconLock, IconEye, IconEyeOff } from '@tabler/icons-react';
import { useState } from 'react';
import { CertificateKeyModalProps } from './types/certificateKeyModal';

const CertificateKeyModal = ({
  opened,
  onClose,
  onConfirm,
  value,
  onChange,
  onCancel,
}: CertificateKeyModalProps) => {
  const [error, setError] = useState<string | undefined>(undefined);

  const handlePasswordChange = (password: string) => {
    onChange(password);
    if (!/^.*(?=.{8,})(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).*$/.test(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial');
    } else {
      setError(undefined);
    }
  };

  return (
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
        onChange={(e) => handlePasswordChange(e.target.value)}
        required
        mb="xl"
        leftSection={<IconLock size={16} />}
        visibilityToggleIcon={({ reveal }) =>
          reveal ? <IconEyeOff size={16} /> : <IconEye size={16} />
        }
        error={error}
        description="Mínimo 8 caracteres, una mayúscula y un carácter especial"
      />

      <Group justify="flex-end">
        <Button variant="default" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          color="teal"
          onClick={onConfirm}
          disabled={value.trim() === '' || !!error}
        >
          Confirmar
        </Button>
      </Group>
    </Modal>
  );
};

export default CertificateKeyModal;