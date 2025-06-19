import axios from "axios";

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

  return api.post("/api/uploads", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function uploadCertificate(file: File) {
  const formData = new FormData();
  formData.append("certificate", file);

  return api.post("/api/uploads/certificate", formData, {
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