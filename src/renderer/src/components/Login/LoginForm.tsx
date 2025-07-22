import { TextInput, PasswordInput, Button } from "@mantine/core";
import { animated } from "@react-spring/web";
import { LoginFormProps } from "./types/loginForm";

const LoginForm = ({ form, loginProps, loginApi, handleSubmit }: LoginFormProps) => (
  <form onSubmit={form.onSubmit(handleSubmit)}>
    <TextInput
      label="Correo electrónico"
      placeholder="ejemplo@correo.com"
      required
      mb="md"
      {...form.getInputProps("email")}
    />

    <PasswordInput
      label="Contraseña"
      placeholder="Tu contraseña"
      required
      mb="md"
      {...form.getInputProps("password")}
    />

    <animated.div style={loginProps}>
      <Button
        fullWidth
        mt="xl"
        type="submit"
        onMouseDown={() => loginApi.start({ scale: 0.95 })}
        onMouseUp={() => loginApi.start({ scale: 1 })}
        onMouseLeave={() => loginApi.start({ scale: 1 })}
      >
        Iniciar Sesión
      </Button>
    </animated.div>
  </form>
);

export default LoginForm;