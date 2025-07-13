import { useState } from "react";
import {
  Container,
  Title,
  Paper,
  Text,
  Button,
  Group,
  TextInput,
  Alert,
} from "@mantine/core";
import { IconCertificate } from "@tabler/icons-react";

const CertificateCreator = () => {
  const [form, setForm] = useState({
    country: "",
    state: "",
    locality: "",
    organization: "",
    orgUnit: "",
    commonName: "",
    email: "",
    challengePassword: "",
    optionalCompany: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateCertificate = async () => {
    // Validación básica
    if (
      !form.country ||
      !form.state ||
      !form.locality ||
      !form.organization ||
      !form.commonName ||
      !form.email ||
      !form.challengePassword
    ) {
      setError("Por favor, completa todos los campos obligatorios.");
      return;
    }
    // Aquí iría la lógica para crear el certificado con los datos ingresados
    console.log("Datos del certificado:", form);
    setError(null);
    // Resetear el formulario si lo deseas
    // setForm({ ... });
  };

  return (
    <Container size="sm" py="xl">
      <Title order={3} mb="lg" ta="center">
        Crear Certificado Digital
      </Title>
      <Paper radius="md" p="xl" withBorder>
        <Group mb="md">
          <IconCertificate size={32} color="teal" />
          <Text fw={500}>Ingresa los datos para tu certificado</Text>
        </Group>
        <TextInput
          label="Nombre del país (código de 2 letras)"
          placeholder="Ej: EC"
          value={form.country}
          onChange={(e) => handleChange("country", e.target.value)}
          required
          mt="md"
        />
        <TextInput
          label="Nombre de la provincia o estado"
          placeholder="Ej: Esmeraldas"
          value={form.state}
          onChange={(e) => handleChange("state", e.target.value)}
          required
          mt="md"
        />
        <TextInput
          label="Nombre de la localidad (ciudad)"
          placeholder="Ej: Esmeraldas"
          value={form.locality}
          onChange={(e) => handleChange("locality", e.target.value)}
          required
          mt="md"
        />
        <TextInput
          label="Nombre de la organización"
          placeholder="Ej: PUCESE"
          value={form.organization}
          onChange={(e) => handleChange("organization", e.target.value)}
          required
          mt="md"
        />
        <TextInput
          label="Nombre de la unidad organizativa"
          placeholder="Ej: TIC"
          value={form.orgUnit}
          onChange={(e) => handleChange("orgUnit", e.target.value)}
          mt="md"
        />
        <TextInput
          label="Nombre común (FQDN o tu nombre)"
          placeholder="Ej: pucese.edu.ec"
          value={form.commonName}
          onChange={(e) => handleChange("commonName", e.target.value)}
          required
          mt="md"
        />
        <TextInput
          label="Email"
          placeholder="Ej: abbaski@gmail.com"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          required
          mt="md"
        />
        <TextInput
          label="Contraseña de desafío"
          placeholder="Contraseña"
          value={form.challengePassword}
          onChange={(e) => handleChange("challengePassword", e.target.value)}
          required
          mt="md"
        />
        <TextInput
          label="Nombre de la empresa (opcional)"
          placeholder="Ej: Kingdom PC"
          value={form.optionalCompany}
          onChange={(e) => handleChange("optionalCompany", e.target.value)}
          mt="md"
        />
        {error && <Alert color="red" mt="md">{error}</Alert>}
        <Button color="teal" onClick={handleCreateCertificate} mt="md">
          Crear Certificado
        </Button>
      </Paper>
    </Container>
  );
};

export default CertificateCreator;