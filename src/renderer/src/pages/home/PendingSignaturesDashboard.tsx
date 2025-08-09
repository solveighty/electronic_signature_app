import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api/config/axiosConfig";
import { Container, Title, Loader, Group, Paper, Text, Button } from "@mantine/core";
import { useNavigate } from "react-router-dom";

interface SignatureRequest {
  _id: string;
  documentId: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'signed';
  createdAt: string;
  signedAt?: string;
}

const PendingSignaturesDashboard = () => {
  const { userId } = useAuth();
  const [requests, setRequests] = useState<SignatureRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    api.get(`/api/signature-requests/${userId}`)
      .then(res => setRequests(res.data))
      .catch(() => setError("Error al cargar documentos para firmar"))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <Container size="sm" py={40}>
      <Group justify="space-between" mb="md">
        <Title order={3} ta="center">Documentos para Firmar</Title>
        <Button variant="outline" color="gray" onClick={() => navigate("/main")}>Volver al Dashboard</Button>
      </Group>
      {loading ? <Loader /> : (
        <>
          {requests.length === 0 ? (
            <Text c="dimmed">No tienes documentos pendientes de firma.</Text>
          ) : (
            requests.map(req => (
              <Paper key={req._id} shadow="xs" radius="md" p="md" mb="md">
                <Group justify="space-between">
                  <div>
                    <Text fw={600}>Documento: {req.documentId}</Text>
                    <Text size="sm" c="dimmed">Solicitado por: {req.fromUserId}</Text>
                    <Text size="sm" c="dimmed">Estado: {req.status === 'pending' ? 'Pendiente' : 'Firmado'}</Text>
                  </div>
                  {/* Aquí irá el botón para firmar en el futuro */}
                  <Button disabled={req.status !== 'pending'}>Firmar</Button>
                </Group>
              </Paper>
            ))
          )}
        </>
      )}
      {error && <Text color="red" mt={16}>{error}</Text>}
    </Container>
  );
};

export default PendingSignaturesDashboard;
