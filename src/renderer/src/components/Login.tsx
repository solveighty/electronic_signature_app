import { useNavigate } from "react-router-dom";
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Container,
  Anchor,
  Center,
} from "@mantine/core";
import { useForm } from "@mantine/form";

const Login = () => {
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Email inválido"),
      password: (value) =>
        value.length < 1 ? "Contraseña es requerida" : null,
    },
  });
  const handleSubmit = () => {
    localStorage.setItem("isAuthenticated", "true");
    navigate("/main");
  };

  return (
    <Container size={420} my={40}>
      <Center>
        <Title ta="center" order={2} mb="lg">
          Iniciar Sesión
        </Title>
      </Center>

      <Paper radius="md" p="xl" withBorder>
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

          <Button fullWidth mt="xl" type="submit">
            Iniciar Sesión
          </Button>
        </form>

        <Text ta="center" mt="md">
          ¿No tienes cuenta?{" "}
          <Anchor fw={700} onClick={() => navigate("/register")}>
            Regístrate
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
};

export default Login;
