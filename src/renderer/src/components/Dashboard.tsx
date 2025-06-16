import { useState } from 'react'
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
  Divider
} from '@mantine/core'
import { IconUpload, IconLogout, IconFileUpload, IconFile } from '@tabler/icons-react'

const Dashboard = () => {
  const [documents, setDocuments] = useState<Array<{ id: number; name: string; status: string }>>([])
  const {setToken} = useAuth(); 
  const navigate = useNavigate();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files.length > 0) {
    const file = e.target.files[0]; 

    // Validación en frontend: solo PDF
    if (file.type !== "application/pdf") {
      alert("Solo se permiten archivos PDF");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:3000/api/uploads", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Error al subir archivo");

      setDocuments((prevDocs) => [
        ...prevDocs,
        {
          id: Date.now(),
          name: result.file.originalname,
          status: "Pendiente de firma",
        },
      ]);
    } catch (error: any) {
      alert(error.message);
    }
  }
};

  const handleLogout = () => {
    setToken(null) // Clear the token in context
    navigate('/login') // Redirect to login page
  }

  return (
    <Container size="lg" py={40}>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Firma Electrónica</Title>
        <Button 
          variant="subtle" 
          color="gray" 
          onClick={handleLogout}
          leftSection={<IconLogout size={18} />}
        >
          Cerrar sesión
        </Button>
      </Group>

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
            >
              Seleccionar archivos
              <input
                id="file-upload"
                name="file-upload"
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                accept=".pdf"
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