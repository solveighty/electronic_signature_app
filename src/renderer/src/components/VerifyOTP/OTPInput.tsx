import { useState, useRef, useEffect } from "react";
import { Group, TextInput } from "@mantine/core";
import { OTPInputProps } from "./types/OTPInputProps";

const OTPInput = ({ length, value, onChange, error }: OTPInputProps) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Initialize OTP from value prop
    if (value) {
      const otpArray = value.split("").slice(0, length);
      while (otpArray.length < length) {
        otpArray.push("");
      }
      setOtp(otpArray);
    }
  }, [value, length]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const newValue = element.value;

    // Only allow numbers
    if (newValue && !/^\d$/.test(newValue)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = newValue;
    setOtp(newOtp);

    // Update parent component
    onChange(newOtp.join(""));

    // Focus next input
    if (newValue && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    const newOtp = [...otp];

    for (let i = 0; i < length; i++) {
      newOtp[i] = pastedData[i] || "";
    }

    setOtp(newOtp);
    onChange(newOtp.join(""));

    // Focus the next empty input or the last input
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputs.current[nextIndex]?.focus();
  };

  return (
    <Group justify="center" gap="xs">
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(el) => (inputs.current[index] = el)}
          value={digit}
          onChange={(e) => handleChange(e.target, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          size="sm"
          w={40}
          ta="center"
          styles={{
            input: {
              textAlign: "center",
              fontSize: "1.5rem",
              fontWeight: 600,
              borderColor: error ? "#fa5252" : undefined,
            },
          }}
          maxLength={1}
        />
      ))}
    </Group>
  );
};

export default OTPInput;
