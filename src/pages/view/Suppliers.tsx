// pages/view/Suppliers.tsx
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

interface Supplier {
  id_proveedor: number;
  nombre_proveedor: string;
  nombre_contacto: string;
  telefono: string;
  correo: string;
  domicilio: string;
  notas: string;
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id_proveedor: 1,
      nombre_proveedor: 'Distribuidora Industrial Mexicana',
      nombre_contacto: 'Ing. Roberto Martínez',
      telefono: '+52 55 1111 2222',
      correo: 'compras@dim.com.mx',
      domicilio: 'Av. de los Proveedores #123, Industrial, CDMX',
      notas: 'Entrega en 24 horas'
    },
    {
      id_proveedor: 2,
      nombre_proveedor: 'Alimentos y Bebidas del Norte',
      nombre_contacto: 'Lic. Ana García',
      telefono: '+52 81 3333 4444',
      correo: 'ventas@alimentosnorte.com',
      domicilio: 'Carretera Nacional Km 45.5, Monterrey',
      notas: 'Pedido mínimo $5,000'
    },
    {
      id_proveedor: 3,
      nombre_proveedor: 'Tecnología Avanzada S.A.',
      nombre_contacto: 'Ing. Carlos López',
      telefono: '+52 33 5555 6666',
      correo: 'soporte@tecnologiaavanzada.com',
      domicilio: 'Blvd. Tecnológico #789, Guadalajara',
      notas: 'Garantía de 1 año'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [opened, { open, close }] = useDisclosure(false);
  const [viewOpened, { open: openView, close: closeView }] = useDisclosure(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [supplierData, setSupplierData] = useState({
    nombre_proveedor: '',
    nombre_contacto: '',
    telefono: '',
    correo: '',
    domicilio: '',
    notas: '',
  });

  // Filtrar proveedores
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.nombre_proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.nombre_contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (editingSupplier) {
      setSuppliers(suppliers.map(supplier => 
        supplier.id_proveedor === editingSupplier.id_proveedor 
          ? { ...supplier, ...supplierData }
          : supplier
      ));
    } else {
      const newSupplier: Supplier = {
        id_proveedor: Math.max(...suppliers.map(s => s.id_proveedor)) + 1,
        ...supplierData
      };
      setSuppliers([...suppliers, newSupplier]);
    }
    close();
    resetForm();
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setSupplierData({
      nombre_proveedor: supplier.nombre_proveedor,
      nombre_contacto: supplier.nombre_contacto,
      telefono: supplier.telefono,
      correo: supplier.correo,
      domicilio: supplier.domicilio,
      notas: supplier.notas,
    });
    open();
  };

  const handleView = (supplier: Supplier) => {
    setViewingSupplier(supplier);
    openView();
  };

  const handleDelete = (id: number) => {
    setSuppliers(suppliers.filter(supplier => supplier.id_proveedor !== id));
  };

  const resetForm = () => {
    setSupplierData({
      nombre_proveedor: '',
      nombre_contacto: '',
      telefono: '',
      correo: '',
      domicilio: '',
      notas: '',
    });
    setEditingSupplier(null);
  };

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
              onClick={() => handleView(supplier)}
              size="sm"
            >
              <IconEye size="1rem" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Editar proveedor" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => handleEdit(supplier)}
              size="sm"
            >
              <IconEdit size="1rem" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Eliminar proveedor" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              color="red"
              onClick={() => handleDelete(supplier.id_proveedor)}
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
      <Paper withBorder p="md" mb="md" shadow="xs">
        <Group justify="space-between">
          <div>
            <Title order={3}>Proveedores</Title>
            <Text c="dimmed" size="sm">Gestión de proveedores del sistema</Text>
          </div>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => {
              resetForm();
              open();
            }}
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
        <Title order={4} mb="md">Lista de Proveedores</Title>
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
                      No se encontraron proveedores con los filtros aplicados
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
            {editingSupplier ? "Editar proveedor" : "Crear nuevo proveedor"}
          </Title>
        }
        size="lg"
        centered
      >
        <Stack>
          <TextInput
            label="Nombre del proveedor"
            value={supplierData.nombre_proveedor}
            onChange={(event) => setSupplierData({...supplierData, nombre_proveedor: event.currentTarget.value})}
            placeholder="Ej: Distribuidora Industrial Mexicana"
            size="md"
            required
          />

          <TextInput
            label="Nombre de contacto"
            value={supplierData.nombre_contacto}
            onChange={(event) => setSupplierData({...supplierData, nombre_contacto: event.currentTarget.value})}
            placeholder="Ej: Ing. Roberto Martínez"
            size="md"
          />

          <TextInput
            label="Teléfono"
            value={supplierData.telefono}
            onChange={(event) => setSupplierData({...supplierData, telefono: event.currentTarget.value})}
            placeholder="+52 55 1234 5678"
            size="md"
          />

          <TextInput
            label="Correo electrónico"
            type="email"
            value={supplierData.correo}
            onChange={(event) => setSupplierData({...supplierData, correo: event.currentTarget.value})}
            placeholder="proveedor@empresa.com"
            size="md"
          />

          <TextInput
            label="Domicilio"
            value={supplierData.domicilio}
            onChange={(event) => setSupplierData({...supplierData, domicilio: event.currentTarget.value})}
            placeholder="Dirección completa del proveedor"
            size="md"
          />

          <Textarea
            label="Notas"
            value={supplierData.notas}
            onChange={(event) => setSupplierData({...supplierData, notas: event.currentTarget.value})}
            placeholder="Información adicional del proveedor..."
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
              {editingSupplier ? "Actualizar" : "Crear"}
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
            Información del Proveedor
          </Title>
        }
        size="md"
        centered
      >
        {viewingSupplier && (
          <Stack gap="lg">
            <Paper withBorder p="md" bg="gray.0">
              <Stack gap="md">
                <div>
                  <Text fw={600} size="sm" c="dimmed" mb={4}>Nombre del proveedor</Text>
                  <Text size="md">{viewingSupplier.nombre_proveedor}</Text>
                </div>
                
                <div>
                  <Text fw={600} size="sm" c="dimmed" mb={4}>Nombre de contacto</Text>
                  <Text size="md">{viewingSupplier.nombre_contacto}</Text>
                </div>
                
                <div>
                  <Text fw={600} size="sm" c="dimmed" mb={4}>Teléfono</Text>
                  <Text size="md">{viewingSupplier.telefono}</Text>
                </div>
                
                <div>
                  <Text fw={600} size="sm" c="dimmed" mb={4}>Correo electrónico</Text>
                  <Text size="md">{viewingSupplier.correo}</Text>
                </div>
                
                <div>
                  <Text fw={600} size="sm" c="dimmed" mb={4}>Domicilio</Text>
                  <Text size="md">{viewingSupplier.domicilio}</Text>
                </div>
                
                <div>
                  <Text fw={600} size="sm" c="dimmed" mb={4}>Notas</Text>
                  <Text size="md">{viewingSupplier.notas || 'Sin notas'}</Text>
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