// pages/Users.tsx
import React from 'react';
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
  Select,
  Switch,
  Badge,
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

import { useUsers } from '../hooks/useUsers';

export default function Users() {
  const {
    users,
    isLoading,
    searchInput,
    setSearchInput,
    filtrosAplicados,
    modalOpened,
    viewOpened,
    deleteModalOpened,
    editingUser,
    viewingUser,
    deletingUser,
    form,
    handleBuscar,
    handleLimpiar,
    resetAndCloseModal,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleSaveUser,
    handleView,
    handleDelete,
    confirmDelete,
    handleStatusChange,
    getRoleLabel,
    getRoleColor,
    closeView,
    closeDeleteModal,
  } = useUsers();

  const rows = users.map((user) => (
    <Table.Tr key={user.id_usuario}>
      <Table.Td>
        <Text size="sm">{user.nombre} {user.apaterno} {user.amaterno}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{user.usuario_login}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" lineClamp={1}>{user.correo}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{user.telefono}</Text>
      </Table.Td>
      <Table.Td>
        <Badge color={getRoleColor(user.fk_rol)} variant="light">
          {getRoleLabel(user.fk_rol)}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Switch
          checked={user.estado}
          onChange={(event) => handleStatusChange(user.id_usuario, event.currentTarget.checked)}
          size="sm"
        />
      </Table.Td>
      <Table.Td>
        <Group gap="xs" justify="center" wrap="nowrap">
          <Tooltip label="Ver usuario" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => handleView(user)}
              size="sm"
            >
              <IconEye size="1rem" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Editar usuario" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => handleOpenEditModal(user)}
              size="sm"
            >
              <IconEdit size="1rem" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Eliminar usuario" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              color="red"
              onClick={() => handleDelete(user)}
              size="sm"
            >
              <IconTrash size="1rem" />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="xl">
      {/* CABECERA */}
      <Paper withBorder p="md" mb="md" shadow="xs" style={{ flexShrink: 0 }}>
        <Group justify="space-between">
          <div>
            <Title order={3}>Usuarios</Title>
            <Text c="dimmed" size="sm">Gestión de usuarios del sistema</Text>
          </div>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={handleOpenCreateModal}
            size="md"
          >
            Agregar Usuario
          </Button>
        </Group>
      </Paper>

      {/* FILTROS */}
      <Paper withBorder p="md" mb="md" shadow="xs">
        <Group align="flex-end" gap="xs">
          <TextInput
            placeholder="Buscar usuario por nombre, apellido, usuario o email..."
            leftSection={<IconSearch size={16} />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ flex: 2 }}
            size="md"
            onKeyDown={async (e) => {
              if (e.key === 'Enter') {
                await handleBuscar();
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

      {/* TABLA */}
      <Paper withBorder p="md" shadow="xs" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
        <Title order={4} mb="md" style={{ flexShrink: 0 }}>Lista de Usuarios</Title>
        <Box style={{ flexGrow: 1, overflowY: 'auto' }}>
          {isLoading ? (
            <Center h="100%">
              <Stack align="center" gap="md">
                <Loader size="xl" />
                <Text c="dimmed">Cargando usuarios...</Text>
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
                  <Table.Th miw={180}>Nombre Completo</Table.Th>
                  <Table.Th miw={120}>Usuario</Table.Th>
                  <Table.Th miw={180}>Correo</Table.Th>
                  <Table.Th miw={130}>Teléfono</Table.Th>
                  <Table.Th miw={120}>Rol</Table.Th>
                  <Table.Th miw={100}>Estado</Table.Th>
                  <Table.Th miw={140} style={{ textAlign: 'center' }}>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={7} style={{ textAlign: 'center' }}>
                      <Text c="dimmed" py="xl">
                        {filtrosAplicados 
                          ? "No se encontraron usuarios con los filtros aplicados" 
                          : "No hay usuarios registrados"}
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
            {editingUser ? "Editar usuario" : "Crear nuevo usuario"}
          </Title>
        }
        size="lg"
        centered
        closeOnClickOutside={false}
      >
        <form onSubmit={form.onSubmit(handleSaveUser)}>
          <Stack>
            <Group grow>
              <TextInput
                label="Nombre"
                placeholder="Ej: Carlos"
                size="md"
                withAsterisk
                {...form.getInputProps('nombre')}
              />
              <TextInput
                label="Apellido Paterno"
                placeholder="Ej: López"
                size="md"
                withAsterisk
                {...form.getInputProps('apaterno')}
              />
            </Group>

            <TextInput
              label="Apellido Materno"
              placeholder="Ej: García"
              size="md"
              {...form.getInputProps('amaterno')}
            />

            <Group grow>
              <TextInput
                label="Usuario Login"
                placeholder="Ej: clopez"
                size="md"
                withAsterisk
                {...form.getInputProps('usuario_login')}
              />
              <TextInput
                label="Teléfono"
                placeholder="+52 55 1234 5678"
                size="md"
                {...form.getInputProps('telefono')}
              />
            </Group>

            <TextInput
              label="Correo electrónico"
              type="email"
              placeholder="usuario@empresa.com"
              size="md"
              withAsterisk
              {...form.getInputProps('correo')}
            />

            <Select
              label="Rol"
              data={[
                { value: '1', label: 'Superusuario' },
                { value: '2', label: 'Admin' },
                { value: '3', label: 'Empleado' },
              ]}
              size="md"
              withAsterisk
              {...form.getInputProps('fk_rol')}
            />

            <Switch
              label="Usuario activo"
              size="sm"
              {...form.getInputProps('estado', { type: 'checkbox' })}
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
                {editingUser ? "Actualizar" : "Crear"}
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
          <Title order={4} mb="md">
            Información del Usuario
          </Title>
        }
        size="md"
        centered
      >
        {viewingUser && (
          <Stack gap="lg">
            <Paper withBorder p="md" bg="gray.0">
              <Stack gap="md">
                <div>
                  <Text fw={600} size="sm" c="dimmed" mb={4}>Nombre completo</Text>
                  <Text size="md">{viewingUser.nombre} {viewingUser.apaterno} {viewingUser.amaterno}</Text>
                </div>
                
                <div>
                  <Text fw={600} size="sm" c="dimmed" mb={4}>Usuario login</Text>
                  <Text size="md">{viewingUser.usuario_login}</Text>
                </div>
                
                <div>
                  <Text fw={600} size="sm" c="dimmed" mb={4}>Correo electrónico</Text>
                  <Text size="md">{viewingUser.correo}</Text>
                </div>
                
                <div>
                  <Text fw={600} size="sm" c="dimmed" mb={4}>Teléfono</Text>
                  <Text size="md">{viewingUser.telefono}</Text>
                </div>
                
                <div>
                  <Text fw={600} size="sm" c="dimmed" mb={4}>Rol</Text>
                  <Badge color={getRoleColor(viewingUser.fk_rol)} size="lg">
                    {getRoleLabel(viewingUser.fk_rol)}
                  </Badge>
                </div>
                
                <div>
                  <Text fw={600} size="sm" c="dimmed" mb={4}>Estado</Text>
                  <Badge color={viewingUser.estado ? 'green' : 'red'} size="lg">
                    {viewingUser.estado ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                
                <div>
                  <Text fw={600} size="sm" c="dimmed" mb={4}>Último acceso</Text>
                  <Text size="md">{viewingUser.ultimo_acceso ? new Date(viewingUser.ultimo_acceso).toLocaleString() : 'Nunca'}</Text>
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
            ¿Estás seguro de eliminar al usuario <Text span fw={600}>"{deletingUser?.nombre} {deletingUser?.apaterno}"</Text>?
            Esta acción es irreversible.
          </Alert>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeDeleteModal}>
              Cancelar
            </Button>
            <Button color="red" onClick={confirmDelete}>
              Sí, Eliminar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}