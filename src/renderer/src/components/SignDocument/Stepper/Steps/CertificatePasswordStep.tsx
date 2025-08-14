import { useState } from 'react';
import { Paper, Text, Card, Group, PasswordInput, Alert, Button, Select } from '@mantine/core';
import { IconCertificate, IconLock, IconEyeOff, IconEye, IconAlertCircle } from '@tabler/icons-react';

const CertificatePasswordStep = ({ logic }: { logic: any }) => {
  const [error, setError] = useState<string | undefined>(undefined);

  const handleNextStep = async () => {
    if (!logic.canProceedToPosition) return;

    const isValidPassword = await logic.validateCertificatePassword(logic.selectedCertificateId, logic.certificatePassword);
    if (isValidPassword) {
      setError(undefined);
      logic.setActive(2);
    } else {
      setError('Contraseña incorrecta. Por favor, verifica e intenta nuevamente.');
    }
  };

  return (
    <Paper radius="md" p="xl" withBorder mt="xl">
      <Text fw={500} mb="md">Ingresa la contraseña de tu certificado digital</Text>
      <Select
        label="Selecciona el certificado"
        placeholder="Elige un certificado"
        data={logic.certificateFiles.map((cert: any) => ({
          value: cert.id,
          label: cert.name,
        }))}
        value={logic.selectedCertificateId}
        onChange={logic.setSelectedCertificateId}
        required
        mb="md"
        leftSection={<IconCertificate size={16} />}
      />
      {logic.selectedCertificateFile && (
        <Card withBorder radius="md" mb="md" padding="xs">
          <Group>
            <IconCertificate size={20} />
            <div>
              <Text size="sm" fw={500}>{logic.selectedCertificateFile.name}</Text>
              <Text size="xs" c="dimmed">Certificado digital P12</Text>
            </div>
          </Group>
        </Card>
      )}
      <PasswordInput
        label="Contraseña del certificado"
        placeholder="Ingresa la contraseña de tu certificado P12"
        value={logic.certificatePassword}
        onChange={(e) => {
          logic.setCertificatePassword(e.target.value);
          if (error) setError(undefined);
        }}
        leftSection={<IconLock size={16} />}
        visibilityToggleIcon={({ reveal }) =>
          reveal ? <IconEyeOff size={16} /> : <IconEye size={16} />
        }
        mb="md"
        required
        disabled={!logic.selectedCertificateId}
        error={error}
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
          onClick={handleNextStep}
          disabled={!logic.canProceedToPosition}
        >
          Siguiente
        </Button>
      </Group>
    </Paper>
  );
};

export default CertificatePasswordStep;