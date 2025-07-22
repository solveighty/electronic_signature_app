import { Paper, Text, Card, Group, PasswordInput, Alert, Button } from '@mantine/core';
import { IconCertificate, IconLock, IconEyeOff, IconEye, IconAlertCircle } from '@tabler/icons-react';

const CertificatePasswordStep = ({ logic }: { logic: any }) => (
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
);

export default CertificatePasswordStep;