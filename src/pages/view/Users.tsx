// pages/view/Users.tsx
import { useState } from 'react';
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
  Select,
  Switch,
  Badge,
} from '@mantine/core';
import { IconEdit, IconTrash, IconPlus, IconSearch, IconEye, IconUser, IconLock } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

interface User {
  id_usuario: number;
  nombre: string;
  apaterno: string;
  amaterno: string;
  usuario_login: string;
  correo: string;
  password_hash: string;
  telefono: string;
  estado: boolean;
  fk_rol: number;
  ultimo_acceso: string | null;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Mapeo de roles
const ROLES = {
  1: { label: 'Superusuario', color: 'red' },
  2: { label: 'Admin', color: 'blue' },
  3: { label: 'Empleado', color: 'green' },
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([
    {
      id_usuario: 1,
      nombre: 'Carlos',
      apaterno: 'López',
      amaterno: 'García',
      usuario_login: 'clopez',
      correo: 'carlos.lopez@empresa.com',
      password_hash: 'hashed_password',
      telefono: '+52 55 1234 5678',
      estado: true,
      fk_rol: 1,
      ultimo_acceso: '2024-01-15 10:30:00',
      created_by: 1,
      updated_by: 1,
      created_at: '2024-01-01 08:00:00',
      updated_at: '2024-01-15 10:30:00',
      deleted_at: null
    },
    {
      id_usuario: 2,
      nombre: 'Ana',
      apaterno: 'Martínez',
      amaterno: 'Rodríguez',
      usuario_login: 'amartinez',
      correo: 'ana.martinez@empresa.com',
      password_hash: 'hashed_password',
      telefono: '+52 55 8765 4321',
      estado: true,
      fk_rol: 2,
      ultimo_acceso: '2024-01-14 15:45:00',
      created_by: 1,
      updated_by: 1,
      created_at: '2024-01-01 08:00:00',
      updated_at: '2024-01-14 15:45:00',
      deleted_at: null
    },
    {
      id_usuario: 3,
      nombre: 'Miguel',
      apaterno: 'Hernández',
      amaterno: 'Pérez',
      usuario_login: 'mhernandez',
      correo: 'miguel.hernandez@empresa.com',
      password_hash: 'hashed_password',
      telefono: '+52 33 5555 8888',
      estado: true,
      fk_rol: 3,
      ultimo_acceso: '2024-01-13 09:20:00',
      created_by: 1,
      updated_by: 2,
      created_at: '2024-01-01 08:00:00',
      updated_at: '2024-01-13 09:20:00',
      deleted_at: null
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [opened, { open, close }] = useDisclosure(false);
  const [viewOpened, { open: openView, close: closeView }] = useDisclosure(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [userData, setUserData] = useState({
    nombre: '',
    apaterno: '',
    amaterno: '',
    usuario_login: '',
    correo: '',
    telefono: '',
    estado: true,
    fk_rol: 3, // Por defecto Empleado
  });

  // Filtrar usuarios
  const filteredUsers = users.filter(user =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.apaterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.usuario_login.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (editingUser) {
      setUsers(users.map(user => 
        user.id_usuario === editingUser.id_usuario 
          ? { 
              ...user, 
              ...userData,
              updated_at: new Date().toISOString(),
              updated_by: 1 // En una app real esto vendría del contexto de autenticación
            }
          : user
      ));
    } else {
      const newUser: User = {
        id_usuario: Math.max(...users.map(u => u.id_usuario)) + 1,
        ...userData,
        password_hash: 'temp_password', // En una app real se generaría un hash
        ultimo_acceso: null,
        created_by: 1, // En una app real esto vendría del contexto de autenticación
        updated_by: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      };
      setUsers([...users, newUser]);
    }
    close();
    resetForm();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setUserData({
      nombre: user.nombre,
      apaterno: user.apaterno,
      amaterno: user.amaterno,
      usuario_login: user.usuario_login,
      correo: user.correo,
      telefono: user.telefono,
      estado: user.estado,
      fk_rol: user.fk_rol,
    });
    open();
  };

  const handleView = (user: User) => {
    setViewingUser(user);
    openView();
  };

  const handleDelete = (id: number) => {
    setUsers(users.filter(user => user.id_usuario !== id));
  };

  const handleStatusChange = (id: number, newStatus: boolean) => {
    setUsers(users.map(user => 
      user.id_usuario === id 
        ? { 
            ...user, 
            estado: newStatus,
            updated_at: new Date().toISOString(),
            updated_by: 1
          }
        : user
    ));
  };

  const resetForm = () => {
    setUserData({
      nombre: '',
      apaterno: '',
      amaterno: '',
      usuario_login: '',
      correo: '',
      telefono: '',
      estado: true,
      fk_rol: 3,
    });
    setEditingUser(null);
  };

  const getRoleLabel = (rolId: number) => {
    return ROLES[rolId as keyof typeof ROLES]?.label || 'Desconocido';
  };

  const getRoleColor = (rolId: number) => {
    return ROLES[rolId as keyof typeof ROLES]?.color || 'gray';
  };

  const canEditRole = (currentUserRole: number, targetRole: number) => {
    // Superusuario no puede cambiar su propio rol ni bajarse a niveles inferiores
    if (currentUserRole === 1) return true; // Superusuario puede editar cualquier rol
    if (currentUserRole === 2) return targetRole !== 1; // Admin no puede asignar Superusuario
    return targetRole === 3; // Empleado solo puede asignar Empleado
  };

  const rows = filteredUsers.map((user) => (
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
              size="md"
            >
              <IconEye size="1.1rem" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Editar usuario" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => handleEdit(user)}
              size="md"
            >
              <IconEdit size="1.1rem" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Eliminar usuario" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              color="red"
              onClick={() => handleDelete(user.id_usuario)}
              size="md"
            >
              <IconTrash size="1.2rem" />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="xl">
      {/* CABECERA */}
      <Paper withBorder p="md" mb="md" shadow="xs">
        <Group justify="space-between">
          <div>
            <Title order={3}>Usuarios</Title>
            <Text c="dimmed" size="sm">Gestión de usuarios del sistema</Text>
          </div>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => {
              resetForm();
              open();
            }}
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 2 }}
            size="md"
          />
          
          <Button 
            variant="subtle" 
            onClick={() => setSearchTerm('')}
            size="md"
          >
            Limpiar
          </Button>
        </Group>
      </Paper>

      {/* TABLA */}
      <Paper withBorder p="md" shadow="xs">
        <Title order={4} mb="md">Lista de Usuarios</Title>
        <Box style={{ maxHeight: '400px', overflowY: 'auto' }}>
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
                      No se encontraron usuarios con los filtros aplicados
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                rows
              )}
            </Table.Tbody>
          </Table>
        </Box>
      </Paper>

      {/* MODAL EDITAR/CREAR */}
      <Modal
        opened={opened}
        onClose={() => {
          close();
          resetForm();
        }}
        title={
          <Title order={4}>
            {editingUser ? "Editar usuario" : "Crear nuevo usuario"}
          </Title>
        }
        size="lg"
        centered
      >
        <Stack>
          <Group grow>
            <TextInput
              label="Nombre"
              value={userData.nombre}
              onChange={(event) => setUserData({...userData, nombre: event.currentTarget.value})}
              placeholder="Ej: Carlos"
              size="md"
              required
            />
            <TextInput
              label="Apellido Paterno"
              value={userData.apaterno}
              onChange={(event) => setUserData({...userData, apaterno: event.currentTarget.value})}
              placeholder="Ej: López"
              size="md"
              required
            />
          </Group>

          <TextInput
            label="Apellido Materno"
            value={userData.amaterno}
            onChange={(event) => setUserData({...userData, amaterno: event.currentTarget.value})}
            placeholder="Ej: García"
            size="md"
          />

          <Group grow>
            <TextInput
              label="Usuario Login"
              value={userData.usuario_login}
              onChange={(event) => setUserData({...userData, usuario_login: event.currentTarget.value})}
              placeholder="Ej: clopez"
              size="md"
              required
            />
            <TextInput
              label="Teléfono"
              value={userData.telefono}
              onChange={(event) => setUserData({...userData, telefono: event.currentTarget.value})}
              placeholder="+52 55 1234 5678"
              size="md"
            />
          </Group>

          <TextInput
            label="Correo electrónico"
            type="email"
            value={userData.correo}
            onChange={(event) => setUserData({...userData, correo: event.currentTarget.value})}
            placeholder="usuario@empresa.com"
            size="md"
            required
          />

          <Select
            label="Rol"
            value={userData.fk_rol.toString()}
            onChange={(value) => setUserData({...userData, fk_rol: parseInt(value || '3')})}
            data={[
              { value: '1', label: 'Superusuario' },
              { value: '2', label: 'Admin' },
              { value: '3', label: 'Empleado' },
            ]}
            size="md"
            required
          />

          <Switch
            label="Usuario activo"
            checked={userData.estado}
            onChange={(event) => setUserData({...userData, estado: event.currentTarget.checked})}
            size="md"
          />

          <Group justify="flex-end" gap="xs">
            <Button variant="subtle" onClick={() => {
              close();
              resetForm();
            }} size="md">
              Cancelar
            </Button>
            <Button onClick={handleSave} size="md">
              {editingUser ? "Actualizar" : "Crear"}
            </Button>
          </Group>
        </Stack>
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
    </Container>
  );
}