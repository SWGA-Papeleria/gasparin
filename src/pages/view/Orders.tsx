// src/pages/Orders.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Button,
  Group,
  Paper,
  Table,
  Text,
  Badge,
  ActionIcon,
  Stack,
  Select,
  TextInput,
  Grid,
  Menu,
  Modal,
  Box,
  Tooltip,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconEye,
  IconDotsVertical,
  IconUser,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

// Interfaces
interface Cliente {
  id_cliente: number;
  nombre: string;
  correo: string;
  telefono?: string;
}

interface EstadoPedido {
  id_estado_pedido: number;
  descripcion: string;
  color: string;
}

interface PrioridadPedido {
  id_prioridad_pedido: number;
  descripcion: string;
  color: string;
}

interface Pedido {
  id_pedido: number;
  folio: string;
  fk_cliente: number;
  cliente_nombre: string;
  fecha_pedido: string;
  fk_estado_pedido: number;
  estado: string;
  fk_prioridad_pedido: number;
  prioridad: string;
  total: number;
  productos_count: number;
  created_at: string;
}

interface ProductoPedido {
  id_pedido_producto: number;
  fk_presentacion_producto: number;
  producto_nombre: string;
  sku: string;
  cantidad: number;
  precio_venta: number;
  subtotal: number;
}

