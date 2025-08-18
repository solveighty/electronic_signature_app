import { Container, Title, Button, Loader, Group, Avatar, Paper, Text, Tooltip } from "@mantine/core";
import DashboardHeader from "../../components/Dashboard/Header/DashboardHeader";
import { useHeaderLogic } from "../../hooks/home/useHeaderLogic";
import { IconUserPlus } from "@tabler/icons-react";
import { useAddFriendsLogic } from "../../hooks/home/useAddFriendsLogic";

const AddFriendsDashboard = () => {
  const { filteredUsers, loading, sending, error, handleSendRequest } = useAddFriendsLogic();

  const handleBack = () => {
    window.location.hash = '/main';
  };

  const header = useHeaderLogic();
  return (
    <Container size="sm" py={40}>
      <DashboardHeader {...header} />
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
              {filteredUsers.map((user) => (
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
                    marginBottom: 18,
                    background: '#f9fbff',
                    border: '1px solid #e6eaf0',
                    transition: 'box-shadow 0.2s',
                    minHeight: 90,
                  }}
                  withBorder
                  className="friend-card"
                >
                  <Group align="flex-start" gap={20} style={{ flex: 1, minWidth: 0 }}>
                    <Avatar radius="xl" size={56} color="blue" style={{ fontWeight: 700, fontSize: 26, boxShadow: '0 2px 8px #e6eaf0' }}>
                      {user.name[0]?.toUpperCase()}
                    </Avatar>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <Text fw={800} size="lg" style={{ color: '#1a1a1a', lineHeight: 1.1, wordBreak: 'break-word', whiteSpace: 'normal', textAlign: 'left' }}>
                        {user.name}
                      </Text>
                      <Text size="sm" c="dimmed" style={{ marginTop: 2, wordBreak: 'break-all', whiteSpace: 'normal', textAlign: 'left' }}>{user.email}</Text>
                    </div>
                  </Group>
                  <Tooltip label="Enviar solicitud de amistad" withArrow position="left">
                    <Button
                      leftSection={<IconUserPlus size={16} />}
                      loading={sending === user.id}
                      onClick={() => handleSendRequest(user.id)}
                      variant="gradient"
                      gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                      radius="xl"
                      size="md"
                      style={{ minWidth: 120, fontWeight: 700, letterSpacing: 0.5, transition: 'background 0.2s', alignSelf: 'flex-start', marginLeft: 16 }}
                      className="add-friend-btn"
                    >
                      Agregar
                    </Button>
                  </Tooltip>
                </Paper>
              ))}
            </div>
          </Paper>
        ) : (
          <Paper shadow="xs" radius="md" p="xl" style={{ background: '#f8fafc', textAlign: 'center', marginTop: 32 }}>
            <Text size="lg" c="dimmed" fw={500}>
              <span role="img" aria-label="search">🔍</span> No se encontraron usuarios para agregar.
            </Text>
          </Paper>
        )
      )}
      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
    </Container>
  );
};

export default AddFriendsDashboard;
