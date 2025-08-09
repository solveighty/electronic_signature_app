import { verifyOTP, resendOTP } from "../../../utils/api/api";
import { toast } from "react-toastify";

export async function handleSubmitOTP({
  email,
  password,
  values,
  navigate,
  setIsLoading,
  setUserId,
}: {
  email: string;
  password: string;
  values: { code: string };
  navigate: (path: string) => void;
  setIsLoading: (loading: boolean) => void;
  setUserId: (id: string | null) => void;
}) {
  if (!email || !password) return;

  setIsLoading(true);
  try {
    const response = await verifyOTP(email, values.code, password);
    if (response?.data?.user?.id) {
      setUserId(response.data.user.id);
    } else {
      setUserId(null);
    }
    toast.success("¡Cuenta verificada con éxito!");
    navigate("/login");
  } catch (error: unknown) {
    console.error("Error al verificar código:", error);
    toast.error("Código inválido. Por favor, intenta de nuevo.");
  } finally {
    setIsLoading(false);
  }
}

export async function handleResendOTP({
  email,
  countdown,
  setIsResending,
  setCountdown,
}: {
  email: string;
  countdown: number;
  setIsResending: (loading: boolean) => void;
  setCountdown: (value: number) => void;
}) {
  if (!email || countdown > 0) return;

  setIsResending(true);
  try {
    await resendOTP(email);
    toast.success("¡Nuevo código enviado a tu correo!");
    setCountdown(60);
  } catch (error: unknown) {
    console.error("Error al reenviar código:", error);
    toast.error("Error al reenviar código. Por favor, intenta de nuevo.");
  } finally {
    setIsResending(false);
  }
}