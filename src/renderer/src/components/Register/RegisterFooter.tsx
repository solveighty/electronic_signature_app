import { Text, Anchor } from "@mantine/core";

interface RegisterFooterProps {
  onLogin: () => void;
}

const RegisterFooter = ({ onLogin }: RegisterFooterProps) => (
  <Text ta="center" mt="md">
    Ya eres miembro?{" "}
    <Anchor fw={700} onClick={onLogin}>
      Inicia sesión
    </Anchor>
  </Text>
);

export default RegisterFooter;