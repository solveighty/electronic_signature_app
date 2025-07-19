import { Container, Title, Paper, Text, Button, Center, Group, Badge, Card, Box, Grid, Tabs, Loader, ActionIcon, Modal, PasswordInput } from '@mantine/core';
import { IconUpload, IconLogout, IconFileUpload, IconFile, IconUser, IconCertificate, IconFileText, IconKey, IconRefresh, IconSignature, IconTrash, IconAlertCircle, IconLock, IconEye, IconEyeOff } from '@tabler/icons-react';
import { useDashboardLogic } from '../hooks/useDashboardLogic';
import SignDocument from './SignDocument';
import CertificateCreator from './CertificateCreator';

const Dashboard = () => {
  const logic = useDashboardLogic();

  return (
    <Container size="lg" py={40}
      className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header con saludo personalizado */}
      <Paper radius="md" p="md" withBorder mb="lg"
        className='bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
      >
        <Group justify="space-between" align="center">
          <Group>
            <IconUser size={24} />
            <Box>
              <Text size="sm" c="dimmed">Bienvenido</Text>
              <Text fw={700}>Hola, {logic.userName || 'Usuario'}</Text>
            </Box>
          </Group>
          <Button
            onClick={logic.toggleDarkMode}
            className='px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded'
          >
            Cambiar a modo {logic.darkMode ? 'claro' : 'oscuro'}
          </Button>
          <Button
            variant="subtle"
            color="gray"
            onClick={logic.handleLogout}
            leftSection={<IconLogout size={18} />}
          >
            Cerrar sesión
          </Button>
        </Group>
      </Paper>

      <Title order={2} mb="lg" ta="center">Firma Electrónica</Title>

      <Tabs value={logic.activeTab}
        onChange={logic.handleTabChange}
        mb="xl"

      >
        <Tabs.List grow
          >
          <Tabs.Tab value="upload" leftSection={<IconUpload size={16} />}>
            Subir Archivos
          </Tabs.Tab>
          <Tabs.Tab value="sign" leftSection={<IconSignature size={16} />}>
            Firmar Documentos
          </Tabs.Tab>
          <Tabs.Tab value="documents" leftSection={<IconFile size={16} />}
          >
            Mis Documentos
          </Tabs.Tab>
          <Tabs.Tab value="create-certificate" leftSection={<IconCertificate size={16} />}>
            Crear Certificado
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="upload" pt="md">
          <Grid>
            {/* Certificado Digital */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper radius="md" p="xl" withBorder h="100%"
                className='bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'>
                <Center style={{ flexDirection: 'column' }} py="lg">
                  <IconCertificate size={48} color="teal" />
                  <Title order={3} mt="md">Certificado Digital</Title>
                  <Text c="dimmed" mt="xs" mb="lg" ta="center">
                    {logic.certificateFile
                      ? "Ya tienes un certificado. Puedes reemplazarlo si lo necesitas."
                      : "Sube tu archivo .p12 para firmar documentos"}
                  </Text>

                  <Group>
                    <label htmlFor="certificate-upload">
                      <Button
                        component="span"
                        leftSection={<IconKey size={18} />}
                        style={{ cursor: 'pointer' }}
                        loading={logic.isLoadingCertificate}
                        color="teal"
                      >
                        {logic.isLoadingCertificate
                          ? 'Procesando...'
                          : logic.certificateFile
                            ? 'Reemplazar certificado'
                            : 'Seleccionar certificado'}
                        <input
                          id="certificate-upload"
                          name="certificate-upload"
                          type="file"
                          style={{ display: 'none' }}
                          onChange={logic.handleCertificateUploadWithKey}
                          accept=".p12"
                          disabled={logic.isLoadingCertificate}
                        />
                      </Button>
                    </label>

                    {/* Botón para eliminar certificado */}
                    {logic.certificateFile && (
                      <Button
                        color="red"
                        variant="outline"
                        onClick={logic.openDeleteCertificateModal}
                        leftSection={<IconTrash size={18} />}
                        disabled={logic.isLoadingCertificate}
                      >
                        Eliminar
                      </Button>
                    )}
                  </Group>

                  {logic.isLoadingDocuments ? (
                    <Center>
                      <Loader size="sm" />
                    </Center>
                  ) : (
                    logic.certificateFile && (
                      <Box mt="md">
                        <Text size="sm" c="dimmed" mb="xs">Certificado actual:</Text>
                        <Badge color="teal" size="lg" variant="light">
                          {logic.certificateFile.name}
                        </Badge>
                        {logic.certificateFile.createdAt && (
                          <Text size="xs" c="dimmed" mt={5}>
                            Subido el {logic.formatDate(logic.certificateFile.createdAt)}
                          </Text>
                        )}
                      </Box>
                    )
                  )}
                </Center>
              </Paper>
            </Grid.Col>

            {/* Documento PDF */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper radius="md" p="xl" withBorder h="100%"
                className='bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'>
                <Center style={{ flexDirection: 'column' }} py="lg">
                  <IconFileText size={48} color="blue" />
                  <Title order={3} mt="md">Documento PDF</Title>
                  <Text c="dimmed" mt="xs" mb="lg" ta="center">
                    Sube el documento PDF que quieres firmar
                  </Text>

                  <label htmlFor="pdf-upload">
                    <Button
                      component="span"
                      leftSection={<IconFileUpload size={18} />}
                      style={{ cursor: 'pointer' }}
                      loading={logic.isLoadingPdf}
                      color="blue"
                    >
                      {logic.isLoadingPdf ? 'Subiendo...' : 'Seleccionar PDF'}
                      <input
                        id="pdf-upload"
                        name="pdf-upload"
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(e) => logic.handleFileChange(e, 'pdf')}
                        accept=".pdf"
                        disabled={logic.isLoadingPdf}
                      />
                    </Button>
                  </label>
                </Center>
              </Paper>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        <Tabs.Panel value="sign" pt="md">
          <SignDocument />
        </Tabs.Panel>

        <Tabs.Panel value="documents" pt="md">
          <Group justify="space-between" mb="md">
            <Title order={4}>Mis Documentos</Title>
            <Button
              variant="subtle"
              leftSection={<IconRefresh size={16} />}
              onClick={logic.refreshDocuments}
              loading={logic.isLoadingDocuments}
            >
              Actualizar
            </Button>
          </Group>

          {logic.isLoadingDocuments ? (
            <Center py="xl">
              <Loader />
            </Center>
          ) : logic.documents.length > 0 ? (
            <>
              {logic.certificateFile && (
                <>
                  <Title order={5} mb="sm">Mi Certificado Digital</Title>
                  <Card withBorder radius="md" mb="lg" padding="md"
                    className='dark:bg-gray-800 dark:shadow-lg dark:rounded-lg dark:text-gray-100'>
                    <Group justify="space-between" align="flex-start">
                      <Group align="flex-start" wrap="nowrap">
                        <IconCertificate size={20} style={{ marginTop: 4 }} />
                        <Box>
                          <Text fw={500}>{logic.certificateFile.name}</Text>
                          {logic.certificateFile.createdAt && (
                            <Text size="xs" c="dimmed">
                              Subido el {logic.formatDate(logic.certificateFile.createdAt)}
                            </Text>
                          )}
                        </Box>
                      </Group>
                      <Group>
                        <Badge color="teal" variant="filled">
                          {logic.certificateFile.status || "CERTIFICADO DISPONIBLE"}
                        </Badge>
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={logic.openDeleteCertificateModal}
                          disabled={logic.isLoadingCertificate}
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Card>
                </>
              )}

              {logic.pdfDocuments.length > 0 && (
                <>
                  <Title order={5} mb="sm">Mis Documentos PDF</Title>

                  {/* Tabla de cabecera */}
                  <Paper withBorder p="xs" mb="xs" radius="md">
                    <Group grow gap={0} justify="space-between">
                      <Text fw={700} size="sm" pl={8}>Nombre del documento</Text>
                      <Text fw={700} size="sm" style={{ maxWidth: '180px' }}>Fecha de subida</Text>
                      <Text fw={700} size="sm" ta="center">Estado</Text>
                      <Text fw={700} size="sm" ta="center" style={{ maxWidth: '80px' }}>Acción</Text>
                    </Group>
                  </Paper>

                  {/* Filas de documentos */}
                  {logic.pdfDocuments.map((doc) => (
                    <Paper key={doc.id} withBorder p="xs" mb="xs" radius="md">
                      <Group grow gap={0} justify="space-between" align="center">
                        <Group wrap="nowrap" gap="xs">
                          <IconFile size={20} />
                          <Text lineClamp={1}>
                            {doc.name}
                          </Text>
                        </Group>

                        <Text size="sm" c="dimmed" style={{ maxWidth: '180px' }}>
                          {doc.createdAt && logic.formatDate(doc.createdAt)}
                        </Text>

                        <Box ta="center">
                          <Badge
                            color={doc.status === "Firmado" ? "green" : "yellow"}
                            variant="filled"
                          >
                            {doc.status}
                          </Badge>
                        </Box>

                        <Box ta="center" style={{ maxWidth: '80px' }}>
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => logic.handleDeletePdf(doc.id.toString())}
                            disabled={logic.isLoadingPdf}
                            mx="auto"
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Box>
                      </Group>
                    </Paper>
                  ))}
                </>
              )}
            </>
          ) : (
            <Center py="xl">
              <Text c="dimmed">Aún no has subido ningún archivo</Text>
            </Center>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="create-certificate" pt="md">
          <Group justify="center">
            <Button
              onClick={() => {
                if (logic.certificateFile) {
                  logic.setOverwriteModalOpened(true);
                } else {
                  logic.setShowCreator((prev) => !prev);
                }
              }}
              color={logic.showCreator ? "red" : "teal"}
              leftSection={<IconCertificate size={18} />}
            >
              {logic.showCreator ? 'Cancelar' : 'Crear Certificado'}
            </Button>
          </Group>

          {logic.showCreator && (
            <Box mt="xl">
              <CertificateCreator onSuccess={() => {
                logic.setShowCreator(false);
                logic.refreshCertificate();
                logic.refreshDocuments();
              }} />
            </Box>
          )}

          {/* Modal de confirmación para sobreescribir certificado */}
          <Modal
            opened={logic.overwriteModalOpened}
            onClose={() => logic.setOverwriteModalOpened(false)}
            title={
              <Group>
                <IconAlertCircle size={20} color="orange" />
                <Text fw={700}>Sobrescribir certificado</Text>
              </Group>
            }
            centered
          >
            <Text mb="xl">
              Actualmente ya cuentas con un certificado digital. ¿Deseas sobrescribirlo? Esta acción reemplazará tu certificado actual.
            </Text>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => logic.setOverwriteModalOpened(false)}>
                Cancelar
              </Button>
              <Button
                color="teal"
                onClick={() => {
                  logic.setOverwriteModalOpened(false);
                  logic.setShowCreator(true);
                }}
              >
                Sí, sobrescribir
              </Button>
            </Group>
          </Modal>
        </Tabs.Panel>
      </Tabs>

      {/* Modal de confirmación para eliminar PDF */}
      <Modal
        opened={logic.deleteModalOpened}
        onClose={logic.closeDeleteModal}
        title={
          <Group>
            <IconAlertCircle size={20} color="red" />
            <Text fw={700}>Eliminar documento</Text>
          </Group>
        }
        centered
      >
        <Text mb="xl">
          ¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={logic.closeDeleteModal}>
            Cancelar
          </Button>
          <Button color="red" onClick={logic.confirmDeletePdf} loading={logic.isLoadingPdf}>
            Eliminar
          </Button>
        </Group>
      </Modal>

      {/* Modal de confirmación para eliminar certificado */}
      <Modal
        opened={logic.deleteCertificateModalOpened}
        onClose={logic.closeDeleteCertificateModal}
        title={
          <Group>
            <IconAlertCircle size={20} color="red" />
            <Text fw={700}>Eliminar certificado</Text>
          </Group>
        }
        centered
      >
        <Text mb="xl">
          ¿Estás seguro de que deseas eliminar tu certificado digital? Esta acción no se puede deshacer y no podrás firmar documentos hasta que subas un nuevo certificado.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={logic.closeDeleteCertificateModal}>
            Cancelar
          </Button>
          <Button color="red" onClick={logic.confirmDeleteCertificate} loading={logic.isLoadingCertificate}>
            Eliminar certificado
          </Button>
        </Group>
      </Modal>

      {/* Modal para solicitar clave personal */}
      <Modal
        opened={logic.certificateKeyModalOpened}
        onClose={logic.closeCertificateKeyModal}
        title={
          <Group>
            <IconLock size={20} color="teal" />
            <Text fw={700}>Clave personal</Text>
          </Group>
        }
        centered
      >
        <Text mb="md">
          Ingresa una clave personal para proteger tu certificado digital. Esta clave será
          utilizada como segunda capa de seguridad y deberás recordarla para futuras operaciones.
        </Text>

        <PasswordInput
          label="Clave personal"
          placeholder="Ingresa una clave personal segura"
          value={logic.certificateKey}
          onChange={(e) => logic.setCertificateKey(e.target.value)}
          required
          mb="xl"
          leftSection={<IconLock size={16} />}
          visibilityToggleIcon={({ reveal }) =>
            reveal ? <IconEyeOff size={16} /> : <IconEye size={16} />
          }
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={() => {
            logic.closeCertificateKeyModal();
            logic.setTempCertificateFile(null);
            logic.setCertificateKey('');
          }}>
            Cancelar
          </Button>
          <Button
            color="teal"
            onClick={logic.confirmCertificateUpload}
            disabled={logic.certificateKey.trim() === ''}
          >
            Confirmar
          </Button>
        </Group>
      </Modal>
    </Container>
  );
};

export default Dashboard;