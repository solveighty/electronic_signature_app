import {
  Anchor,
  Button,
  Center,
  Container,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { animated } from "@react-spring/web";
import { useRegisterLogic } from "../hooks/useRegisterLogic";

const Register = () => {
  const { form, registerProps, registerApi, handleSubmit, navigate } =
    useRegisterLogic();

  return (
    <Container size={420} my={40}>
      <Center>
        <Title ta="center" order={2} mb="lg">
          Registrarse
        </Title>
      </Center>

      <Paper radius="md" p="xl" withBorder>
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

        <Text ta="center" mt="md">
          Ya eres miembro?{" "}
          <Anchor fw={700} onClick={() => navigate("/login")}>
            Inicia sesión
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
};

export default Register;
