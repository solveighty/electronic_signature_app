import { Container, Title, Loader, Group, Avatar, Paper, Text, Button, Divider } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useFriendsLogic } from "../../hooks/home/useFriendsLogic";

const FriendsDashboard = () => {
  const { friends, requests, loading, error, handleAccept } = useFriendsLogic();
  const navigate = useNavigate();

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
