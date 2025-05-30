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
import { useSpring, animated } from "@react-spring/web";
import {login as LoginApi} from "../utils/api"; 

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
  // Animations
  const [loginProps, loginApi] = useSpring(() => ({
    scale: 1,
    config: { tension: 300, friction: 10 },
  }));

  const handleSubmit = async () => {
    try{
      const response = await LoginApi(form.values.email, form.values.password);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("isAuthenticated", "true");
      navigate("/main");
    } catch (error:any) {
      console.error("Error al iniciar sesión:", error);
      alert("Error al iniciar sesión. Por favor, verifica tus credenciales.");
    }
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
