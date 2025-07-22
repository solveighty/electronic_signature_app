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
import { animated } from "@react-spring/web";
import { useLoginLogic } from "../../hooks/auth/useLoginLogic";

const Login = () => {
  const { form, loginProps, loginApi, handleSubmit, navigate } = useLoginLogic();

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
