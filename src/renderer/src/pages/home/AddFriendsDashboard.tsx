import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Container, Title, Button, Loader, Group, Avatar, Paper, Text } from "@mantine/core";
import { IconUserPlus } from "@tabler/icons-react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "";

interface User {
  id: string;
  name: string;
  email: string;
}

const AddFriendsDashboard = () => {
  const { userId } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE}/api/users`)
      .then(res => {
        console.log('Respuesta /api/users:', res.data);
        setUsers(Array.isArray(res.data.users) ? res.data.users : []);
      })
      .catch(() => setError("Error al cargar usuarios"))
      .finally(() => setLoading(false));
  }, []);

  // Mostrar todos los usuarios excepto el logueado
  const filteredUsers = users.filter(u => u.id !== userId);

  const handleSendRequest = async (toId: string) => {
    setSending(toId);
    try {
      if (!userId) throw new Error("No autenticado");
      await axios.post(`${API_BASE}/api/friend-request`, { fromId: userId, toId });
      setUsers(users => users.filter(u => u.id !== toId));
    } catch (e: any) {
      console.error("Error al enviar solicitud:", e);
      setError(e.response?.data?.message || "Error al enviar solicitud");
    } finally {
      setSending(null);
    }
  };

  const handleBack = () => {
    window.location.hash = '/main';
  };

  return (
    <Container size="sm" py={40}>
      <Group justify="space-between" mb="md">
        <Title order={3} ta="center">Agregar Amigos</Title>
        <Button variant="outline" color="gray" onClick={handleBack}>
          Volver al Dashboard
        </Button>
      </Group>
      {loading ? <Loader /> : (
        filteredUsers.length > 0 ? (
          <Paper shadow="xs" radius="md" p="md" style={{ maxWidth: 500, margin: '0 auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {filteredUsers.map((user, idx) => (
                <div
                  key={user.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '18px 0',
                    borderBottom: idx !== filteredUsers.length - 1 ? '1px solid #f0f0f0' : 'none',
                  }}
                >
                  <Group align="center" gap={16}>
                    <Avatar radius="xl" size={48} color="blue" style={{ fontWeight: 700, fontSize: 22 }}>
                      {user.name[0]?.toUpperCase()}
                    </Avatar>
                    <div style={{ minWidth: 0 }}>
                      <Text fw={800} size="xl" style={{ color: '#1a1a1a', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>
                        {user.name}
                      </Text>
                      <Text size="sm" c="dimmed" style={{ marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left' }}>{user.email}</Text>
                    </div>
                  </Group>
                  <Button
                    leftSection={<IconUserPlus size={16} />}
                    loading={sending === user.id}
                    onClick={() => handleSendRequest(user.id)}
                    variant="filled"
                    color="blue"
                    radius="xl"
                    size="sm"
                    style={{ minWidth: 110 }}
                  >
                    Agregar
                  </Button>
                </div>
              ))}
            </div>
          </Paper>
        ) : (
          <div style={{ color: '#888', marginTop: 16, textAlign: 'center' }}>No se encontraron usuarios.</div>
        )
      )}
      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
    </Container>
  );
};

export default AddFriendsDashboard;
