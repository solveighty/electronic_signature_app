import { useEffect, useState } from 'react';
import { Badge, Loader, Center, Text, Card, Group, Stack, Alert } from '@mantine/core';
import { IconAlertCircle, IconCheck, IconClock } from '@tabler/icons-react';
import { listCertificateRequests } from '../../../utils/api/api';
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
  processedAt?: string;
  rejectionReason?: string;
};

const UserCertificateRequestsPanel = () => {
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

  if (loading) return <Center py="xl"><Loader /></Center>;

  if (!items.length) return <Center py="xl"><Text>No tienes solicitudes de certificados</Text></Center>;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <IconClock size={16} />;
      case 'approved':
        return <IconCheck size={16} />;
      case 'rejected':
        return <IconAlertCircle size={16} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Stack gap="md">
      <Text size="lg" fw={500}>Mis Solicitudes de Certificados</Text>
      
      {items.map((request) => (
        <Card key={request._id} shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="sm">
            <Text fw={500}>{request.commonName}</Text>
            <Badge 
              color={getStatusColor(request.status)}
              leftSection={getStatusIcon(request.status)}
              variant="light"
            >
              {request.status === 'pending' && 'Pendiente'}
              {request.status === 'approved' && 'Aprobado'}
              {request.status === 'rejected' && 'Rechazado'}
            </Badge>
          </Group>
          
          <Stack gap="xs" mb="sm">
            <Group gap="sm">
              <Text size="sm" c="dimmed">Organización:</Text>
              <Text size="sm">{request.organization}</Text>
            </Group>
            <Group gap="sm">
              <Text size="sm" c="dimmed">País:</Text>
              <Text size="sm">{request.country}</Text>
            </Group>
            <Group gap="sm">
              <Text size="sm" c="dimmed">Estado/Provincia:</Text>
              <Text size="sm">{request.state}</Text>
            </Group>
            <Group gap="sm">
              <Text size="sm" c="dimmed">Fecha de solicitud:</Text>
              <Text size="sm">{new Date(request.createdAt).toLocaleDateString('es-ES')}</Text>
            </Group>
            {request.processedAt && (
              <Group gap="sm">
                <Text size="sm" c="dimmed">Fecha de procesamiento:</Text>
                <Text size="sm">{new Date(request.processedAt).toLocaleDateString('es-ES')}</Text>
              </Group>
            )}
          </Stack>

          {request.status === 'rejected' && request.rejectionReason && (
            <Alert 
              icon={<IconAlertCircle size={16} />} 
              title="Motivo del rechazo" 
              color="red" 
              variant="light"
            >
              <Text size="sm">{request.rejectionReason}</Text>
            </Alert>
          )}

          {request.status === 'approved' && (
            <Alert 
              icon={<IconCheck size={16} />} 
              title="Certificado aprobado" 
              color="green" 
              variant="light"
            >
              <Text size="sm">
                Tu certificado ha sido aprobado exitosamente. Puedes descargarlo desde la sección de certificados.
              </Text>
            </Alert>
          )}

          {request.status === 'pending' && (
            <Alert 
              icon={<IconClock size={16} />} 
              title="Solicitud en revisión" 
              color="yellow" 
              variant="light"
            >
              <Text size="sm">
                Tu solicitud está siendo revisada por un administrador. Te notificaremos por correo cuando haya una decisión.
              </Text>
            </Alert>
          )}
        </Card>
      ))}
    </Stack>
  );
};

export default UserCertificateRequestsPanel;
