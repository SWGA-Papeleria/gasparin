// pages/view/Customers.tsx
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
} from '@mantine/core';
import { IconEdit, IconTrash, IconPlus, IconSearch, IconEye } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

interface Customer {
  id_cliente: number;
  nombre_cliente: string;
  telefono: string;
  correo: string;
  domicilio: string;
  notas: string;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id_cliente: 1,
      nombre_cliente: 'Juan Pérez García',
      telefono: '+52 55 1234 5678',
      correo: 'juan.perez@email.com',
      domicilio: 'Av. Principal #123, Col. Centro, CDMX',
      notas: 'Cliente preferente'
    },
    {
      id_cliente: 2,
      nombre_cliente: 'Empresa ABC S.A. de C.V.',
      telefono: '+52 55 8765 4321',
      correo: 'ventas@empresaabc.com',
      domicilio: 'Blvd. Industrial #456, Parque Industrial, Monterrey',
      notas: 'Factura requerida'
    },
    {
      id_cliente: 3,
      nombre_cliente: 'María Rodríguez López',
      telefono: '+52 33 5555 8888',
      correo: 'maria.rodriguez@email.com',
      domicilio: 'Calle Secundaria #789, Guadalajara',
      notas: ''
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [opened, { open, close }] = useDisclosure(false);
  const [viewOpened, { open: openView, close: closeView }] = useDisclosure(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [customerData, setCustomerData] = useState({
    nombre_cliente: '',
    telefono: '',
    correo: '',
    domicilio: '',
    notas: '',
  });

  // Filtrar clientes
  const filteredCustomers = customers.filter(customer =>
    customer.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.telefono.includes(searchTerm)
  );

  const handleSave = () => {
    if (editingCustomer) {
      setCustomers(customers.map(customer => 
        customer.id_cliente === editingCustomer.id_cliente 
          ? { ...customer, ...customerData }
          : customer
      ));
    } else {
      const newCustomer: Customer = {
        id_cliente: Math.max(...customers.map(c => c.id_cliente)) + 1,
        ...customerData
      };
      setCustomers([...customers, newCustomer]);
    }
    close();
    resetForm();
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setCustomerData({
      nombre_cliente: customer.nombre_cliente,
      telefono: customer.telefono,
      correo: customer.correo,
      domicilio: customer.domicilio,
      notas: customer.notas,
    });
    open();
  };

  const handleView = (customer: Customer) => {
    setViewingCustomer(customer);
    openView();
  };

  const handleDelete = (id: number) => {
    setCustomers(customers.filter(customer => customer.id_cliente !== id));
  };

  const resetForm = () => {
    setCustomerData({
      nombre_cliente: '',
      telefono: '',
      correo: '',
      domicilio: '',
      notas: '',
    });
    setEditingCustomer(null);
  };

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
              onClick={() => handleView(customer)}
              size="md"
            >
              <IconEye size="1.1rem" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Editar cliente" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => handleEdit(customer)}
              size="md"
            >
              <IconEdit size="1.1rem" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Eliminar cliente" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              color="red"
              onClick={() => handleDelete(customer.id_cliente)}
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
            <Title order={3}>Clientes</Title>
            <Text c="dimmed" size="sm">Gestión de clientes del sistema</Text>
          </div>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => {
              resetForm();
              open();
            }}
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
        <Title order={4} mb="md">Lista de Clientes</Title>
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
                      No se encontraron clientes con los filtros aplicados
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
            {editingCustomer ? "Editar cliente" : "Crear nuevo cliente"}
          </Title>
        }
        size="lg"
        centered
      >
        <Stack>
          <TextInput
            label="Nombre del cliente"
            value={customerData.nombre_cliente}
            onChange={(event) => setCustomerData({...customerData, nombre_cliente: event.currentTarget.value})}
            placeholder="Ej: Juan Pérez García"
            size="md"
            required
          />

          <TextInput
            label="Teléfono"
            value={customerData.telefono}
            onChange={(event) => setCustomerData({...customerData, telefono: event.currentTarget.value})}
            placeholder="+52 55 1234 5678"
            size="md"
          />

          <TextInput
            label="Correo electrónico"
            type="email"
            value={customerData.correo}
            onChange={(event) => setCustomerData({...customerData, correo: event.currentTarget.value})}
            placeholder="cliente@email.com"
            size="md"
          />

          <TextInput
            label="Domicilio"
            value={customerData.domicilio}
            onChange={(event) => setCustomerData({...customerData, domicilio: event.currentTarget.value})}
            placeholder="Dirección completa del cliente"
            size="md"
          />

          <Textarea
            label="Notas"
            value={customerData.notas}
            onChange={(event) => setCustomerData({...customerData, notas: event.currentTarget.value})}
            placeholder="Información adicional del cliente..."
            size="md"
            rows={3}
          />

          <Group justify="flex-end" gap="xs">
            <Button variant="subtle" onClick={() => {
              close();
              resetForm();
            }} size="md">
              Cancelar
            </Button>
            <Button onClick={handleSave} size="md">
              {editingCustomer ? "Actualizar" : "Crear"}
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
            Información del Cliente
          </Title>
        }
        size="md"
        centered
      >
        {viewingCustomer && (
          <Stack gap="lg">
            <Paper withBorder p="md" bg="gray.0">
              <Stack gap="md">
                <div>
                  <Text fw={600} size="sm" c="dimmed" mb={4}>Nombre del cliente</Text>
                  <Text size="md">{viewingCustomer.nombre_cliente}</Text>
                </div>
                
                <div>
                  <Text fw={600} size="sm" c="dimmed" mb={4}>Teléfono</Text>
                  <Text size="md">{viewingCustomer.telefono}</Text>
                </div>
                
                <div>
                  <Text fw={600} size="sm" c="dimmed" mb={4}>Correo electrónico</Text>
                  <Text size="md">{viewingCustomer.correo}</Text>
                </div>
                
                <div>
                  <Text fw={600} size="sm" c="dimmed" mb={4}>Domicilio</Text>
                  <Text size="md">{viewingCustomer.domicilio}</Text>
                </div>
                
                <div>
                  <Text fw={600} size="sm" c="dimmed" mb={4}>Notas</Text>
                  <Text size="md">{viewingCustomer.notas || 'Sin notas'}</Text>
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