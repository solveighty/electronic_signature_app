import { generateCertificate } from "../../../../utils/api";
import { toast } from "react-toastify";
import { CertificateForm } from "../../../../types/certificate";
export const createCertificate = async (
  form: CertificateForm,
  setForm: (form: CertificateForm) => void,
  setError: (err: string | null) => void,
  setLoading: (loading: boolean) => void,
  onSuccess?: () => void
) => {
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