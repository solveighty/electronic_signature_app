import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAllUsers, getFriendsAndRequests, acceptFriendRequest } from "../../utils/api/endpoints/friends/friendsApi";

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
    getFriendsAndRequests(userId)
      .then(async res => {
        const { friends, friendRequestsReceived } = res.data;
        const usersRes = await getAllUsers();
        const users: User[] = usersRes.data.users;
        setFriends(users.filter(u => friends.includes(u.id)));
        setRequests(users.filter(u => friendRequestsReceived.includes(u.id)));
      })
      .catch(() => setError("Error al cargar amigos/solicitudes"))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleAccept = async (fromId: string) => {
    if (!userId) {
      setError("Usuario no autenticado");
      return;
    }
    try {
      await acceptFriendRequest(fromId, userId);
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
