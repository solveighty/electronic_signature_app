import { useNavigate } from "react-router-dom";
import { useForm } from "@mantine/form";
import { useSpring } from "@react-spring/web";
import { register as RegisterApi } from "../../utils/api/api";
import { handleRegister } from "./handle/registerLogic";

export function useRegisterLogic() {
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validate: {
      name: (value) => (value.length < 1 ? "Nombre es requerido" : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Email inválido"),
      password: (value) =>
        value.length < 1 ? "Contraseña es requerida" : null,
      confirmPassword: (value, values) =>
        value !== values.password ? "Las contraseñas no coinciden" : null,
    },
  });

  const [registerProps, registerApi] = useSpring(() => ({
    scale: 1,
    config: { tension: 300, friction: 10 },
  }));

  const handleSubmit = async () => {
    await handleRegister({
      name: form.values.name,
      email: form.values.email,
      password: form.values.password,
      registerApi: RegisterApi,
      navigate,
    });
  };

  return {
    form,
    registerProps,
    registerApi,
    handleSubmit,
    navigate,
  };
}