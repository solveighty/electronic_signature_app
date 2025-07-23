import { IconMail } from "@tabler/icons-react";
import { Title, Text, Stack, Center } from "@mantine/core";
import { VerifyOTPHeaderProps } from "./types/VerifyOTPHeaderProps";

const VerifyOTPHeader = ({ email }: VerifyOTPHeaderProps) => (
  <Center>
    <Stack align="center" gap="md" mb="xl">
      <IconMail size={64} color="#228be6" />
      <Title order={2} ta="center" style={{ color: "#228be6" }}>
        Verificar tu cuenta
      </Title>
      <Text ta="center" c="dimmed" size="sm">
        Hemos enviado un código de verificación de 6 dígitos a
      </Text>
      <Text ta="center" fw={500} c="blue">
        {email}
      </Text>
      <Text ta="center" c="dimmed" size="sm">
        Ingresa el código para verificar tu cuenta
      </Text>
    </Stack>
  </Center>
);

export default VerifyOTPHeader;