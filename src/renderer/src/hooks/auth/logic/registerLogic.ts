import { toast } from 'react-toastify';

export async function handleRegister({
  name,
  email,
  password,
  registerApi,
  navigate,
}: {
  name: string;
  email: string;
  password: string;
  registerApi: (name: string, email: string, password: string) => Promise<any>;
  navigate: (path: string) => void;
}) {
  try {
    await registerApi(name, email, password);
    toast.success('¡Cuenta creada con éxito!');
    navigate("/login");
  } catch (error: any) {
    console.error("Error al registrarse:", error);
    toast.error('Error al registrarse. Por favor, intenta de nuevo.');
  }
}