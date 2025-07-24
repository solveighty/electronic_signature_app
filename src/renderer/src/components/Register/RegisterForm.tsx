import { TextInput, PasswordInput, Button } from "@mantine/core";
import { animated } from "@react-spring/web";
import { RegisterFormProps } from "./types/registerForm";

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/; // Al menos 8 caracteres, una mayúscula y un número

const RegisterForm = ({ form, registerProps, registerApi, handleSubmit }: RegisterFormProps) => {
  const customHandleSubmit = (values: any) => {
    let hasError = false;
    if (!values.name) {
      form.setFieldError("name", "El nombre es obligatorio");
      hasError = true;
    }
    if (!values.email.includes("@")) {
      form.setFieldError("email", "El correo electrónico debe ser válido");
      hasError = true;
    }
    if (!passwordRegex.test(values.password)) {
      form.setFieldError("password", "La contraseña debe tener al menos 8 caracteres, una mayúscula y un número");
      hasError = true;
    }
    if (values.password !== values.confirmPassword) {
      form.setFieldError("confirmPassword", "Las contraseñas no coinciden");
      hasError = true;
    }
    if (!hasError) {
      handleSubmit(values);
    }
  };

  return (
    <form onSubmit={form.onSubmit(customHandleSubmit)}>
      <TextInput
        label="Tu nombre"
        style={{ textAlign: "left" }}
        placeholder="ej. Juan Pérez"
        required
        mb="md"
        {...form.getInputProps("name")}
        error={form.errors.name}
      />

      <TextInput
        label="Correo electrónico"
        style={{ textAlign: "left" }}
        placeholder="ejemplo@correo.com"
        required
        mb="md"
        {...form.getInputProps("email")}
        error={form.errors.email}
        description="Usaremos este correo para enviarte un código de verificación"
      />

      <PasswordInput
        label="Contraseña"
        style={{ textAlign: "left" }}
        placeholder="Tu contraseña"
        required
        mb="md"
        {...form.getInputProps("password")}
        description="Mínimo 8 caracteres, una mayúscula y un número"
        error={form.errors.password}
      />

      <PasswordInput
        label="Confirmar Contraseña"
        style={{ textAlign: "left" }}
        placeholder="Confirma tu contraseña"
        required
        mb="md"
        {...form.getInputProps("confirmPassword")}
        error={form.errors.confirmPassword}
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
};

export default RegisterForm;