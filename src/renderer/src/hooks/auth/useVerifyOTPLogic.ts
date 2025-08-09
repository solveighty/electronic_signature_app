import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "@mantine/form";
import { useSpring } from "@react-spring/web";
import { handleSubmitOTP, handleResendOTP } from "./handle/verifyOTPHandlers";
import { useAuth } from "../../context/AuthContext";

export function useVerifyOTPLogic() {
  const navigate = useNavigate();
  const { setUserId } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Get email and password from navigation state
  const email = location.state?.email || "";
  const password = location.state?.password || "";

  const form = useForm({
    initialValues: {
      code: "",
    },
    validate: {
      code: (value) => {
        if (!value) return "Código es requerido";
        if (value.length !== 6) return "El código debe tener 6 dígitos";
        if (!/^\d+$/.test(value)) return "El código solo debe contener números";
        return null;
      },
    },
  });

  const [verifyProps, verifyApi] = useSpring(() => ({
    scale: 1,
    config: { tension: 300, friction: 10 },
  }));

  const [resendProps, resendApi] = useSpring(() => ({
    scale: 1,
    config: { tension: 300, friction: 10 },
  }));

  // Countdown timer for resend button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // If no email or password, redirect back to register
  useEffect(() => {
    if (!email || !password) {
      navigate("/register");
    } else {
      // Start initial countdown when component mounts
      setCountdown(60);
    }
  }, [email, password, navigate]);

  const handleSubmit = (values: { code: string }) =>
    handleSubmitOTP({
      email,
      password,
      values,
      navigate,
      setIsLoading,
      setUserId,
    });

  const handleResendCode = () =>
    handleResendOTP({
      email,
      countdown,
      setIsResending,
      setCountdown,
    });

  return {
    form,
    email,
    password,
    isLoading,
    isResending,
    countdown,
    verifyProps,
    verifyApi,
    resendProps,
    resendApi,
    handleSubmit,
    handleResendCode,
    navigate,
  };
}
