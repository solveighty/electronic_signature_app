import { useNavigate } from "react-router-dom";
import { useForm } from "@mantine/form";
import { useSpring } from "@react-spring/web";
import { login as LoginApi } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from 'react-toastify';

export function useLoginLogic() {
  const navigate = useNavigate();
  const { setToken, setUserName } = useAuth();

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

  const [loginProps, loginApi] = useSpring(() => ({
    scale: 1,
    config: { tension: 300, friction: 10 },
  }));

  const handleSubmit = async () => {
    try {
      const response = await LoginApi(form.values.email, form.values.password);
      setToken(response.data.token);

      if (response.data.user && response.data.user.name) {
        setUserName(response.data.user.name);
      } else {
        setUserName(form.values.email.split('@')[0]);
      }

      toast.success('¡Inicio de sesión exitoso!');
      navigate("/main");
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error);
      toast.error('Error al iniciar sesión. Verifica tus credenciales.');
    }
  };

  return {
    form,
    loginProps,
    loginApi,
    handleSubmit,
    navigate,
  };
}