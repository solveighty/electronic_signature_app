import { useNavigate } from "react-router-dom";
import { useForm } from "@mantine/form";
import { useSpring } from "@react-spring/web";
import { login as LoginApi } from "../../utils/api/api";
import { useAuth } from "../../context/AuthContext";
import { handleLogin } from "./handle/loginLogic";

export function useLoginLogic() {
  const navigate = useNavigate();
  const { setToken, setUserName, setIsAdmin, setUserId } = useAuth();

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
    await handleLogin({
      email: form.values.email,
      password: form.values.password,
      loginApi: LoginApi,
      setToken,
      setUserName,
      setIsAdmin,
      setUserId,
      navigate,
    });
  };

  return {
    form,
    loginProps,
    loginApi,
    handleSubmit,
    navigate,
  };
}