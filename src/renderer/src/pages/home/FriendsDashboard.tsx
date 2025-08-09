import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Container, Title, Loader, Group, Avatar, Paper, Text, Button, Divider } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api/config/axiosConfig";

interface User {
  id: string;
  name: string;
  email: string;
}

interface FriendsData {
  friends: string[];
  friendRequestsReceived: string[];
  friendRequestsSent: string[];
}

const FriendsDashboard = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);
  const [requests, setRequests] = useState<User[]>([]);
  const [error, setError] = useState("");

  // Cargar amigos y solicitudes
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    api.get(`/api/friends/${userId}`)
      .then(async res => {
        const { friends, friendRequestsReceived } = res.data;
        // Obtener info de usuarios por id
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
      // Opcional: recargar amigos
      setFriends(f => [...f, requests.find(u => u.id === fromId)!]);
    } catch (e: any) {
      setError(e.response?.data?.message || "Error al aceptar solicitud");
    }
  };

  return (
    <Container size="sm" py={40}>
      <Group justify="space-between" mb="md">
        <Title order={3} ta="center">Amigos y Solicitudes</Title>
        <Button variant="outline" color="gray" onClick={() => navigate("/main")}>Volver al Dashboard</Button>
      </Group>
      {loading ? <Loader /> : (
        <>
          <Paper shadow="xs" radius="md" p="md" mb="lg">
            <Text fw={700} mb={8}>Solicitudes pendientes</Text>
            {requests.length === 0 ? <Text c="dimmed">No tienes solicitudes pendientes.</Text> : (
              requests.map(user => (
                <Group key={user.id} justify="space-between" mb={8}>
                  <Group align="center">
                    <Avatar radius="xl" size={36}>{user.name[0]?.toUpperCase()}</Avatar>
                    <div>
                      <Text fw={600}>{user.name}</Text>
                      <Text size="sm" c="dimmed">{user.email}</Text>
                    </div>
                  </Group>
                  <Button size="xs" color="green" onClick={() => handleAccept(user.id)}>Aceptar</Button>
                </Group>
              ))
            )}
          </Paper>
          <Divider my="md" />
          <Paper shadow="xs" radius="md" p="md">
            <Text fw={700} mb={8}>Tus amigos</Text>
            {friends.length === 0 ? <Text c="dimmed">No tienes amigos agregados.</Text> : (
              friends.map(user => (
                <Group key={user.id} align="center" mb={8}>
                  <Avatar radius="xl" size={36}>{user.name[0]?.toUpperCase()}</Avatar>
                  <div>
                    <Text fw={600}>{user.name}</Text>
                    <Text size="sm" c="dimmed">{user.email}</Text>
                  </div>
                </Group>
              ))
            )}
          </Paper>
        </>
      )}
      {error && <Text color="red" mt={16}>{error}</Text>}
    </Container>
  );
};

export default FriendsDashboard;
