import { useState } from "react";
import { generateCertificate } from "../../utils/api";
import { toast } from "react-toastify";

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
    if (
      !form.country ||
      !form.state ||
      !form.locality ||
      !form.organization ||
      !form.commonName ||
      !form.email ||
      !form.challengePassword
    ) {
      setError("Por favor, completa todos los campos obligatorios.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await generateCertificate(form);
      toast.success("¡Certificado creado correctamente!");
      setForm({
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
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al crear el certificado");
      toast.error(err.response?.data?.error || "Error al crear el certificado");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    error,
    loading,
    handleChange,
    handleCreateCertificate,
  };
}