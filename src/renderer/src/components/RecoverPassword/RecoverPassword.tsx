import { useState } from "react";
import { useForm } from "@mantine/form";
import { useNavigate } from "react-router-dom";
import RecoverPasswordRequestForm from "./components/RecoverPasswordRequestForm";
import RecoverPasswordResetForm from "./components/RecoverPasswordResetForm";
import { handleRequestReset, handleResetPassword } from "./handler/recoverPasswordHandlers";

type Step = "request" | "reset";

const RecoverPassword = () => {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Form for requesting password reset
  const requestForm = useForm({
    initialValues: {
      email: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Email inválido"),
    },
  });

  // Form for resetting password
  const resetForm = useForm({
    initialValues: {
      resetCode: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: {
      resetCode: (value) =>
        value.length !== 6 ? "El código debe tener 6 dígitos" : null,
      newPassword: (value) =>
        value.length < 6
          ? "La contraseña debe tener al menos 6 caracteres"
          : null,
      confirmPassword: (value, values) =>
        value !== values.newPassword ? "Las contraseñas no coinciden" : null,
    },
  });

  const handleRequestResetForm = async (values: { email: string }) => {
    await handleRequestReset({
      values,
      setLoading,
      setEmail,
      setStep,
    });
  };

  const handleResetPasswordForm = async (values: {
    resetCode: string;
    newPassword: string;
  }) => {
    await handleResetPassword({
      email,
      values,
      setLoading,
      navigate,
    });
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  const handleBackToRequest = () => {
    setStep("request");
    resetForm.reset();
  };

  if (step === "request") {
    return (
      <RecoverPasswordRequestForm
        form={requestForm}
        loading={loading}
        onSubmit={handleRequestResetForm}
        onBackToLogin={handleBackToLogin}
      />
    );
  }

  return (
    <RecoverPasswordResetForm
      form={resetForm}
      loading={loading}
      email={email}
      onSubmit={handleResetPasswordForm}
      onBackToRequest={handleBackToRequest}
      onBackToLogin={handleBackToLogin}
    />
  );
};

export default RecoverPassword;
