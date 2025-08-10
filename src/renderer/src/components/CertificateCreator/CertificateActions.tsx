import { Alert, Button } from "@mantine/core";
import { CertificateActionsProps } from "./types/certificateActions";

const CertificateActions = ({ error, loading, onCreate }: CertificateActionsProps) => (
  <>
    {error && <Alert color="red" mt="md">{error}</Alert>}
    <Button
      color="teal"
      onClick={onCreate}
      mt="md"
      loading={loading}
    >
      Enviar Solicitud
    </Button>
  </>
);

export default CertificateActions;