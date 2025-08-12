import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAllUsers } from "../../utils/api/endpoints/friends/friendsApi";
import { getSignatureRequestsForUser, completeSignatureRequest } from "../../utils/api/endpoints/signature/signatureApi";

export interface SignatureRequest {
  _id: string;
  documentId: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'signed';
  createdAt: string;
  signedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export function usePendingSignaturesLogic() {
  const { userId } = useAuth();
  const [requests, setRequests] = useState<SignatureRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    Promise.all([
      getSignatureRequestsForUser(userId),
      getAllUsers()
    ])
      .then(([reqRes, usersRes]) => {
        setRequests(reqRes.data);
        setUsers(Array.isArray(usersRes.data.users) ? usersRes.data.users : []);
      })
      .catch(() => setError("Error al cargar documentos para firmar"))
      .finally(() => setLoading(false));
  }, [userId]);

  const markSignatureAsCompleted = async (requestId: string) => {
    try {
      await completeSignatureRequest(requestId);
      // Actualizar el estado local
      setRequests(prev =>
        prev.map(req =>
          req._id === requestId ? { ...req, status: "signed" as const, signedAt: new Date().toISOString() } : req
        )
      );
    } catch (error) {
      console.error("Error al marcar solicitud como firmada:", error);
    }
  };

  return {
    requests,
    users,
    loading,
    error,
    markSignatureAsCompleted,
  };
}
