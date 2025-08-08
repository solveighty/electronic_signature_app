import { toast } from "react-toastify";
import { RegisterApiResponse } from "./types/registerApiResponse";

export async function handleRegister({
  name,
  email,
  password,
  registerApi,
  navigate,
  setIsAdmin,
}: {
  name: string;
  email: string;
  password: string;
  registerApi: (
    name: string,
    email: string,
    password: string
  ) => Promise<RegisterApiResponse>;
  navigate: (
    path: string,
    options?: { state?: { email: string; password: string } }
  ) => void;
  setIsAdmin: (isAdmin: boolean) => void;
}) {
  try {
    // Start registration and wait for response
    const response = await registerApi(name, email, password);
    if (response.user && typeof (response.user as any).isAdmin === 'boolean') {
      setIsAdmin((response.user as any).isAdmin);
    } else {
      setIsAdmin(false);
    }

    toast.success("¡Código de verificación enviado a tu correo!");
    // Navigate to OTP verification with email and password in state
    navigate("/verify", { state: { email, password } });
  } catch (error: unknown) {
    console.error("Error al registrarse:", error);
    toast.error("Error al registrarse. Por favor, intenta de nuevo.");
  }
}
