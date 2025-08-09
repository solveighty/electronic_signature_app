import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { createSignatureRequest } from "../../utils/api/endpoints/signature/signatureApi";

export function useSendSignatureRequest() {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const sendSignatureRequest = async (documentId: string, _fromUserId: string | undefined, toUserId: string) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    const fromUserId = userId;
    if (!documentId || !fromUserId || !toUserId) {
      setError("Faltan datos obligatorios (frontend)");
      setLoading(false);
      return;
    }
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
