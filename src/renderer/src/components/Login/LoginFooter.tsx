import { Text, Anchor } from "@mantine/core";
import { LoginFooterProps } from "./types/loginFooter";

const LoginFooter = ({ onRegister, onRecoverPass }: LoginFooterProps) => (
  <Text ta="center" mt="md">
    ¿No tienes cuenta?{" "}
    <Anchor fw={700} onClick={onRegister}>
      Regístrate
    </Anchor>
    <br />
    <Anchor fw={700} onClick={onRecoverPass}>
      ¿Olvidaste tu contraseña?
    </Anchor>
  </Text>
);

export default LoginFooter;
