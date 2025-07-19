import { useNavigate } from "react-router-dom";
import { useForm } from "@mantine/form";
import { useSpring } from "@react-spring/web";
import { register as RegisterApi } from "../utils/api";
import { toast } from 'react-toastify';

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
    try {
      await RegisterApi(
        form.values.name,
        form.values.email,
        form.values.password
      );
      toast.success('¡Cuenta creada con éxito!');
      navigate("/login");
    } catch (error: any) {
      console.error("Error al registrarse:", error);
      toast.error('Error al registrarse. Por favor, intenta de nuevo.');
    }
  };

  return {
    form,
    registerProps,
    registerApi,
    handleSubmit,
    navigate,
  };
}