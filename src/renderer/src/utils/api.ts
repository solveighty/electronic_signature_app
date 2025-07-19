import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
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
  formData.append("password", password)

  return api.put("/api/uploads/certificates", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function getUserDocuments() {
  return api.get("/api/documents");
}

export function getUserCertificate() {
  return api.get("/api/certificate");
}

export function deleteCertificate() {
  return api.delete("/api/certificate");
}

export function deletePdfDocument(documentId: string) {
  return api.delete(`/api/documents/${documentId}`);
}

// Configurar interceptor para añadir token de autenticación a las peticiones
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log del error para debugging
    console.error(`API Error:`, error.response?.data || error.message);

    // Permitir que el error continúe para ser manejado por el catch
    return Promise.reject(error);
  }
);

// Función para generar un certificado
export function generateCertificate(data: {
  country: string;
  state: string;
  locality: string;
  organization: string;
  orgUnit: string;
  commonName: string;
  email: string;
  challengePassword: string;
  optionalCompany?: string;
}) {
  return api.post("/api/uploads/certificates/generate", data);
}

export async function getPdfDocumentUrl(documentId: string): Promise<string | null> {
  try {
    const response = await api.get(`/api/pdf/${documentId}/download`, {
      responseType: "blob"
    });
    const blob = response.data as Blob;
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error al obtener PDF:", error);
    return null;
  }
}

export async function signPdfDocument(documentId: string, token: string) {
  return api.post(`/api/pdf/${documentId}/sign`, {}, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export default api;