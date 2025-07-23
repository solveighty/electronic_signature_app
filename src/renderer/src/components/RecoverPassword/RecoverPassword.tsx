import { useState } from "react";
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
  Group,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { IconMail, IconLock } from "@tabler/icons-react";
import {
  requestPasswordReset,
  resetPassword,
} from "../../utils/api/endpoints/auth/authApi";

type Step = "request" | "reset";

const RecoverPassword = () => {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Form for requesting password reset
  const requestForm = useForm({
    initialValues: {
      email: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Email inválido"),
    },
  });

  // Form for resetting password
  const resetForm = useForm({
    initialValues: {
      resetCode: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: {
      resetCode: (value) =>
        value.length !== 6 ? "El código debe tener 6 dígitos" : null,
      newPassword: (value) =>
        value.length < 6
          ? "La contraseña debe tener al menos 6 caracteres"
          : null,
      confirmPassword: (value, values) =>
        value !== values.newPassword ? "Las contraseñas no coinciden" : null,
    },
  });

  const handleRequestReset = async (values: { email: string }) => {
    setLoading(true);
    try {
      requestPasswordReset(values.email);
      setTimeout(() => {
        setEmail(values.email);
        setStep("reset");
        toast.success(
          "Se ha enviado un código de verificación a tu correo electrónico"
        );
      }, 2000);
    } catch (error: unknown) {
      console.error("Error requesting password reset:", error);
      toast.error("Error al solicitar el restablecimiento de contraseña");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values: {
    resetCode: string;
    newPassword: string;
  }) => {
    setLoading(true);
    try {
      await resetPassword(email, values.resetCode, values.newPassword);
      toast.success("Contraseña restablecida exitosamente");
      navigate("/login");
    } catch (error: unknown) {
      console.error("Error resetting password:", error);
      const errorMessage =
        error instanceof Error && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : "Error al restablecer la contraseña";
      toast.error(errorMessage || "Error al restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  const handleBackToRequest = () => {
    setStep("request");
    resetForm.reset();
  };

  if (step === "request") {
    return (
      <Container size={420} my={40}>
        <Title ta="center" fw={900}>
          Recuperar Contraseña
        </Title>

        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Ingresa tu dirección de correo electrónico y te enviaremos un código
          para restablecer tu contraseña
        </Text>

        <Paper radius="md" p="xl" withBorder mt="xl">
          <form onSubmit={requestForm.onSubmit(handleRequestReset)}>
            <Stack>
              <TextInput
                label="Correo electrónico"
                placeholder="tu@correo.com"
                required
                leftSection={<IconMail size={16} />}
                {...requestForm.getInputProps("email")}
              />

              <Button fullWidth mt="xl" type="submit" loading={loading}>
                Enviar Código de Verificación
              </Button>

              <Group justify="center">
                <Anchor
                  component="button"
                  type="button"
                  c="dimmed"
                  onClick={handleBackToLogin}
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
  }

  return (
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
          Revisa tu bandeja de entrada y carpeta de spam. El código expira en 10
          minutos.
        </Alert>

        <form onSubmit={resetForm.onSubmit(handleResetPassword)}>
          <Stack>
            <TextInput
              label="Código de Verificación"
              placeholder="123456"
              required
              maxLength={6}
              {...resetForm.getInputProps("resetCode")}
            />

            <PasswordInput
              label="Nueva Contraseña"
              placeholder="Tu nueva contraseña"
              required
              leftSection={<IconLock size={16} />}
              {...resetForm.getInputProps("newPassword")}
            />

            <PasswordInput
              label="Confirmar Nueva Contraseña"
              placeholder="Confirma tu nueva contraseña"
              required
              leftSection={<IconLock size={16} />}
              {...resetForm.getInputProps("confirmPassword")}
            />

            <Button fullWidth mt="xl" type="submit" loading={loading}>
              Restablecer Contraseña
            </Button>

            <Stack gap="xs" align="center">
              <Anchor
                component="button"
                type="button"
                c="dimmed"
                onClick={handleBackToRequest}
                size="xs"
              >
                {" "}
                Cambiar correo electrónico
              </Anchor>

              <Anchor
                component="button"
                type="button"
                c="dimmed"
                onClick={handleBackToLogin}
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
};

export default RecoverPassword;
