import {
  Paper,
  Container,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Anchor,
  Alert,
} from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { RecoverPasswordResetFormProps } from "./types/RecoverPasswordResetFormProps";

const RecoverPasswordResetForm = ({
  form,
  loading,
  email,
  onSubmit,
  onBackToRequest,
  onBackToLogin,
}: RecoverPasswordResetFormProps) => (
  <Container size={420} my={40}>
    <Title ta="center" fw={900}>
      Restablecer Contraseña
    </Title>
    <Text c="dimmed" size="sm" ta="center" mt={5}>
      Ingresa el código de verificación enviado a <strong>{email}</strong> y
      tu nueva contraseña
    </Text>
    <Paper radius="md" p="xl" withBorder mt="xl">
      <Alert mb="md" color="blue">
        Revisa tu bandeja de entrada y carpeta de spam. El código expira en 10 minutos.
      </Alert>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          <TextInput
            label="Código de Verificación"
            placeholder="123456"
            required
            maxLength={6}
            {...form.getInputProps("resetCode")}
          />
          <PasswordInput
            label="Nueva Contraseña"
            placeholder="Tu nueva contraseña"
            required
            leftSection={<IconLock size={16} />}
            {...form.getInputProps("newPassword")}
          />
          <PasswordInput
            label="Confirmar Nueva Contraseña"
            placeholder="Confirma tu nueva contraseña"
            required
            leftSection={<IconLock size={16} />}
            {...form.getInputProps("confirmPassword")}
          />
          <Button fullWidth mt="xl" type="submit" loading={loading}>
            Restablecer Contraseña
          </Button>
          <Stack gap="xs" align="center">
            <Anchor
              component="button"
              type="button"
              c="dimmed"
              onClick={onBackToRequest}
              size="xs"
            >
              Cambiar correo electrónico
            </Anchor>
            <Anchor
              component="button"
              type="button"
              c="dimmed"
              onClick={onBackToLogin}
              size="xs"
            >
              Volver al inicio de sesión
            </Anchor>
          </Stack>
        </Stack>
      </form>
    </Paper>
  </Container>
);

export default RecoverPasswordResetForm;