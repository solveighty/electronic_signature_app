import { Paper, Container } from "@mantine/core";
import { useLoginLogic } from "../../hooks/auth/useLoginLogic";
import LoginHeader from "../../components/Login/LoginHeader";
import LoginForm from "../../components/Login/LoginForm";
import LoginFooter from "../../components/Login/LoginFooter";

const Login = () => {
  const { form, loginProps, loginApi, handleSubmit, navigate } =
    useLoginLogic();

  return (
    <Container size={420} my={40}>
      {/* Header de Inicio de Sesión */}
      <LoginHeader />

      <Paper
        radius="md"
        p="xl"
        withBorder
        className="bg-white dark:bg-[#23293a] dark:text-gray-100 border border-gray-200 dark:border-[#475569] shadow-lg"
      >
        {/* Formulario de Inicio de Sesión */}
        <LoginForm
          form={form}
          loginProps={loginProps}
          loginApi={loginApi}
          handleSubmit={handleSubmit}
        />
        {/* Pie de página con enlace a Registro */}
        <LoginFooter
          onRegister={() => navigate("/register")}
          onRecoverPass={() => navigate("/recover-password")}
        />
      </Paper>
    </Container>
  );
};

export default Login;
