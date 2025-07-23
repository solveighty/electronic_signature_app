import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Center,
  Stack,
  Box,
} from "@mantine/core";
import { IconMail, IconArrowLeft } from "@tabler/icons-react";
import { animated } from "@react-spring/web";
import { useVerifyOTPLogic } from "../../hooks/auth/useVerifyOTPLogic";
import OTPInput from "./OTPInput";

const VerifyOTP = () => {
  const logic = useVerifyOTPLogic();

  // If logic is null (no email), the useEffect will handle redirect
  if (!logic || !logic.email) {
    return null;
  }

  const {
    form,
    email,
    isLoading,
    isResending,
    countdown,
    verifyProps,
    verifyApi,
    resendProps,
    resendApi,
    handleSubmit,
    handleResendCode,
    navigate,
  } = logic;

  const handleOTPChange = (value: string) => {
    form.setFieldValue("code", value);
  };

  return (
    <Container size={420} my={40}>
      <Center>
        <Stack align="center" gap="md" mb="xl">
          <IconMail size={64} color="#228be6" />
          <Title order={2} ta="center" style={{ color: "#228be6" }}>
            Verificar tu cuenta
          </Title>
          <Text ta="center" c="dimmed" size="sm">
            Hemos enviado un código de verificación de 6 dígitos a
          </Text>
          <Text ta="center" fw={500} c="blue">
            {email}
          </Text>
          <Text ta="center" c="dimmed" size="sm">
            Ingresa el código para verificar tu cuenta
          </Text>
        </Stack>
      </Center>

      <Paper radius="md" p="xl" withBorder>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Box mb="md">
            <Text size="sm" fw={500} mb="xs" ta="center">
              Código de verificación
            </Text>
            <OTPInput
              length={6}
              value={form.values.code}
              onChange={handleOTPChange}
              error={form.errors.code as string}
            />
            {form.errors.code && (
              <Text c="red" size="xs" ta="center" mt="xs">
                {form.errors.code}
              </Text>
            )}
          </Box>

          <animated.div style={verifyProps}>
            <Button
              fullWidth
              mt="xl"
              type="submit"
              loading={isLoading}
              onMouseDown={() => verifyApi.start({ scale: 0.95 })}
              onMouseUp={() => verifyApi.start({ scale: 1 })}
              onMouseLeave={() => verifyApi.start({ scale: 1 })}
            >
              Verificar cuenta
            </Button>
          </animated.div>
        </form>

        <Group justify="space-between" mt="md">
          <Button
            variant="subtle"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate("/register")}
          >
            Volver al registro
          </Button>

          <animated.div style={resendProps}>
            <Button
              variant="light"
              loading={isResending}
              disabled={countdown > 0}
              onClick={handleResendCode}
              onMouseDown={() => resendApi.start({ scale: 0.95 })}
              onMouseUp={() => resendApi.start({ scale: 1 })}
              onMouseLeave={() => resendApi.start({ scale: 1 })}
            >
              {countdown > 0 ? `Reenviar en ${countdown}s` : "Reenviar código"}
            </Button>
          </animated.div>
        </Group>

        <Text ta="center" c="dimmed" size="xs" mt="md">
          No recibiste el código? Revisa tu carpeta de spam o solicita uno nuevo
        </Text>
      </Paper>
    </Container>
  );
};

export default VerifyOTP;
