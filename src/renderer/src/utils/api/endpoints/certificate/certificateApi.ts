import api from "../../config/axiosConfig";
import { GenerateCertificateData } from "../../types/generateCertificate";

export function uploadCertificate(file: File, password: string) {
  const formData = new FormData();
  formData.append("certificate", file);
  formData.append("password", password);

  return api.post("/api/uploads/certificates", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function updateCertificate(file: File, password: string) {
  const formData = new FormData();
  formData.append("certificate", file);
  formData.append("password", password);

  return api.put("/api/uploads/certificates", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function getUserCertificate() {
  return api.get("/api/certificates");
}

export function deleteCertificate() {
  return api.delete("/api/certificate");
}

export function deleteCertificateById(certificateId: string) {
  return api.delete(`/api/certificates/${certificateId}`);
}

export function generateCertificate(data: GenerateCertificateData) {
  return api.post("/api/uploads/certificates/generate", data);
}

export async function getCertificateUrl(certificateId: string, password: string): Promise<string | null> {
  try {
    const response = await api.get(`/api/certificates/${certificateId}/download`, {
      params: { password },
      responseType: "blob",
    });
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error("Error al obtener certificado:", error);
    return null;
  }
}