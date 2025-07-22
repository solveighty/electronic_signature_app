import { Container, Paper } from "@mantine/core";
import { useCertificateCreatorLogic } from "../../hooks/documents/useCertificateCreatorLogic";
import CertificateForm from "../../components/CertificateCreator/CertificateForm";
import CertificateHeader from "../../components/CertificateCreator/CertificateHeader";
import CertificateActions from "../../components/CertificateCreator/CertificateActions";

const CertificateCreator = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { form, error, loading, handleChange, handleCreateCertificate } =
    useCertificateCreatorLogic(onSuccess);

  return (
    <Container
      size="sm"
      py="xl"
      className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
    >
      {/* Header de Certificado */}
      <CertificateHeader />
      <Paper
        radius="md"
        p="xl"
        withBorder
        className="dark:bg-gray-800 dark:shadow-lg dark:rounded-lg dark:text-gray-100"
      >
        {/* Formulario de Certificado */}
        <CertificateForm form={form} handleChange={handleChange} />

        {/* Acciones del Certificado */}
        <CertificateActions
          error={error}
          loading={loading}
          onCreate={handleCreateCertificate}
        />
      </Paper>
    </Container>
  );
};

export default CertificateCreator;