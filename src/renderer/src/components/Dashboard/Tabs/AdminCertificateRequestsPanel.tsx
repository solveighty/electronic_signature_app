import { useEffect, useState } from 'react';
import { Table, Button, Group, Badge, Loader, Center, Text, Modal, Textarea, Stack } from '@mantine/core';
import { listCertificateRequests, approveCertificateRequest, rejectCertificateRequest } from '../../../utils/api/api';
import { getUserInfoById } from '../../../utils/api/endpoints/user/userApi';
import { toast } from 'react-toastify';

type CertReq = {
  _id: string;
  userId: string;
  userName?: string;
  country: string;
  state: string;
  locality: string;
  organization: string;
  orgUnit?: string;
  commonName: string;
  email: string;
  challengePassword: string;
  optionalCompany?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  rejectionReason?: string;
};

const AdminCertificateRequestsPanel = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CertReq[]>([]);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await listCertificateRequests();
      const requests: CertReq[] = res.data || [];
      // Fetch user names for each request
      const withNames = await Promise.all(
        requests.map(async (req) => {
          const user = await getUserInfoById(req.userId);
          return { ...req, userName: user?.name || req.userId };
        })
      );
      setItems(withNames);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Error cargando solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id: string) => {
    try {
      await approveCertificateRequest(id);
      toast.success('Solicitud aprobada y certificado generado');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'No se pudo aprobar');
    }
  };

  const handleReject = async (id: string) => {
    setSelectedRequestId(id);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('El motivo de rechazo es requerido');
      return;
    }

    try {
      await rejectCertificateRequest(selectedRequestId, rejectionReason.trim());
      toast.success('Solicitud rechazada');
      setRejectModalOpen(false);
      setSelectedRequestId('');
      setRejectionReason('');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'No se pudo rechazar');
    }
  };

  if (loading) return <Center py="xl"><Loader /></Center>;

  if (!items.length) return <Center py="xl"><Text>No hay solicitudes pendientes</Text></Center>;

  return (
    <>
      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Usuario</Table.Th>
            <Table.Th>Common Name</Table.Th>
            <Table.Th>Org</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Estado</Table.Th>
            <Table.Th>Acciones</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((r) => (
            <Table.Tr key={r._id}>
              <Table.Td>{r.userName || r.userId}</Table.Td>
              <Table.Td>{r.commonName}</Table.Td>
              <Table.Td>{r.organization}</Table.Td>
              <Table.Td>{r.email}</Table.Td>
              <Table.Td>
                <Badge color={r.status === 'pending' ? 'yellow' : r.status === 'approved' ? 'green' : 'red'}>
                  {r.status}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button size="xs" color="teal" onClick={() => handleApprove(r._id)}>Aprobar</Button>
                  <Button size="xs" color="red" variant="outline" onClick={() => handleReject(r._id)}>Rechazar</Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal 
        opened={rejectModalOpen} 
        onClose={() => setRejectModalOpen(false)}
        title="Rechazar Solicitud de Certificado"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm">
            Por favor, proporciona el motivo por el cual estás rechazando esta solicitud:
          </Text>
          <Textarea
            placeholder="Escribe el motivo del rechazo..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            minRows={3}
            maxRows={6}
            required
          />
          <Group justify="flex-end" gap="sm">
            <Button 
              variant="outline" 
              onClick={() => setRejectModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              color="red" 
              onClick={confirmReject}
              disabled={!rejectionReason.trim()}
            >
              Confirmar Rechazo
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default AdminCertificateRequestsPanel;
