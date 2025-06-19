import { useAuth } from '../context/AuthContext'
import { useNavigate } from "react-router-dom"
import {
  Container,
  Title,
  Paper,
  Text,
  Button,
  Center,
  Group,
  Badge,
  Card,
  Divider,
  Box
} from '@mantine/core'
import { IconUpload, IconLogout, IconFileUpload, IconFile, IconUser } from '@tabler/icons-react'
import { toast } from 'react-toastify'
import { useDocumentManager } from '../hooks/useDocumentManager'

const Dashboard = () => {
  const { documents, isLoading, handleFileChange } = useDocumentManager();
  const { setToken, userName } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(null)
    toast.info('Sesión cerrada correctamente')
    navigate('/login')
  }

  return (
    <Container size="lg" py={40}>
      {/* Header con saludo personalizado */}
      <Paper radius="md" p="md" withBorder mb="lg">
        <Group justify="space-between" align="center">
          <Group>
            <IconUser size={24} />
            <Box>
              <Text size="sm" c="dimmed">Bienvenido</Text>
              <Text fw={700}>Hola, {userName || 'Usuario'}</Text>
            </Box>
          </Group>
          <Button 
            variant="subtle" 
            color="gray" 
            onClick={handleLogout}
            leftSection={<IconLogout size={18} />}
          >
            Cerrar sesión
          </Button>
        </Group>
      </Paper>

      <Title order={2} mb="lg">Firma Electrónica</Title>

      <Paper radius="md" p="xl" withBorder mb="xl">
        <Center style={{ flexDirection: 'column' }} py="lg">
          <IconUpload size={48} color="gray" />
          <Title order={3} mt="md">Sube tus documentos</Title>
          <Text c="dimmed" mt="xs" mb="lg">
            Archivos PDF hasta 10MB
          </Text>
          
          <label htmlFor="file-upload">
            <Button 
              component="span" 
              leftSection={<IconFileUpload size={18} />}
              style={{ cursor: 'pointer' }}
              loading={isLoading}
            >
              {isLoading ? 'Subiendo...' : 'Seleccionar archivos'}
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept=".pdf"
                disabled={isLoading}
              />
            </Button>
          </label>
        </Center>
      </Paper>

      {documents.length > 0 && (
        <Paper radius="md" p="xl" withBorder>
          <Title order={3} mb="md">Documentos subidos</Title>
          <Divider mb="md" />
          
          {documents.map((doc) => (
            <Card key={doc.id} withBorder radius="md" mb="sm" padding="md">
              <Group justify="space-between" align="center">
                <Group>
                  <IconFile size={20} />
                  <Text fw={500}>{doc.name}</Text>
                </Group>
                <Badge color="yellow">{doc.status}</Badge>
              </Group>
            </Card>
          ))}
        </Paper>
      )}
    </Container>
  )
}

export default Dashboard