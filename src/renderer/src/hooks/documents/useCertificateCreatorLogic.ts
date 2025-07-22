import { useState } from "react";
import { createCertificate } from "./certificate/creator/createCertificate";

export function useCertificateCreatorLogic(onSuccess?: () => void) {
  const [form, setForm] = useState({
    country: "",
    state: "",
    locality: "",
    organization: "",
    orgUnit: "",
    commonName: "",
    email: "",
    challengePassword: "",
    optionalCompany: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateCertificate = async () => {
    await createCertificate(form, setForm, setError, setLoading, onSuccess);
  };

  return {
    form,
    error,
    loading,
    handleChange,
    handleCreateCertificate,
  };
}