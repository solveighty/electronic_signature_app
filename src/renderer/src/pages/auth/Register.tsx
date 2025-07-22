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
      <RegisterHeader />
      <Paper radius="md" p="xl" withBorder>
        <RegisterForm
          form={form}
          registerProps={registerProps}
          registerApi={registerApi}
          handleSubmit={handleSubmit}
        />
        <RegisterFooter onLogin={() => navigate("/login")} />
      </Paper>
    </Container>
  );
};

export default Register;
