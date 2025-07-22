import { TextInput, PasswordInput, Button } from "@mantine/core";
import { animated } from "@react-spring/web";
import { RegisterFormProps } from "./types/registerForm";

const RegisterForm = ({ form, registerProps, registerApi, handleSubmit }: RegisterFormProps) => (
  <form onSubmit={form.onSubmit(handleSubmit)}>
    <TextInput
      label="Tu nombre"
      style={{ textAlign: "left" }}
      placeholder="ej. Juan Pérez"
      required
      mb="md"
      {...form.getInputProps("name")}
    />

    <TextInput
      label="Correo electrónico"
      style={{ textAlign: "left" }}
      placeholder="ejemplo@correo.com"
      required
      mb="md"
      {...form.getInputProps("email")}
    />

    <PasswordInput
      label="Contraseña"
      style={{ textAlign: "left" }}
      placeholder="Tu contraseña"
      required
      mb="md"
      {...form.getInputProps("password")}
    />

    <PasswordInput
      label="Confirmar Contraseña"
      style={{ textAlign: "left" }}
      placeholder="Confirma tu contraseña"
      required
      mb="md"
      {...form.getInputProps("confirmPassword")}
    />

    <animated.div style={registerProps}>
      <Button
        fullWidth
        mt="xl"
        type="submit"
        onMouseDown={() => registerApi.start({ scale: 0.95 })}
        onMouseUp={() => registerApi.start({ scale: 1 })}
        onMouseLeave={() => registerApi.start({ scale: 1 })}
      >
        Registrarse
      </Button>
    </animated.div>
  </form>
);

export default RegisterForm;