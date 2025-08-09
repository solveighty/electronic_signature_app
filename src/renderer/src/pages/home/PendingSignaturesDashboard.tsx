import { usePendingSignaturesLogic } from "../../hooks/home/usePendingSignaturesLogic";
import { Container, Title, Loader, Group, Paper, Text, Button } from "@mantine/core";
import DashboardHeader from "../../components/Dashboard/Header/DashboardHeader";
import { useHeaderLogic } from "../../hooks/home/useHeaderLogic";
import { useNavigate } from "react-router-dom";

const PendingSignaturesDashboard = () => {
  const { requests, users, loading, error } = usePendingSignaturesLogic();

  const navigate = useNavigate();

  const header = useHeaderLogic();
  return (
    <Container size="sm" py={40}>
      <DashboardHeader {...header} />
      <Group justify="space-between" mb="md">
        <Title order={3} ta="center">Documentos para Firmar</Title>
        <Button variant="outline" color="gray" onClick={() => navigate("/main")}>Volver al Dashboard</Button>
      </Group>
      {loading ? <Loader /> : (
        <>
          {requests.length === 0 ? (
            <Text c="dimmed">No tienes documentos pendientes de firma.</Text>
          ) : (
            requests.map(req => {
              const requester = users.find(u => u.id === req.fromUserId);
              return (
                <Paper key={req._id} shadow="md" radius="lg" p={24} mb="md" style={{ border: req.status === 'pending' ? '2px solid #228be6' : '1px solid #e0e0e0', background: req.status === 'pending' ? '#f8fbff' : '#f9f9f9' }}>
                  <Group align="flex-start" gap={20}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 70 }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: '#e3eafe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 22,
                        color: '#228be6',
                        marginBottom: 6
                      }}>
                        {requester ? requester.name[0]?.toUpperCase() : '?'}
                      </div>
                      <Text size="xs" c="dimmed" style={{ textAlign: 'center', maxWidth: 70, wordBreak: 'break-word' }}>
                        {requester ? requester.name : req.fromUserId}
                      </Text>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text fw={700} size="lg" style={{ color: '#222', marginBottom: 2 }}>Documento</Text>
                      <Text size="md" style={{ color: '#444', marginBottom: 8 }}>{req.documentId}</Text>
                      <Text size="sm" c="dimmed" style={{ marginBottom: 2 }}>
                        <span style={{ fontWeight: 500, color: '#228be6' }}>Solicitado por:</span> {requester ? requester.name : req.fromUserId}
                      </Text>
                      <Text size="sm" c="dimmed" style={{ marginBottom: 8 }}>
                        <span style={{ fontWeight: 500, color: req.status === 'pending' ? '#faad14' : '#52c41a' }}>Estado:</span> {req.status === 'pending' ? 'Pendiente' : 'Firmado'}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        size="md"
                        color={req.status === 'pending' ? 'blue' : 'gray'}
                        disabled={req.status !== 'pending'}
                        style={{ minWidth: 100, fontWeight: 700 }}
                      >
                        Firmar
                      </Button>
                    </div>
                  </Group>
                </Paper>
              );
            })
          )}
        </>
      )}
      {error && <Text color="red" mt={16}>{error}</Text>}
    </Container>
  );
};

export default PendingSignaturesDashboard;
