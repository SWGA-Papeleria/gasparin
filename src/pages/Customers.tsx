import {
  Table,
  TextInput,
  Button,
  Group,
  Paper,
  Title,
  Text,
  ActionIcon,
  Modal,
  Container,
  Box,
  Tooltip,
  Stack,
  Textarea,
  Alert,
  Loader,
  Center,
} from '@mantine/core';
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconSearch,
  IconEye,
  IconAlertCircle,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

import { useCustomers } from '../hooks/useCustomers';

export default function Customers() {
  const {
    // Estados
    isLoading,
    searchInput,
    setSearchInput,
    filtrosAplicados,
    filteredCustomers,
    modalOpened,
    viewOpened,
    deleteModalOpened,
    editingCustomer,
    viewingCustomer,
    deletingCustomer,
    
    // Funciones
    handleBuscar,
    handleLimpiar,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleSaveCustomer,
    handleDelete,
    confirmDelete,
    resetAndCloseModal,
    closeView,
    closeDeleteModal,
    setViewingCustomer,
    openView,
    
    // Form
    form,
  } = useCustomers();

  const rows = filteredCustomers.map((customer) => (
    <Table.Tr key={customer.id_cliente}>
      <Table.Td>
        <Text size="sm" lineClamp={1}>{customer.nombre_cliente}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{customer.telefono}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" lineClamp={1}>{customer.correo}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" lineClamp={1}>{customer.domicilio}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" lineClamp={1}>{customer.notas}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" justify="center" wrap="nowrap">
          <Tooltip label="Ver cliente" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => {
                setViewingCustomer(customer);
                openView();
              }}
              size="sm"
            >
              <IconEye size="1rem" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Editar cliente" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => handleOpenEditModal(customer)}
              size="sm"
            >
              <IconEdit size="1rem" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Eliminar cliente" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              color="red"
              onClick={() => handleDelete(customer)}
              size="sm"
            >
              <IconTrash size="1rem" />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  // Función para manejar el envío del formulario con notificaciones
  const handleFormSubmit = async (values: typeof form.values) => {
    const success = await handleSaveCustomer(values);
    if (success) {
      notifications.show({
        title: editingCustomer ? 'Cliente actualizado' : 'Cliente creado',
        message: `El cliente "${values.nombre_cliente.trim()}" se ha ${editingCustomer ? 'actualizado' : 'creado'} exitosamente`,
        color: 'green',
      });
    }
  };

  // Función para manejar la eliminación con notificación
  const handleConfirmDelete = async () => {
    const customerName = deletingCustomer?.nombre_cliente;
    await confirmDelete();
    if (customerName) {
      notifications.show({
        title: 'Cliente eliminado',
        message: `El cliente "${customerName}" se ha eliminado exitosamente`,
        color: 'green',
      });
    }
  };

  return (
    <Container size="xl">
      {/* CABECERA */}
      <Paper withBorder p="md" mb="md" shadow="xs">
        <Group justify="space-between">
          <div>
            <Title order={3}>Clientes</Title>
            <Text c="dimmed" size="sm">Gestión de clientes del sistema</Text>
          </div>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={handleOpenCreateModal}
            size="md"
          >
            Agregar Cliente
          </Button>
        </Group>
      </Paper>

      {/* FILTROS */}
      <Paper withBorder p="md" mb="md" shadow="xs">
        <Group align="flex-end" gap="xs">
          <TextInput
            placeholder="Buscar cliente por nombre, email o teléfono..."
            leftSection={<IconSearch size={16} />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ flex: 2 }}
            size="md"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleBuscar();
              }
            }}
          />
          <Button
            variant="subtle"
            onClick={handleLimpiar}
            size="md"
          >
            Limpiar
          </Button>
          <Button
            onClick={handleBuscar}
            size="md"
          >
            Buscar
          </Button>
        </Group>
      </Paper>

      {/* TABLA CON LOADER */}
      <Paper withBorder p="md" shadow="xs" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
        <Title order={4} mb="md" style={{ flexShrink: 0 }}>Lista de Clientes</Title>
        <Box style={{ flexGrow: 1, overflowY: 'auto' }}>
          {isLoading ? (
            <Center style={{ height: '50%' }}>
              <Stack align="center" gap="md">
                <Loader size="lg" />
                <Text c="dimmed">Cargando clientes...</Text>
              </Stack>
            </Center>
          ) : (
            <Table
              striped
              withColumnBorders
              withRowBorders
              layout="fixed"
              style={{ tableLayout: 'fixed' }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th miw={200}>Nombre</Table.Th>
                  <Table.Th miw={130}>Teléfono</Table.Th>
                  <Table.Th miw={180}>Correo</Table.Th>
                  <Table.Th miw={200}>Domicilio</Table.Th>
                  <Table.Th miw={150}>Notas</Table.Th>
                  <Table.Th miw={140} style={{ textAlign: 'center' }}>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={6} style={{ textAlign: 'center' }}>
                      <Text c="dimmed" py="xl">
                        {filtrosAplicados
                          ? "No se encontraron clientes con los filtros aplicados"
                          : "No hay clientes registrados"}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  rows
                )}
              </Table.Tbody>
            </Table>
          )}
        </Box>
      </Paper>

      {/* MODAL EDITAR/CREAR */}
      <Modal
        opened={modalOpened}
        onClose={resetAndCloseModal}
        title={
          <Title order={4}>
            {editingCustomer ? "Editar cliente" : "Crear nuevo cliente"}
          </Title>
        }
        size="lg"
        centered
        closeOnClickOutside={false}
      >
        <form onSubmit={form.onSubmit(handleFormSubmit)}>
          <Stack>
            <TextInput
              label="Nombre del cliente"
              placeholder="Ej: Juan Pérez García"
              size="md"
              {...form.getInputProps('nombre_cliente')}
              withAsterisk
            />

            <TextInput
              label="Teléfono"
              placeholder="+52 55 1234 5678"
              size="md"
              {...form.getInputProps('telefono')}
            />

            <TextInput
              label="Correo electrónico"
              type="email"
              placeholder="cliente@email.com"
              size="md"
              {...form.getInputProps('correo')}
            />

            <TextInput
              label="Domicilio"
              placeholder="Dirección completa del cliente"
              size="md"
              {...form.getInputProps('domicilio')}
            />

            <Textarea
              label="Notas"
              placeholder="Información adicional del cliente..."
              size="md"
              rows={3}
              {...form.getInputProps('notas')}
            />

            <Group justify="flex-end" gap="xs" mt="md">
              <Button
                type="button"
                variant="subtle"
                onClick={resetAndCloseModal}
                size="md"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="md"
              >
                {editingCustomer ? "Actualizar" : "Crear"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* MODAL VER */}
      <Modal
        opened={viewOpened}
        onClose={closeView}
        title={
          <Title order={4}>
            Información del Cliente
          </Title>
        }
        size="md"
        centered
      >
        {viewingCustomer && (
          <Stack gap="lg">
            <Paper withBorder p="md">
              <Stack gap="md">
                <div>
                  <Text fw={500}>Nombre del cliente</Text>
                  <Text>{viewingCustomer.nombre_cliente}</Text>
                </div>

                <div>
                  <Text fw={500}>Teléfono</Text>
                  <Text>{viewingCustomer.telefono}</Text>
                </div>

                <div>
                  <Text fw={500}>Correo electrónico</Text>
                  <Text>{viewingCustomer.correo}</Text>
                </div>

                <div>
                  <Text fw={500}>Domicilio</Text>
                  <Text>{viewingCustomer.domicilio}</Text>
                </div>

                <div>
                  <Text fw={500}>Notas</Text>
                  <Text>{viewingCustomer.notas || 'Sin notas'}</Text>
                </div>
              </Stack>
            </Paper>

            <Group justify="flex-end">
              <Button variant="light" onClick={closeView} size="md">
                Cerrar
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* MODAL DE CONFIRMACIÓN PARA ELIMINACIÓN */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title={<Title order={4}>Confirmar Eliminación</Title>}
        centered
      >
        <Stack gap="md">
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            title="Confirmar eliminación"
            color="red"
          >
            ¿Estás seguro de eliminar el cliente <Text span fw={600}>"{deletingCustomer?.nombre_cliente}"</Text>?
            Esta acción es irreversible.
          </Alert>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeDeleteModal}>
              Cancelar
            </Button>
            <Button color="red" onClick={handleConfirmDelete}>
              Sí, Eliminar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}