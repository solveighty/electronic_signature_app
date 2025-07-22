import { Paper, Group, Box, Text, Button } from '@mantine/core';
import { IconUser, IconLogout } from '@tabler/icons-react';
import { DashboardHeaderProps } from './types/dashboardHeader';

const DashboardHeader = ({
  userName,
  darkMode,
  onToggleDarkMode,
  onLogout,
}: DashboardHeaderProps) => (
  <Paper radius="md" p="md" withBorder mb="lg"
    className='bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
  >
    <Group justify="space-between" align="center">
      <Group>
        <IconUser size={24} />
        <Box>
          <Text size="sm" c="dimmed">Bienvenido</Text>
          <Text fw={700}>Hola, {userName || 'Usuario'}</Text>
        </Box>
      </Group>
      <Button
        onClick={onToggleDarkMode}
        className='px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded'
      >
        Cambiar a modo {darkMode ? 'claro' : 'oscuro'}
      </Button>
      <Button
        variant="subtle"
        color="gray"
        onClick={onLogout}
        leftSection={<IconLogout size={18} />}
      >
        Cerrar sesión
      </Button>
    </Group>
  </Paper>
);

export default DashboardHeader;