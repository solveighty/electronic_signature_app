import { usePendingSignaturesLogic } from "../../hooks/home/usePendingSignaturesLogic";
import { Container, Title, Loader, Group, Paper, Text, Button, Modal, Textarea, Stack, Alert } from "@mantine/core";
import DashboardHeader from "../../components/Dashboard/Header/DashboardHeader";
import { useHeaderLogic } from "../../hooks/home/useHeaderLogic";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { IconDownload, IconCheck, IconX, IconAlertCircle } from "@tabler/icons-react";
import { getPdfDocumentUrl } from "../../utils/api/api";
import { toast } from 'react-toastify';

const PendingSignaturesDashboard = () => {
  const { requests, users, loading, error, markSignatureAsCompleted, rejectSignatureRequestLocal } = usePendingSignaturesLogic();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const header = useHeaderLogic();
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Verificar si el usuario regresa después de firmar un documento
  useEffect(() => {
    const signedDoc = searchParams.get('signed');
    const requestId = searchParams.get('requestId');
    
    if (signedDoc && requestId) {
      // Marcar la solicitud como completada
      markSignatureAsCompleted(requestId);
      // Limpiar los parámetros de la URL
      navigate('/pending-signatures', { replace: true });
    }
  }, [searchParams, markSignatureAsCompleted, navigate]);

  const handleReject = async (requestId: string) => {
    setSelectedRequestId(requestId);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('El motivo de rechazo es requerido');
      return;
    }

    try {
      await rejectSignatureRequestLocal(selectedRequestId, rejectionReason.trim());
      toast.success('Solicitud rechazada');
      setRejectModalOpen(false);
      setSelectedRequestId('');
      setRejectionReason('');
    } catch (e: any) {
      toast.error('Error al rechazar la solicitud');
    }
  };

  const handleDownloadSignedDocument = async (documentId: string) => {
    try {
      const url = await getPdfDocumentUrl(documentId);
      if (!url) {
        console.error('No se pudo obtener el PDF');
        return;
      }
      const link = document.createElement('a');
      link.href = url;
      link.download = `documento_firmado_${documentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Revocar el object URL después de un pequeño delay para permitir la descarga
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Error al descargar el documento:', error);
    }
  };
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
                <Paper key={req._id} shadow="md" radius="lg" p={24} mb="md" style={{ 
                  border: req.status === 'pending' ? '2px solid #228be6' : req.status === 'signed' ? '1px solid #52c41a' : '1px solid #ff4d4f', 
                  background: req.status === 'pending' ? '#f8fbff' : req.status === 'signed' ? '#f6ffed' : '#fff2f0' 
                }}>
                  <Group align="flex-start" gap={20}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 70 }}>
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: req.status === 'pending' ? '#e3eafe' : req.status === 'signed' ? '#d9f7be' : '#ffccc7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 22,
                        color: req.status === 'pending' ? '#228be6' : req.status === 'signed' ? '#52c41a' : '#ff4d4f',
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
                        <span style={{ fontWeight: 500, color: req.status === 'pending' ? '#faad14' : req.status === 'signed' ? '#52c41a' : '#ff4d4f' }}>Estado:</span> {
                          req.status === 'pending' ? 'Pendiente' : req.status === 'signed' ? 'Firmado' : 'Rechazado'
                        }
                      </Text>
                      {req.status === 'rejected' && req.rejectionReason && (
                        <Alert 
                          icon={<IconAlertCircle size={16} />} 
                          title="Motivo del rechazo" 
                          color="red" 
                          variant="light"
                          mt="sm"
                        >
                          <Text size="sm">{req.rejectionReason}</Text>
                        </Alert>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {req.status === 'pending' ? (
                        <Group gap="xs">
                          <Button
                            size="sm"
                            color="green"
                            leftSection={<IconCheck size={16} />}
                            onClick={() => navigate(`/main?tab=sign&doc=${req.documentId}&returnTo=pending-signatures&requestId=${req._id}`)}
                          >
                            Firmar
                          </Button>
                          <Button
                            size="sm"
                            color="red"
                            variant="outline"
                            leftSection={<IconX size={16} />}
                            onClick={() => handleReject(req._id)}
                          >
                            Rechazar
                          </Button>
                        </Group>
                      ) : req.status === 'signed' ? (
                        <Button
                          size="md"
                          color="green"
                          leftSection={<IconDownload size={16} />}
                          style={{ minWidth: 120, fontWeight: 700 }}
                          onClick={() => handleDownloadSignedDocument(req.documentId)}
                        >
                          Descargar
                        </Button>
                      ) : (
                        <Text size="sm" c="red" fw={500}>Rechazado</Text>
                      )}
                    </div>
                  </Group>
                </Paper>
              );
            })
          )}
        </>
      )}
      {error && <Text color="red" mt={16}>{error}</Text>}

      <Modal 
        opened={rejectModalOpen} 
        onClose={() => setRejectModalOpen(false)}
        title="Rechazar Solicitud de Firma"
        size="md"
      >
        <Stack gap="md">
          <Text size="sm">
            Por favor, proporciona el motivo por el cual estás rechazando esta solicitud de firma:
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
    </Container>
  );
};

export default PendingSignaturesDashboard;
