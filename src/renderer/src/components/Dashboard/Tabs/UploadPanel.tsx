import { Grid, Paper, Center, Title, Text, Button, Box, Badge } from '@mantine/core';
import { IconCertificate, IconKey, IconFileText, IconFileUpload } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

const isDarkMode = () => {
  if (typeof window !== 'undefined') {
    return document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
  }
  return false;
};

const UploadPanel = ({ logic }: { logic: any }) => {
  const [dark, setDark] = useState(isDarkMode());
  useEffect(() => {
    const observer = new MutationObserver(() => setDark(isDarkMode()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <Grid gutter="xl" justify="center">
      {/* Certificado Digital */}
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Paper
          radius="xl"
          p="xl"
          withBorder
          h="100%"
          shadow="lg"
          style={{
            background: dark ? '#23293a' : 'linear-gradient(135deg, #e0f7fa 0%, #ffffff 100%)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer',
            boxShadow: '0 4px 24px rgba(38,166,154,0.08)',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
        <Center style={{ flexDirection: 'column' }} py="lg">
          <IconCertificate size={64} color="#26A69A" />
          <Title
            order={3}
            mt="md"
            className="text-gray-800 dark:text-white"
            style={{ color: dark ? '#26A69A' : undefined }}
          >
            Certificado Digital
          </Title>
          <Text c="dimmed" mt="xs" mb="lg" ta="center" size="md" className="dark:text-gray-300">
            Sube tu archivo <b>.p12</b> para firmar documentos digitalmente.
          </Text>
          <Button
            leftSection={<IconKey size={20} />}
            color="teal"
            size="md"
            style={{ minWidth: 200 }}
            loading={logic.isLoadingCertificate}
            onClick={() => document.getElementById('certificate-upload')?.click()}
          >
            {logic.certificateFile ? 'Reemplazar certificado' : 'Seleccionar certificado'}
          </Button>
          <input
            id="certificate-upload"
            type="file"
            style={{ display: 'none' }}
            onChange={logic.handleCertificateUploadWithKey}
            accept=".p12"
            disabled={logic.isLoadingCertificate}
          />
          {logic.certificateFile && (
            <Box mt="md">
              <Badge color="teal" size="lg" variant="light">
                {logic.certificateFile.name}
              </Badge>
              <Text size="xs" c="dimmed" mt={5}>
                Subido el {logic.formatDate(logic.certificateFile.createdAt)}
              </Text>
            </Box>
          )}
        </Center>
      </Paper>
    </Grid.Col>

    {/* Documento PDF */}
    <Grid.Col span={{ base: 12, md: 6 }}>
      <Paper
        radius="xl"
        p="xl"
        withBorder
        h="100%"
        shadow="lg"
        style={{
          background: dark ? '#23293a' : 'linear-gradient(135deg, #e3f0ff 0%, #ffffff 100%)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
          boxShadow: '0 4px 24px rgba(33,150,243,0.08)',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <Center style={{ flexDirection: 'column' }} py="lg">
          <IconFileText size={64} color="#2196F3" />
          <Title
            order={3}
            mt="md"
            className="text-gray-800 dark:text-white"
            style={{ color: dark ? '#2196F3' : undefined }}
          >
            Documento PDF
          </Title>
          <Text c="dimmed" mt="xs" mb="lg" ta="center" size="md" className="dark:text-gray-300">
            Sube el documento PDF que quieres firmar electrónicamente.
          </Text>
          <Button
            leftSection={<IconFileUpload size={20} />}
            color="blue"
            size="md"
            style={{ minWidth: 200 }}
            loading={logic.isLoadingPdf}
            onClick={() => document.getElementById('pdf-upload')?.click()}
          >
            {logic.isLoadingPdf ? 'Subiendo...' : 'Seleccionar PDF'}
          </Button>
          <input
            id="pdf-upload"
            type="file"
            style={{ display: 'none' }}
            onChange={e => logic.handleFileChange(e, 'pdf')}
            accept=".pdf"
            disabled={logic.isLoadingPdf}
          />
        </Center>
      </Paper>
    </Grid.Col>
  </Grid>

  );
};

export default UploadPanel;