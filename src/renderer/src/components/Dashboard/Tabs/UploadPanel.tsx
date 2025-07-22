import { Grid, Paper, Center, Title, Text, Group, Button, Loader, Box, Badge } from '@mantine/core';
import { IconCertificate, IconKey, IconTrash, IconFileText, IconFileUpload } from '@tabler/icons-react';

const UploadPanel = ({ logic }: { logic: any }) => (
  <Grid>
    {/* Certificado Digital */}
    <Grid.Col span={{ base: 12, md: 6 }}>
      <Paper radius="md" p="xl" withBorder h="100%"
        className='bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'>
        <Center style={{ flexDirection: 'column' }} py="lg">
          <IconCertificate size={48} color="teal" />
          <Title order={3} mt="md">Certificado Digital</Title>
          <Text c="dimmed" mt="xs" mb="lg" ta="center">
            {logic.certificateFile
              ? "Ya tienes un certificado. Puedes reemplazarlo si lo necesitas."
              : "Sube tu archivo .p12 para firmar documentos"}
          </Text>

          <Group>
            <label htmlFor="certificate-upload">
              <Button
                component="span"
                leftSection={<IconKey size={18} />}
                style={{ cursor: 'pointer' }}
                loading={logic.isLoadingCertificate}
                color="teal"
              >
                {logic.isLoadingCertificate
                  ? 'Procesando...'
                  : logic.certificateFile
                    ? 'Reemplazar certificado'
                    : 'Seleccionar certificado'}
                <input
                  id="certificate-upload"
                  name="certificate-upload"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={logic.handleCertificateUploadWithKey}
                  accept=".p12"
                  disabled={logic.isLoadingCertificate}
                />
              </Button>
            </label>

            {/* Botón para eliminar certificado */}
            {logic.certificateFile && (
              <Button
                color="red"
                variant="outline"
                onClick={logic.openDeleteCertificateModal}
                leftSection={<IconTrash size={18} />}
                disabled={logic.isLoadingCertificate}
              >
                Eliminar
              </Button>
            )}
          </Group>

          {logic.isLoadingDocuments ? (
            <Center>
              <Loader size="sm" />
            </Center>
          ) : (
            logic.certificateFile && (
              <Box mt="md">
                <Text size="sm" c="dimmed" mb="xs">Certificado actual:</Text>
                <Badge color="teal" size="lg" variant="light">
                  {logic.certificateFile.name}
                </Badge>
                {logic.certificateFile.createdAt && (
                  <Text size="xs" c="dimmed" mt={5}>
                    Subido el {logic.formatDate(logic.certificateFile.createdAt)}
                  </Text>
                )}
              </Box>
            )
          )}
        </Center>
      </Paper>
    </Grid.Col>

    {/* Documento PDF */}
    <Grid.Col span={{ base: 12, md: 6 }}>
      <Paper radius="md" p="xl" withBorder h="100%"
        className='bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'>
        <Center style={{ flexDirection: 'column' }} py="lg">
          <IconFileText size={48} color="blue" />
          <Title order={3} mt="md">Documento PDF</Title>
          <Text c="dimmed" mt="xs" mb="lg" ta="center">
            Sube el documento PDF que quieres firmar
          </Text>

          <label htmlFor="pdf-upload">
            <Button
              component="span"
              leftSection={<IconFileUpload size={18} />}
              style={{ cursor: 'pointer' }}
              loading={logic.isLoadingPdf}
              color="blue"
            >
              {logic.isLoadingPdf ? 'Subiendo...' : 'Seleccionar PDF'}
              <input
                id="pdf-upload"
                name="pdf-upload"
                type="file"
                style={{ display: 'none' }}
                onChange={(e) => logic.handleFileChange(e, 'pdf')}
                accept=".pdf"
                disabled={logic.isLoadingPdf}
              />
            </Button>
          </label>
        </Center>
      </Paper>
    </Grid.Col>
  </Grid>
);

export default UploadPanel;