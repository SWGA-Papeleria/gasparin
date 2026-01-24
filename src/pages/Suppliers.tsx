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

import { useSuppliers } from '../hooks/useSuppliers';

export default function Suppliers() {
  const {
    // Estados
    isLoading,
    searchInput,
    setSearchInput,
    filtrosAplicados,
    filteredSuppliers,
    modalOpened,
    viewOpened,
    deleteModalOpened,
    editingSupplier,
    viewingSupplier,
    deletingSupplier,
    
    // Funciones
    handleBuscar,
    handleLimpiar,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleSaveSupplier,
    handleDelete,
    confirmDelete,
    resetAndCloseModal,
    closeView,
    closeDeleteModal,
    setViewingSupplier,
    openView,
    
    // Form
    form,
  } = useSuppliers();

  const rows = filteredSuppliers.map((supplier) => (
    <Table.Tr key={supplier.id_proveedor}>
      <Table.Td>
        <Text size="sm" lineClamp={1}>{supplier.nombre_proveedor}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{supplier.nombre_contacto}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{supplier.telefono}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" lineClamp={1}>{supplier.correo}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" lineClamp={1}>{supplier.domicilio}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" justify="center" wrap="nowrap">
          <Tooltip label="Ver proveedor" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => {
                setViewingSupplier(supplier);
                openView();
              }}
              size="sm"
            >
              <IconEye size="1rem" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Editar proveedor" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => handleOpenEditModal(supplier)}
              size="sm"
            >
              <IconEdit size="1rem" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Eliminar proveedor" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              color="red"
              onClick={() => handleDelete(supplier)}
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
    const success = await handleSaveSupplier(values);
    if (success) {
      notifications.show({
        title: editingSupplier ? 'Proveedor actualizado' : 'Proveedor creado',
        message: `El proveedor "${values.nombre_proveedor.trim()}" se ha ${editingSupplier ? 'actualizado' : 'creado'} exitosamente`,
        color: 'green',
      });
    }
  };

  // Función para manejar la eliminación con notificación
  const handleConfirmDelete = async () => {
    const supplierName = deletingSupplier?.nombre_proveedor;
    await confirmDelete();
    if (supplierName) {
      notifications.show({
        title: 'Proveedor eliminado',
        message: `El proveedor "${supplierName}" se ha eliminado exitosamente`,
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
            <Title order={3}>Proveedores</Title>
            <Text c="dimmed" size="sm">Gestión de proveedores del sistema</Text>
          </div>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={handleOpenCreateModal}
            size="md"
          >
            Agregar Proveedor
          </Button>
        </Group>
      </Paper>

      {/* FILTROS */}
      <Paper withBorder p="md" mb="md" shadow="xs">
        <Group align="flex-end" gap="xs">
          <TextInput
            placeholder="Buscar proveedor por nombre, contacto o email..."
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

      {/* TABLA CON LOADER - Ahora también carga al abrir la página */}
      <Paper withBorder p="md" shadow="xs" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
        <Title order={4} mb="md" style={{ flexShrink: 0 }}>Lista de Proveedores</Title>
        <Box style={{ flexGrow: 1, overflowY: 'auto' }}>
          {isLoading ? (
            <Center style={{ height: '50%' }}>
              <Stack align="center" gap="md">
                <Loader size="lg" />
                <Text c="dimmed">Cargando proveedores...</Text>
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
                  <Table.Th miw={200}>Proveedor</Table.Th>
                  <Table.Th miw={120}>Contacto</Table.Th>
                  <Table.Th miw={130}>Teléfono</Table.Th>
                  <Table.Th miw={180}>Correo</Table.Th>
                  <Table.Th miw={200}>Domicilio</Table.Th>
                  <Table.Th miw={140} style={{ textAlign: 'center' }}>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={6} style={{ textAlign: 'center' }}>
                      <Text c="dimmed" py="xl">
                        {filtrosAplicados
                          ? "No se encontraron proveedores con los filtros aplicados"
                          : "No hay proveedores registrados"}
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
            {editingSupplier ? "Editar proveedor" : "Crear nuevo proveedor"}
          </Title>
        }
        size="lg"
        centered
        closeOnClickOutside={false}
      >
        <form onSubmit={form.onSubmit(handleFormSubmit)}>
          <Stack>
            <TextInput
              label="Nombre del proveedor"
              placeholder="Ej: Distribuidora Industrial Mexicana"
              size="md"
              {...form.getInputProps('nombre_proveedor')}
              withAsterisk
            />

            <TextInput
              label="Nombre de contacto"
              placeholder="Ej: Ing. Roberto Martínez"
              size="md"
              {...form.getInputProps('nombre_contacto')}
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
              placeholder="proveedor@empresa.com"
              size="md"
              {...form.getInputProps('correo')}
            />

            <TextInput
              label="Domicilio"
              placeholder="Dirección completa del proveedor"
              size="md"
              {...form.getInputProps('domicilio')}
            />

            <Textarea
              label="Notas"
              placeholder="Información adicional del proveedor..."
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
                {editingSupplier ? "Actualizar" : "Crear"}
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
            Información del Proveedor
          </Title>
        }
        size="md"
        centered
      >
        {viewingSupplier && (
          <Stack gap="lg">
            <Paper withBorder p="md">
              <Stack gap="md">
                <div>
                  <Text fw={500}>Nombre del proveedor</Text>
                  <Text>{viewingSupplier.nombre_proveedor}</Text>
                </div>

                <div>
                  <Text fw={500}>Nombre de contacto</Text>
                  <Text>{viewingSupplier.nombre_contacto}</Text>
                </div>

                <div>
                  <Text fw={500}>Teléfono</Text>
                  <Text>{viewingSupplier.telefono}</Text>
                </div>

                <div>
                  <Text fw={500}>Correo electrónico</Text>
                  <Text>{viewingSupplier.correo}</Text>
                </div>

                <div>
                  <Text fw={500}>Domicilio</Text>
                  <Text>{viewingSupplier.domicilio}</Text>
                </div>

                <div>
                  <Text fw={500}>Notas</Text>
                  <Text>{viewingSupplier.notas || 'Sin notas'}</Text>
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
            ¿Estás seguro de eliminar el proveedor <Text span fw={600}>"{deletingSupplier?.nombre_proveedor}"</Text>?
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