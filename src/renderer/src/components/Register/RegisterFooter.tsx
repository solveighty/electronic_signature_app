import { Text, Anchor } from "@mantine/core";
import { RegisterFooterProps } from "./types/registerFooter";

const RegisterFooter = ({ onLogin }: RegisterFooterProps) => (
  <Text ta="center" mt="md">
    Ya eres miembro?{" "}
    <Anchor fw={700} onClick={onLogin}>
      Inicia sesión
    </Anchor>
  </Text>
);

export default RegisterFooter;