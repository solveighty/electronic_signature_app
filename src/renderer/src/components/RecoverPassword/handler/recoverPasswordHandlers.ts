import { toast } from "react-toastify";
import { requestPasswordReset, resetPassword } from "../../../utils/api/endpoints/auth/authApi";

export async function handleRequestReset({
  values,
  setLoading,
  setEmail,
  setStep,
}: {
  values: { email: string };
  setLoading: (loading: boolean) => void;
  setEmail: (email: string) => void;
  setStep: (step: "request" | "reset") => void;
}) {
  setLoading(true);
  try {
    await requestPasswordReset(values.email);
    setTimeout(() => {
      setEmail(values.email);
      setStep("reset");
      toast.success("Se ha enviado un código de verificación a tu correo electrónico");
    }, 2000);
  } catch (error: unknown) {
    console.error("Error requesting password reset:", error);
    toast.error("Error al solicitar el restablecimiento de contraseña");
  } finally {
    setLoading(false);
  }
}

export async function handleResetPassword({
  email,
  values,
  setLoading,
  navigate,
}: {
  email: string;
  values: { resetCode: string; newPassword: string };
  setLoading: (loading: boolean) => void;
  navigate: (path: string) => void;
}) {
  setLoading(true);
  try {
    await resetPassword(email, values.resetCode, values.newPassword);
    toast.success("Contraseña restablecida exitosamente");
    navigate("/login");
  } catch (error: unknown) {
    console.error("Error resetting password:", error);
    const errorMessage =
      error instanceof Error && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : "Error al restablecer la contraseña";
    toast.error(errorMessage || "Error al restablecer la contraseña");
  } finally {
    setLoading(false);
  }
}