export function handleChange(
  element: HTMLInputElement,
  index: number,
  otp: string[],
  setOtp: (otp: string[]) => void,
  onChange: (otp: string) => void,
  length: number,
  inputs: React.MutableRefObject<(HTMLInputElement | null)[]>
) {
  const newValue = element.value;
  if (newValue && !/^\d$/.test(newValue)) return;

  const newOtp = [...otp];
  newOtp[index] = newValue;
  setOtp(newOtp);
  onChange(newOtp.join(""));
  if (newValue && index < length - 1) {
    inputs.current[index + 1]?.focus();
  }
}

export function handleKeyDown(
  e: React.KeyboardEvent<HTMLInputElement>,
  index: number,
  otp: string[],
  inputs: React.MutableRefObject<(HTMLInputElement | null)[]>
) {
  if (e.key === "Backspace" && !otp[index] && index > 0) {
    inputs.current[index - 1]?.focus();
  }
}

export function handlePaste(
  e: React.ClipboardEvent,
  length: number,
  otp: string[],
  setOtp: (otp: string[]) => void,
  onChange: (otp: string) => void,
  inputs: React.MutableRefObject<(HTMLInputElement | null)[]>
) {
  e.preventDefault();
  const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
  const newOtp = [...otp];
  for (let i = 0; i < length; i++) {
    newOtp[i] = pastedData[i] || "";
  }
  setOtp(newOtp);
  onChange(newOtp.join(""));
  const nextIndex = Math.min(pastedData.length, length - 1);
  inputs.current[nextIndex]?.focus();
}