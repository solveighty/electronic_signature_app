import {
  Paper,
  Container,
  TextInput,
  Button,
  Title,
  Text,
  Stack,
  Anchor,
  Group,
} from "@mantine/core";
import { IconMail } from "@tabler/icons-react";
import { RecoverPasswordRequestFormProps } from "./types/RecoverPasswordRequestFormProps";

const RecoverPasswordRequestForm = ({
  form,
  loading,
  onSubmit,
  onBackToLogin,
}: RecoverPasswordRequestFormProps) => (
  <Container size={420} my={40}>
    <Title ta="center" fw={900}>
      Recuperar Contraseña
    </Title>
    <Text c="dimmed" size="sm" ta="center" mt={5}>
      Ingresa tu dirección de correo electrónico y te enviaremos un código
      para restablecer tu contraseña
    </Text>
    <Paper radius="md" p="xl" withBorder mt="xl">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack>
          <TextInput
            label="Correo electrónico"
            placeholder="tu@correo.com"
            required
            leftSection={<IconMail size={16} />}
            {...form.getInputProps("email")}
          />
          <Button fullWidth mt="xl" type="submit" loading={loading}>
            Enviar Código de Verificación
          </Button>
          <Group justify="center">
            <Anchor
              component="button"
              type="button"
              c="dimmed"
              onClick={onBackToLogin}
              size="xs"
            >
              Volver al inicio de sesión
            </Anchor>
          </Group>
        </Stack>
      </form>
    </Paper>
  </Container>
);

export default RecoverPasswordRequestForm;