import axios from "axios";
import Certificate from "../../../server/models/Certificate";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export function login(email: string, password: string) {
  return api.post("/api/auth/login", { email, password });
}

export function register(name: string, email: string, password: string) {
  return api.post("/api/auth/register", { name, email, password });
}

export function uploadPdfDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/api/uploads/pdf", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function uploadCertificate(certificate: Certificate) {
  const formData = new FormData();
  formData.append("certificate", certificate);

  return api.post("/api/uploads/certificates", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log del error para debugging
    console.error(`API Error:`, error.response?.data || error.message);

    // Permitir que el error continúe para ser manejado por el catch
    return Promise.reject(error);
  }
);

export default api;