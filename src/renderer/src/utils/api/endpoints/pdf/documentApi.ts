import api from "../../config/axiosConfig";

export function uploadPdfDocument(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/api/uploads/pdf", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function getUserDocuments() {
  return api.get("/api/documents");
}

export function deletePdfDocument(documentId: string) {
  return api.delete(`/api/documents/${documentId}`);
}

export async function getPdfDocumentUrl(documentId: string): Promise<string | null> {
  try {
    const response = await api.get(`/api/pdf/${documentId}/download`, {
      responseType: "blob"
    });
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error("Error al obtener PDF:", error);
    return null;
  }
}

export async function signPdfDocument(
  documentId: string, 
  certId: string, 
  certPassword: string, 
  token: string
) {
  return api.post(`/api/pdf/${documentId}/sign`, {
    certId,
    certPassword
  }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function signPdfWithStamp(
  documentId: string,
  certId: string,
  certPassword: string,
  stampImage: Blob,
  token: string,
  page: number,
  x: number,
  y: number
) {
  const formData = new FormData();
  formData.append('certId', certId);
  formData.append('certPassword', certPassword);
  formData.append('stampImage', stampImage, 'stamp.png');
  formData.append('page', String(page));
  formData.append('x', String(x));
  formData.append('y', String(y));

  return api.post(`/api/pdf/${documentId}/sign-with-stamp`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
}