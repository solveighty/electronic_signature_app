import {
  Container,
  Paper,
  Text,
} from "@mantine/core";
import { useVerifyOTPLogic } from "../../hooks/auth/useVerifyOTPLogic";
import VerifyOTPForm from "./components/VerifyOTPForm";
import VerifyOTPHeader from "./components/VerifyOTPHeader";
import VerifyOTPActions from "./components/VerifyOTPActions";

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
      {/* Header de verificación */}
      <VerifyOTPHeader email={email} />
      <Paper radius="md" p="xl" withBorder>
        {/* Formulario de verificación de OTP */}
        <VerifyOTPForm
          form={form}
          isLoading={isLoading}
          verifyProps={verifyProps}
          verifyApi={verifyApi}
          handleSubmit={handleSubmit}
          handleOTPChange={handleOTPChange}
        />
        {/* Acciones de verificación */}
        <VerifyOTPActions
          resendProps={resendProps}
          resendApi={resendApi}
          isResending={isResending}
          countdown={countdown}
          handleResendCode={handleResendCode}
          navigate={navigate}
        />

        <Text ta="center" c="dimmed" size="xs" mt="md">
          No recibiste el código? Revisa tu carpeta de spam o solicita uno nuevo
        </Text>
      </Paper>
    </Container>
  );
};

export default VerifyOTP;
