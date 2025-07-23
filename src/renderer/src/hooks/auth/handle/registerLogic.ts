import { toast } from "react-toastify";
import { RegisterApiResponse } from "./types/registerApiResponse";

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
  registerApi: (
    name: string,
    email: string,
    password: string
  ) => Promise<RegisterApiResponse>;
  navigate: (
    path: string,
    options?: { state?: { email: string; password: string } }
  ) => void;
}) {
  try {
    // Start registration without waiting for response
    registerApi(name, email, password).catch(() => {
      console.info("Timed out waiting for registration response");
    });

    toast.success("¡Código de verificación enviado a tu correo!");
    // Navigate to OTP verification with email and password in state
    navigate("/verify", { state: { email, password } });
  } catch (error: unknown) {
    console.error("Error al registrarse:", error);
    toast.error("Error al registrarse. Por favor, intenta de nuevo.");
  }
}
