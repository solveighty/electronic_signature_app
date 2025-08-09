import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api/config/axiosConfig";

export interface User {
  id: string;
  name: string;
  email: string;
}

export function useAddFriendsLogic() {
  const { userId } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [friendsIds, setFriendsIds] = useState<string[]>([]);
  const [sentIds, setSentIds] = useState<string[]>([]);
  const [receivedIds, setReceivedIds] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    api.get("/api/users")
      .then(res => {
        setUsers(Array.isArray(res.data.users) ? res.data.users : []);
      })
      .catch(() => setError("Error al cargar usuarios"));
    if (userId) {
      api.get(`/api/friends/${userId}`)
        .then(res => {
          setFriendsIds(res.data.friends || []);
          setSentIds(res.data.friendRequestsSent || []);
          setReceivedIds(res.data.friendRequestsReceived || []);
        })
        .catch(() => {});
    }
    setLoading(false);
  }, [userId]);

  const filteredUsers = users.filter(u =>
    u.id !== userId &&
    !friendsIds.includes(u.id) &&
    !sentIds.includes(u.id) &&
    !receivedIds.includes(u.id)
  );

  const handleSendRequest = async (toId: string) => {
    setSending(toId);
    try {
      if (!userId) throw new Error("No autenticado");
      await api.post("/api/friend-request", { fromId: userId, toId });
      setUsers(users => users.filter(u => u.id !== toId));
    } catch (e: any) {
      setError(e.response?.data?.message || "Error al enviar solicitud");
    } finally {
      setSending(null);
    }
  };

  return {
    filteredUsers,
    loading,
    sending,
    error,
    handleSendRequest,
  };
}
