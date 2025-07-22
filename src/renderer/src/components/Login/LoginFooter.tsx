import { Text, Anchor } from "@mantine/core";
import { LoginFooterProps } from "./types/loginFooter";

const LoginFooter = ({ onRegister }: LoginFooterProps) => (
  <Text ta="center" mt="md">
    ¿No tienes cuenta?{" "}
    <Anchor fw={700} onClick={onRegister}>
      Regístrate
    </Anchor>
  </Text>
);

export default LoginFooter;