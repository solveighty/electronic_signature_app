import { Group, Title, Button } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';

interface SignDocumentHeaderProps {
  onRefresh: () => void;
  loading: boolean;
}

const SignDocumentHeader = ({
  onRefresh,
  loading,
}: SignDocumentHeaderProps) => (
  <Group justify="space-between" mb="lg" className='dark:bg-gray-800 dark:shadow-lg dark:rounded-lg p-4'>
    <Title order={3}>Firma de Documentos</Title>
    <Button 
      variant="subtle" 
      leftSection={<IconRefresh size={16} />}
      onClick={onRefresh}
      loading={loading}
    >
      Actualizar estado
    </Button>
  </Group>
);

export default SignDocumentHeader;