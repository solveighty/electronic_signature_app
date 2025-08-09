import { useState } from "react";
import { createSignatureRequest } from "../../utils/api/endpoints/signature/signatureApi";

export function useSendSignatureRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const sendSignatureRequest = async (documentId: string, fromUserId: string, toUserId: string) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await createSignatureRequest(documentId, fromUserId, toUserId);
      setSuccess(true);
    } catch (e: any) {
      setError(e.response?.data?.message || "Error al enviar solicitud de firma");
    } finally {
      setLoading(false);
    }
  };

  return { sendSignatureRequest, loading, error, success };
}
