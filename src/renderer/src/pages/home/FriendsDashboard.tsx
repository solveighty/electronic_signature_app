import { Container, Title, Loader, Group, Avatar, Paper, Text, Button, Divider } from "@mantine/core";
import DashboardHeader from "../../components/Dashboard/Header/DashboardHeader";
import { useHeaderLogic } from "../../hooks/home/useHeaderLogic";
import { useNavigate } from "react-router-dom";
import { useFriendsLogic } from "../../hooks/home/useFriendsLogic";

const FriendsDashboard = () => {
  const { friends, requests, loading, error, handleAccept } = useFriendsLogic();
  const navigate = useNavigate();

  const header = useHeaderLogic();
  return (
    <Container size="sm" py={40}>
      <DashboardHeader {...header} />
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
                <Paper
                  key={user.id}
                  shadow="xs"
                  radius="lg"
                  p="md"
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: 14,
                    background: '#f9fbff',
                    border: '1px solid #e6eaf0',
                    transition: 'box-shadow 0.2s',
                  }}
                  withBorder
                >
                  <Group align="flex-start" gap={18} style={{ flex: 1, minWidth: 0 }}>
                    <Avatar radius="xl" size={48} color="gray" style={{ fontWeight: 700, fontSize: 22, boxShadow: '0 2px 8px #e6eaf0' }}>
                      {user.name[0]?.toUpperCase()}
                    </Avatar>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <Text fw={700} size="md" style={{ color: '#1a1a1a', lineHeight: 1.1, wordBreak: 'break-word', whiteSpace: 'normal', textAlign: 'left' }}>
                        {user.name}
                      </Text>
                      <Text size="sm" c="dimmed" style={{ marginTop: 2, wordBreak: 'break-all', whiteSpace: 'normal', textAlign: 'left' }}>{user.email}</Text>
                    </div>
                  </Group>
                  <Button size="sm" color="green" radius="xl" style={{ minWidth: 90, fontWeight: 700, alignSelf: 'flex-start', marginLeft: 12 }} onClick={() => handleAccept(user.id)}>
                    Aceptar
                  </Button>
                </Paper>
              ))
            )}
          </Paper>
          <Divider my="md" />
          <Paper shadow="xs" radius="md" p="md">
            <Text fw={700} mb={8}>Tus amigos</Text>
            {friends.length === 0 ? <Text c="dimmed">No tienes amigos agregados.</Text> : (
              friends.map(user => (
                <Paper
                  key={user.id}
                  shadow="xs"
                  radius="lg"
                  p="md"
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginBottom: 14,
                    background: '#f9fbff',
                    border: '1px solid #e6eaf0',
                    transition: 'box-shadow 0.2s',
                  }}
                  withBorder
                >
                  <Group align="flex-start" gap={18} style={{ flex: 1, minWidth: 0 }}>
                    <Avatar radius="xl" size={48} color="gray" style={{ fontWeight: 700, fontSize: 22, boxShadow: '0 2px 8px #e6eaf0' }}>
                      {user.name[0]?.toUpperCase()}
                    </Avatar>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <Text fw={700} size="md" style={{ color: '#1a1a1a', lineHeight: 1.1, wordBreak: 'break-word', whiteSpace: 'normal', textAlign: 'left' }}>
                        {user.name}
                      </Text>
                      <Text size="sm" c="dimmed" style={{ marginTop: 2, wordBreak: 'break-all', whiteSpace: 'normal', textAlign: 'left' }}>{user.email}</Text>
                    </div>
                  </Group>
                </Paper>
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
