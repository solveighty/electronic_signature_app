import { useEffect, useState } from 'react';
import { Table, Button, Group, Badge, Loader, Center, Text } from '@mantine/core';
import { listCertificateRequests, approveCertificateRequest, rejectCertificateRequest } from '../../../utils/api/api';
import { toast } from 'react-toastify';

type CertReq = {
  _id: string;
  userId: string;
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
};

const AdminCertificateRequestsPanel = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CertReq[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listCertificateRequests();
      setItems(res.data || []);
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
    try {
      await rejectCertificateRequest(id);
      toast.info('Solicitud rechazada');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'No se pudo rechazar');
    }
  };

  if (loading) return <Center py="xl"><Loader /></Center>;

  if (!items.length) return <Center py="xl"><Text>No hay solicitudes pendientes</Text></Center>;

  return (
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
            <Table.Td>{r.userId}</Table.Td>
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
  );
};

export default AdminCertificateRequestsPanel;
