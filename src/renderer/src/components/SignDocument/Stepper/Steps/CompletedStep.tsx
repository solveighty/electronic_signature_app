import { Paper, Center, Text, Card, Group, Badge, Flex, Button } from '@mantine/core';
import { IconCheck, IconFile, IconDownload } from '@tabler/icons-react';

const CompletedStep = ({ logic }: { logic: any }) => (
  <Paper radius="md" p="xl" withBorder mt="xl">
    <Center mb="lg">
      <IconCheck size={48} color="green" stroke={1.5} />
    </Center>
    <Text ta="center" mb="md" fw={700}>¡Documento firmado correctamente!</Text>
    <Text ta="center" c="dimmed" mb="xl">
      Tu documento ha sido firmado digitalmente y está listo para descargar.
    </Text>
    {logic.selectedDocument && (
      <Card withBorder radius="md" mb="xl" padding="md">
        <Group justify="space-between">
          <Group>
            <IconFile size={20} />
            <div>
              <Text fw={500}>{logic.selectedDocument.name}</Text>
              <Text size="xs" c="dimmed">
                Firmado electrónicamente el {new Date().toLocaleDateString()}
              </Text>
            </div>
          </Group>
          <Badge color="green">Firmado</Badge>
        </Group>
      </Card>
    )}
    <Flex gap="md" justify="center">
      <Button
        leftSection={<IconDownload size={16} />}
        onClick={logic.handleDownloadSignedDocument}
        color="teal"
      >
        Descargar documento firmado
      </Button>
      <Button
        variant="outline"
        onClick={logic.handleReset}
      >
        Firmar otro documento
      </Button>
    </Flex>
  </Paper>
);

export default CompletedStep;