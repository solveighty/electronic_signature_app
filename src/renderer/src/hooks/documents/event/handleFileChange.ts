import { toast } from "react-toastify";

export const handleFileChange = async (
  e: React.ChangeEvent<HTMLInputElement>,
  fileType: "pdf" | "p12",
  uploadPdfHandler: (file: File) => Promise<boolean>,
  handleCertificateUpload: (file: File, password: string) => Promise<boolean>,
  password?: string
): Promise<boolean> => {
  if (e.target.files && e.target.files.length > 0) {
    const file = e.target.files[0];

    if (fileType === "pdf") {
      return await uploadPdfHandler(file);
    } else if (fileType === "p12") {
      if (!password) {
        toast.error("Se requiere una contraseña para el certificado P12");
        return false;
      }
      return await handleCertificateUpload(file, password);
    }
  }
  return false;
};