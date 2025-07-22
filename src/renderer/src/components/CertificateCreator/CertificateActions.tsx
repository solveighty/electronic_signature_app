import { Alert, Button } from "@mantine/core";

interface CertificateActionsProps {
  error: string | null;
  loading: boolean;
  onCreate: () => void;
}

const CertificateActions = ({ error, loading, onCreate }: CertificateActionsProps) => (
  <>
    {error && <Alert color="red" mt="md">{error}</Alert>}
    <Button
      color="teal"
      onClick={onCreate}
      mt="md"
      loading={loading}
    >
      Crear Certificado
    </Button>
  </>
);

export default CertificateActions;