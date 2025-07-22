import { Card, Group, Text, Badge } from '@mantine/core';
import { IconSignature, IconCheck, IconX } from '@tabler/icons-react';

interface SignatureStatusCardProps {
  hasCertificate: boolean;
  documentOptionsCount: number;
}

const SignatureStatusCard = ({
  hasCertificate,
  documentOptionsCount,
}: SignatureStatusCardProps) => (
  <Card withBorder radius="md" mb="xl" padding="md" className='dark:bg-gray-800 dark:shadow-lg dark:rounded-lg dark:text-gray-100'>
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
          color={documentOptionsCount > 0 ? 'teal' : 'red'} 
          variant="light"
          leftSection={documentOptionsCount > 0 ? <IconCheck size={14} /> : <IconX size={14} />}
        >
          {documentOptionsCount > 0 
            ? `${documentOptionsCount} documentos por firmar` 
            : 'Sin documentos para firmar'}
        </Badge>
      </Group>
    </Group>
  </Card>
);

export default SignatureStatusCard;