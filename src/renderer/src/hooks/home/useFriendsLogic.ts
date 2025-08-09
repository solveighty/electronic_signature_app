import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api/config/axiosConfig";

export interface User {
  id: string;
  name: string;
  email: string;
}

export function useFriendsLogic() {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<User[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    api.get(`/api/friends/${userId}`)
      .then(async res => {
        const { friends, friendRequestsReceived } = res.data;
        const usersRes = await api.get("/api/users");
        const users: User[] = usersRes.data.users;
        setFriends(users.filter(u => friends.includes(u.id)));
        setRequests(users.filter(u => friendRequestsReceived.includes(u.id)));
      })
      .catch(() => setError("Error al cargar amigos/solicitudes"))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleAccept = async (fromId: string) => {
    try {
      await api.post("/api/friend-request/accept", { fromId, toId: userId });
      setRequests(reqs => reqs.filter(u => u.id !== fromId));
      setFriends(f => [...f, requests.find(u => u.id === fromId)!]);
    } catch (e: any) {
      setError(e.response?.data?.message || "Error al aceptar solicitud");
    }
  };

  return {
    friends,
    requests,
    loading,
    error,
    handleAccept,
  };
}
