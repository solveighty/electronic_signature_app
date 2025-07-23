import { Box, Text, Button } from "@mantine/core";
import { animated } from "@react-spring/web";
import OTPInput from "../OTPInput";
import { VerifyOTPFormProps } from "./types/VerifyOTPFormProps";

const VerifyOTPForm = ({
  form,
  isLoading,
  verifyProps,
  verifyApi,
  handleSubmit,
  handleOTPChange,
}: VerifyOTPFormProps) => (
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
);

export default VerifyOTPForm;