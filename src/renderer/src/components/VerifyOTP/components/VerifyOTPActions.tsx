import { Button, Group } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { animated } from "@react-spring/web";
import { VerifyOTPActionsProps } from "./types/VerifyOTPActionsProps";

const VerifyOTPActions = ({
  resendProps,
  resendApi,
  isResending,
  countdown,
  handleResendCode,
  navigate,
}: VerifyOTPActionsProps) => (
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
);

export default VerifyOTPActions;