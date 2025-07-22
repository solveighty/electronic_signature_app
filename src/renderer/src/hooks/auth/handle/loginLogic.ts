import { toast } from 'react-toastify';

export async function handleLogin({
  email,
  password,
  loginApi,
  setToken,
  setUserName,
  navigate,
}: {
  email: string;
  password: string;
  loginApi: (email: string, password: string) => Promise<any>;
  setToken: (token: string | null) => void;
  setUserName: (name: string | null) => void;
  navigate: (path: string) => void;
}) {
  try {
    const response = await loginApi(email, password);
    setToken(response.data.token);

    if (response.data.user && response.data.user.name) {
      setUserName(response.data.user.name);
    } else {
      setUserName(email.split('@')[0]);
    }

    toast.success('¡Inicio de sesión exitoso!');
    navigate("/main");
  } catch (error: any) {
    console.error("Error al iniciar sesión:", error);
    toast.error('Error al iniciar sesión. Verifica tus credenciales.');
  }
}