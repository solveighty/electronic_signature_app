import { Container, Paper } from "@mantine/core";
import { useRegisterLogic } from "../../hooks/auth/useRegisterLogic";
import RegisterForm from "../../components/Register/RegisterForm";
import RegisterHeader from "../../components/Register/RegisterHeader";
import RegisterFooter from "../../components/Register/RegisterFooter";

const Register = () => {
  const { form, registerProps, registerApi, handleSubmit, navigate } =
    useRegisterLogic();

  return (
    <Container size={420} my={40}>
      {/* Header de Registro */}
      <RegisterHeader />
      {/* Contenedor principal del formulario de registro */}
      <Paper
        radius="md"
        p="xl"
        withBorder
        className="bg-white dark:bg-[#23293a] dark:text-gray-100 border border-gray-200 dark:border-[#475569] shadow-lg"
      >
        <RegisterForm
          form={form}
          registerProps={registerProps}
          registerApi={registerApi}
          handleSubmit={handleSubmit}
        />
        {/* Pie de página con enlace a inicio de sesión */}
        <RegisterFooter onLogin={() => navigate("/login")} />
      </Paper>
    </Container>
  );
};

export default Register;
