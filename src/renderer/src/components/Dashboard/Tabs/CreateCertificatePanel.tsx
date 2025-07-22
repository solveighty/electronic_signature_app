import { Group, Button, Box, Text, Modal } from '@mantine/core';
import { IconCertificate, IconAlertCircle } from '@tabler/icons-react';
import CertificateCreator from '../../../pages/CertificateCreator';

const CreateCertificatePanel = ({ logic }: { logic: any }) => (
  <>
    <Group justify="center">
      <Button
        onClick={() => {
          if (logic.certificateFile) {
            logic.setOverwriteModalOpened(true);
          } else {
            logic.setShowCreator((prev: boolean) => !prev);
          }
        }}
        color={logic.showCreator ? "red" : "teal"}
        leftSection={<IconCertificate size={18} />}
      >
        {logic.showCreator ? 'Cancelar' : 'Crear Certificado'}
      </Button>
    </Group>

    {logic.showCreator && (
      <Box mt="xl">
        <CertificateCreator onSuccess={() => {
          logic.setShowCreator(false);
          logic.refreshCertificate();
          logic.refreshDocuments();
        }} />
      </Box>
    )}

    {/* Modal de confirmación para sobreescribir certificado */}
    <Modal
      opened={logic.overwriteModalOpened}
      onClose={() => logic.setOverwriteModalOpened(false)}
      title={
        <Group>
          <IconAlertCircle size={20} color="orange" />
          <Text fw={700}>Sobrescribir certificado</Text>
        </Group>
      }
      centered
    >
      <Text mb="xl">
        Actualmente ya cuentas con un certificado digital. ¿Deseas sobrescribirlo? Esta acción reemplazará tu certificado actual.
      </Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={() => logic.setOverwriteModalOpened(false)}>
          Cancelar
        </Button>
        <Button
          color="teal"
          onClick={() => {
            logic.setOverwriteModalOpened(false);
            logic.setShowCreator(true);
          }}
        >
          Sí, sobrescribir
        </Button>
      </Group>
    </Modal>
  </>
);

export default CreateCertificatePanel;