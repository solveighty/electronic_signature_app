import { Title, Group, Text } from "@mantine/core";
import { IconCertificate } from "@tabler/icons-react";

const CertificateHeader = () => (
  <>
    <Title order={3} mb="lg" ta="center">
      Solicitar Certificado Digital
    </Title>
    <Group mb="md" justify="center">
      <IconCertificate size={32} color="teal" />
  <Text fw={500}>Ingresa y envía los datos para tu certificado</Text>
    </Group>
  </>
);

export default CertificateHeader;