export default function Orders() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string | null>(null);
  const [prioridadFilter, setPrioridadFilter] = useState<string | null>(null);
  const [fechaInicioFilter, setFechaInicioFilter] = useState<string>('');
  const [fechaFinFilter, setFechaFinFilter] = useState<string>('');
  const [viewModal, { open: openViewModal, close: closeViewModal }] = useDisclosure(false);
  const [deleteModal, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [detallesPedido, setDetallesPedido] = useState<ProductoPedido[]>([]);

  // Datos de ejemplo
  const [pedidos, setPedidos] = useState<Pedido[]>([
    {
      id_pedido: 1,
      folio: 'PED-2024-001',
      fk_cliente: 1,
      cliente_nombre: 'Empresa ABC SA de CV',
      fecha_pedido: '2024-01-15',
      fk_estado_pedido: 1,
      estado: 'Pendiente',
      fk_prioridad_pedido: 3,
      prioridad: 'Alta',
      total: 2450.00,
      productos_count: 3,
      created_at: '2024-01-15T10:30:00'
    },
    {
      id_pedido: 2,
      folio: 'PED-2024-002',
      fk_cliente: 2,
      cliente_nombre: 'Escuela Primaria Federal',
      fecha_pedido: '2024-01-16',
      fk_estado_pedido: 2,
      estado: 'En Proceso',
      fk_prioridad_pedido: 2,
      prioridad: 'Media',
      total: 1780.50,
      productos_count: 5,
      created_at: '2024-01-16T14:20:00'
    },
    {
      id_pedido: 3,
      folio: 'PED-2024-003',
      fk_cliente: 3,
      cliente_nombre: 'Oficinas Gubernamentales',
      fecha_pedido: '2024-01-17',
      fk_estado_pedido: 3,
      estado: 'Completado',
      fk_prioridad_pedido: 1,
      prioridad: 'Baja',
      total: 3200.75,
      productos_count: 2,
      created_at: '2024-01-17T09:15:00'
    },
    {
      id_pedido: 4,
      folio: 'PED-2024-004',
      fk_cliente: 1,
      cliente_nombre: 'Empresa ABC SA de CV',
      fecha_pedido: '2024-01-18',
      fk_estado_pedido: 4,
      estado: 'Cancelado',
      fk_prioridad_pedido: 4,
      prioridad: 'Urgente',
      total: 890.25,
      productos_count: 4,
      created_at: '2024-01-18T16:45:00'
    }
  ]);

  const [estadosPedido] = useState<EstadoPedido[]>([
    { id_estado_pedido: 1, descripcion: 'Pendiente', color: 'yellow' },
    { id_estado_pedido: 2, descripcion: 'En Proceso', color: 'blue' },
    { id_estado_pedido: 3, descripcion: 'Completado', color: 'green' },
    { id_estado_pedido: 4, descripcion: 'Cancelado', color: 'red' },
  ]);

  const [prioridadesPedido] = useState<PrioridadPedido[]>([
    { id_prioridad_pedido: 1, descripcion: 'Baja', color: 'gray' },
    { id_prioridad_pedido: 2, descripcion: 'Media', color: 'yellow' },
    { id_prioridad_pedido: 3, descripcion: 'Alta', color: 'orange' },
    { id_prioridad_pedido: 4, descripcion: 'Urgente', color: 'red' },
  ]);

  // Datos de ejemplo para detalles
  const [todosLosDetalles] = useState<Record<number, ProductoPedido[]>>({
    1: [
      {
        id_pedido_producto: 1,
        fk_presentacion_producto: 1,
        producto_nombre: 'Bolígrafo BIC Azul',
        sku: 'BOL-BIC-AZUL',
        cantidad: 100,
        precio_venta: 5.50,
        subtotal: 550.00
      },
      {
        id_pedido_producto: 2,
        fk_presentacion_producto: 3,
        producto_nombre: 'Cuaderno Norma A4',
        sku: 'CUAD-NORMA-A4',
        cantidad: 50,
        precio_venta: 45.00,
        subtotal: 2250.00
      }
    ],
    2: [
      {
        id_pedido_producto: 3,
        fk_presentacion_producto: 2,
        producto_nombre: 'Bolígrafo BIC Negro',
        sku: 'BOL-BIC-NEGRO',
        cantidad: 200,
        precio_venta: 5.50,
        subtotal: 1100.00
      },
      {
        id_pedido_producto: 4,
        fk_presentacion_producto: 3,
        producto_nombre: 'Cuaderno Norma A4',
        sku: 'CUAD-NORMA-A4',
        cantidad: 15,
        precio_venta: 45.00,
        subtotal: 675.00
      }
    ]
  });

  // Filtrar pedidos - CORREGIDO para usar strings
  const filteredPedidos = pedidos.filter(pedido => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      pedido.folio.toLowerCase().includes(searchLower) ||
      pedido.cliente_nombre.toLowerCase().includes(searchLower) ||
      pedido.estado.toLowerCase().includes(searchLower);
    
    const matchesEstado = !estadoFilter || pedido.fk_estado_pedido.toString() === estadoFilter;
    const matchesPrioridad = !prioridadFilter || pedido.fk_prioridad_pedido.toString() === prioridadFilter;
    
    // Filtro por fecha corregido - compara strings directamente
    const matchesFecha = (!fechaInicioFilter && !fechaFinFilter) || 
      (fechaInicioFilter && fechaFinFilter && 
       pedido.fecha_pedido >= fechaInicioFilter && 
       pedido.fecha_pedido <= fechaFinFilter);

    return matchesSearch && matchesEstado && matchesPrioridad && matchesFecha;
  });

  // Funciones de manejo
  const handleView = (pedido: Pedido) => {
    setPedidoSeleccionado(pedido);
    setDetallesPedido(todosLosDetalles[pedido.id_pedido] || []);
    openViewModal();
  };

  const handleEdit = (pedido: Pedido) => {
    navigate(`/dashboard/pedidos/editar/${pedido.id_pedido}`, {
      state: { pedidoExistente: pedido }
    });
  };

  const handleDelete = (pedido: Pedido) => {
    setPedidoSeleccionado(pedido);
    openDeleteModal();
  };

  const confirmDelete = () => {
    if (pedidoSeleccionado) {
      setPedidos(pedidos.filter(p => p.id_pedido !== pedidoSeleccionado.id_pedido));
      closeDeleteModal();
    }
  };

  const cambiarEstado = (pedidoId: number, nuevoEstadoId: number) => {
    setPedidos(pedidos.map(pedido => 
      pedido.id_pedido === pedidoId 
        ? { 
            ...pedido, 
            fk_estado_pedido: nuevoEstadoId,
            estado: estadosPedido.find(e => e.id_estado_pedido === nuevoEstadoId)?.descripcion || pedido.estado
          } 
        : pedido
    ));
  };

  const getEstadoColor = (estadoId: number) => {
    return estadosPedido.find(e => e.id_estado_pedido === estadoId)?.color || 'gray';
  };

  const getPrioridadColor = (prioridadId: number) => {
    return prioridadesPedido.find(p => p.id_prioridad_pedido === prioridadId)?.color || 'gray';
  };

  const limpiarFiltros = () => {
    setSearchTerm('');
    setEstadoFilter(null);
    setPrioridadFilter(null);
    setFechaInicioFilter('');
    setFechaFinFilter('');
  };

  return (
    <Container size="xl">
      <Stack gap="md">
        {/* Header - Estilo Attributes */}
        <Paper withBorder p="md" shadow="xs" style={{ flexShrink: 0 }}>
          <Group justify="space-between">
            <div>
              <Title order={3}>Pedidos</Title>
              <Text c="dimmed" size="sm">Gestión y seguimiento de pedidos de clientes</Text>
            </div>
            <Button 
              leftSection={<IconPlus size={18} />}
              onClick={() => navigate('/dashboard/pedidos/nuevo')}
              size="md"
            >
              Nuevo Pedido
            </Button>
          </Group>
        </Paper>

        {/* Filtros - Estilo Attributes con Grid alineado */}
        <Paper withBorder p="md" shadow="xs">
          <Group align="flex-end" gap="xs">
            <TextInput
              placeholder="Buscar por folio o cliente..."
              leftSection={<IconSearch size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 2 }}
              size="md"
            />
            
            <Select
              placeholder="Estado"
              data={estadosPedido.map(estado => ({
                value: estado.id_estado_pedido.toString(),
                label: estado.descripcion
              }))}
              value={estadoFilter}
              onChange={setEstadoFilter}
              clearable
              style={{ flex: 1 }}
              size="md"
            />
            
            <Select
              placeholder="Prioridad"
              data={prioridadesPedido.map(prioridad => ({
                value: prioridad.id_prioridad_pedido.toString(),
                label: prioridad.descripcion
              }))}
              value={prioridadFilter}
              onChange={setPrioridadFilter}
              clearable
              style={{ flex: 1 }}
              size="md"
            />
            
            {/* Fecha inicio */}
            <TextInput
              type="date"
              label="Desde"
              value={fechaInicioFilter}
              onChange={(e) => setFechaInicioFilter(e.target.value)}
              style={{ flex: 1 }}
              size="md"
            />
            
            {/* Fecha fin */}
            <TextInput
              type="date"
              label="Hasta"
              value={fechaFinFilter}
              onChange={(e) => setFechaFinFilter(e.target.value)}
              style={{ flex: 1 }}
              size="md"
            />
            
            <Button 
              variant="subtle" 
              onClick={limpiarFiltros}
              size="md"
            >
              Limpiar
            </Button>
          </Group>
        </Paper>

        {/* Tabla de Pedidos - Estilo corregido */}
        <Paper withBorder p="md" shadow="xs" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
          <Title order={4} mb="md" style={{ flexShrink: 0 }}>Lista de Pedidos</Title>
          <Box style={{ flexGrow: 1, overflowY: 'auto' }}>
            <Table.ScrollContainer minWidth={800}>
              <Table striped withColumnBorders withRowBorders verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Folio</Table.Th>
                    <Table.Th>Cliente</Table.Th>
                    <Table.Th>Fecha</Table.Th>
                    <Table.Th>Estado</Table.Th>
                    <Table.Th>Prioridad</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Total</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Productos</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredPedidos.map((pedido) => (
                    <Table.Tr key={pedido.id_pedido}>
                      <Table.Td>
                        <Text>{pedido.folio}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <Text>{pedido.cliente_nombre}</Text>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Text>
                          {new Date(pedido.fecha_pedido).toLocaleDateString('es-MX')}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getEstadoColor(pedido.fk_estado_pedido)}>
                          {pedido.estado}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getPrioridadColor(pedido.fk_prioridad_pedido)} variant="light">
                          {pedido.prioridad}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right' }}>
                        <Text>${pedido.total.toFixed(2)}</Text> {/* Sin negritas */}
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'center' }}>
                        <Text>{pedido.productos_count}</Text> {/* Solo texto, sin Badge */}
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" justify="center">
                          <Tooltip label="Ver detalles" position="bottom" withArrow>
                            <ActionIcon
                              variant="light"
                              color="blue"
                              onClick={() => handleView(pedido)}
                              size="sm"
                            >
                              <IconEye size="1rem" />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Editar pedido" position="bottom" withArrow>
                            <ActionIcon
                              variant="light"
                              color="orange"
                              onClick={() => handleEdit(pedido)}
                              size="sm"
                            >
                              <IconEdit size="1rem" />
                            </ActionIcon>
                          </Tooltip>
                          <Menu position="bottom-end">
                            <Menu.Target>
                              <Tooltip label="Más opciones" position="bottom" withArrow>
                                <ActionIcon variant="light" size="sm">
                                  <IconDotsVertical size="1rem" />
                                </ActionIcon>
                              </Tooltip>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Label>Cambiar Estado</Menu.Label>
                              {estadosPedido.map(estado => (
                                <Menu.Item
                                  key={estado.id_estado_pedido}
                                  onClick={() => cambiarEstado(pedido.id_pedido, estado.id_estado_pedido)}
                                >
                                  {estado.descripcion}
                                </Menu.Item>
                              ))}
                              <Menu.Divider />
                              <Menu.Item
                                color="red"
                                leftSection={<IconTrash size="1rem" />}
                                onClick={() => handleDelete(pedido)}
                              >
                                Eliminar
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>

            {filteredPedidos.length === 0 && (
              <Box p="xl" style={{ textAlign: 'center' }}>
                <Text c="dimmed">No se encontraron pedidos con los filtros aplicados</Text>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Resumen - Solo muestra cantidad */}
        <Paper withBorder p="md" bg="blue.0">
          <Group justify="end">
            <Text fw={500}>
              Mostrando {filteredPedidos.length} de {pedidos.length} pedidos
            </Text>
            {/* Se eliminó "Total general" */}
          </Group>
        </Paper>
      </Stack>

      {/* Modal de Ver Detalles */}
      <Modal
        opened={viewModal}
        onClose={closeViewModal}
        title={`Detalles del Pedido - ${pedidoSeleccionado?.folio}`}
        size="lg"
        centered
      >
        {pedidoSeleccionado && (
          <Stack gap="md">
            {/* Información del Pedido */}
            <Paper withBorder p="md">
              <Grid>
                <Grid.Col span={6}>
                  <Text fw={500}>Cliente:</Text>
                  <Text>{pedidoSeleccionado.cliente_nombre}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text fw={500}>Fecha:</Text>
                  <Text>{new Date(pedidoSeleccionado.fecha_pedido).toLocaleDateString('es-MX')}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text fw={500}>Estado:</Text>
                  <Badge color={getEstadoColor(pedidoSeleccionado.fk_estado_pedido)}>
                    {pedidoSeleccionado.estado}
                  </Badge>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text fw={500}>Prioridad:</Text>
                  <Badge color={getPrioridadColor(pedidoSeleccionado.fk_prioridad_pedido)}>
                    {pedidoSeleccionado.prioridad}
                  </Badge>
                </Grid.Col>
              </Grid>
            </Paper>

            {/* Productos del Pedido */}
            <Paper withBorder p="md">
              <Text fw={500} mb="md">Productos</Text>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Producto</Table.Th>
                    <Table.Th>SKU</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Cantidad</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Precio</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Subtotal</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {detallesPedido.map((producto) => (
                    <Table.Tr key={producto.id_pedido_producto}>
                      <Table.Td>{producto.producto_nombre}</Table.Td>
                      <Table.Td>{producto.sku}</Table.Td>
                      <Table.Td style={{ textAlign: 'center' }}>{producto.cantidad}</Table.Td>
                      <Table.Td style={{ textAlign: 'right' }}>${producto.precio_venta.toFixed(2)}</Table.Td>
                      <Table.Td style={{ textAlign: 'right' }}>${producto.subtotal.toFixed(2)}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
              
              {/* Total */}
              <Paper withBorder p="md" mt="md" bg="blue.0">
                <Group justify="space-between">
                  <Text fw={700}>Total del Pedido:</Text>
                  <Text fw={700}>${pedidoSeleccionado.total.toFixed(2)}</Text>
                </Group>
              </Paper>
            </Paper>
          </Stack>
        )}
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        opened={deleteModal}
        onClose={closeDeleteModal}
        title="Confirmar Eliminación"
        centered
      >
        <Stack>
          <Text>
            ¿Estás seguro de que deseas eliminar el pedido <Text span fw={500}>{pedidoSeleccionado?.folio}</Text>?
          </Text>
          <Text size="sm" c="red">
            Esta acción no se puede deshacer.
          </Text>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeDeleteModal}>
              Cancelar
            </Button>
            <Button color="red" onClick={confirmDelete}>
              Eliminar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}