import { toast } from 'react-toastify';

export async function handleLogin({
  email,
  password,
  loginApi,
  setToken,
  setUserName,
  setIsAdmin,
  setUserId,
  navigate,
}: {
  email: string;
  password: string;
  loginApi: (email: string, password: string) => Promise<any>;
  setToken: (token: string | null) => void;
  setUserName: (name: string | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setUserId: (id: string | null) => void;
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

    if (response.data.user && typeof response.data.user.isAdmin === 'boolean') {
      setIsAdmin(response.data.user.isAdmin);
    } else {
      setIsAdmin(false);
    }

    if (response.data.user && response.data.user.id) {
      setUserId(response.data.user.id);
    } else {
      setUserId(null);
    }

    toast.success('¡Inicio de sesión exitoso!');
    navigate("/main");
  } catch (error: any) {
    console.error("Error al iniciar sesión:", error);
    toast.error('Error al iniciar sesión. Verifica tus credenciales.');
  }
}