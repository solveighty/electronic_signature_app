import { useState, useRef, useEffect } from "react";
import { Group, TextInput } from "@mantine/core";
import { OTPInputProps } from "./types/OTPInputProps";
import { handleChange, handleKeyDown, handlePaste } from "./handler/otpHandlers";

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

  return (
    <Group justify="center" gap="xs">
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(el) => (inputs.current[index] = el)}
          value={digit}
          onChange={(e) =>
            handleChange(e.target, index, otp, setOtp, onChange, length, inputs)
          }
          onKeyDown={(e) => handleKeyDown(e, index, otp, inputs)}
          onPaste={(e) => handlePaste(e, length, otp, setOtp, onChange, inputs)}
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
