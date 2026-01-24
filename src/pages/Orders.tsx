// src/pages/Orders.tsx
import { useState, useMemo, useEffect } from 'react';
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
  Alert,
  Loader,
  Center,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconX,
  IconEye,
  IconDotsVertical,
  IconUser,
  IconFileDownload,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import { useOrders } from '../hooks/useOrders';
import OrderDetailsModal from '../components/orders/OrderDetailsModal';
import type { Pedido, DetallePedido } from '../types/orders.types';

export default function Orders() {
  const navigate = useNavigate();
  const {
    pedidos,
    loading,
    detallesLoading,
    searchTerm,
    estadoFilter,
    prioridadFilter,
    fechaInicioFilter,
    fechaFinFilter,
    filtrosAplicados,
    estadosPedido,
    prioridadesPedido,
    setPedidos,
    setSearchTerm,
    setEstadoFilter,
    setPrioridadFilter,
    setFechaInicioFilter,
    setFechaFinFilter,
    setFiltrosAplicados,
    handleBuscar,
    handleLimpiar,
    cargarPedidos,
    eliminarPedido,
    cambiarEstadoPedido,
    cargarDetallesPedido,
  } = useOrders();

  const [viewModal, { open: openViewModal, close: closeViewModal }] = useDisclosure(false);
  const [deleteModal, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [entregarModal, { open: openEntregarModal, close: closeEntregarModal }] = useDisclosure(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
  const [detallesPedido, setDetallesPedido] = useState<DetallePedido[]>([]);
  const [imprimiendo, setImprimiendo] = useState(false);
  const [applyingSearch, setApplyingSearch] = useState(false);

  // Cargar pedidos al montar el componente
  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  // Datos de ejemplo para pedidos (en producción vendrían de la API)
  useEffect(() => {
    setPedidos([
      {
        id_pedido: 1,
        folio: 'PED-2024-001',
        fk_cliente: 1,
        cliente_nombre: 'Empresa ABC SA de CV',
        fecha_pedido: '2024-01-15',
        fecha_entrega_estimada: '2024-01-20',
        fk_estado_pedido: 1,
        estado: 'Pendiente',
        fk_prioridad_pedido: 2,
        prioridad: 'Urgente',
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
        fecha_entrega_estimada: '2024-01-21',
        fk_estado_pedido: 2,
        estado: 'Listo para entregar',
        fk_prioridad_pedido: 1,
        prioridad: 'Normal',
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
        fecha_entrega_estimada: '2024-01-22',
        fk_estado_pedido: 3,
        estado: 'Entregado',
        fk_prioridad_pedido: 1,
        prioridad: 'Normal',
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
        fecha_entrega_estimada: '2024-01-23',
        fk_estado_pedido: 1,
        estado: 'Pendiente',
        fk_prioridad_pedido: 1,
        prioridad: 'Normal',
        total: 890.25,
        productos_count: 4,
        created_at: '2024-01-18T16:45:00'
      }
    ]);
  }, [setPedidos]);

  // Filtrar pedidos - MODIFICADO para usar búsqueda con botón
  const filteredPedidos = useMemo(() => {
    // Si no se han aplicado filtros, mostrar todos los pedidos
    if (!filtrosAplicados) return pedidos;
    
    return pedidos.filter(pedido => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        pedido.folio.toLowerCase().includes(searchLower) ||
        pedido.cliente_nombre.toLowerCase().includes(searchLower) ||
        pedido.estado.toLowerCase().includes(searchLower);
      
      const matchesEstado = !estadoFilter || pedido.fk_estado_pedido.toString() === estadoFilter;
      const matchesPrioridad = !prioridadFilter || pedido.fk_prioridad_pedido.toString() === prioridadFilter;
      
      // Filtro por fecha
      const matchesFecha = (!fechaInicioFilter && !fechaFinFilter) || 
        (fechaInicioFilter && fechaFinFilter && 
         pedido.fecha_pedido >= fechaInicioFilter && 
         pedido.fecha_pedido <= fechaFinFilter);

      return matchesSearch && matchesEstado && matchesPrioridad && matchesFecha;
    });
  }, [pedidos, searchTerm, estadoFilter, prioridadFilter, fechaInicioFilter, fechaFinFilter, filtrosAplicados]);

  // Función para aplicar búsqueda con loader
  const handleBuscarConLoader = async () => {
    // Si todos los filtros están vacíos, no hace nada
    if (!searchTerm.trim() && !estadoFilter && !prioridadFilter && !fechaInicioFilter && !fechaFinFilter) {
      return;
    }
    
    setApplyingSearch(true);
    // Simular tiempo de búsqueda
    await new Promise(resolve => setTimeout(resolve, 500));
    handleBuscar();
    setApplyingSearch(false);
  };

  // Función para limpiar filtros con loader
  const handleLimpiarConLoader = async () => {
    setApplyingSearch(true);
    // Simular tiempo de limpieza
    await new Promise(resolve => setTimeout(resolve, 500));
    handleLimpiar();
    setApplyingSearch(false);
  };

  // Funciones de manejo
  const handleView = async (pedido: Pedido) => {
    setPedidoSeleccionado(pedido);
    const detalles = await cargarDetallesPedido(pedido.id_pedido);
    setDetallesPedido(detalles);
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

  // MODIFICADA: Función para imprimir pedido con notificación y loader
  const handleImprimir = async (pedido: Pedido) => {
    setPedidoSeleccionado(pedido);
    setImprimiendo(true);
    
    try {
      // Simular tiempo de generación del PDF
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aquí iría la lógica real para generar el PDF
      // Por ejemplo: await generarPDF(pedido);
      
      notifications.show({
        title: 'PDF Generado',
        message: `El PDF del pedido ${pedido.folio} se ha generado exitosamente`,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Hubo un problema al generar el PDF',
        color: 'red',
      });
    } finally {
      setImprimiendo(false);
    }
  };

  const confirmDelete = async () => {
    if (pedidoSeleccionado) {
      const success = await eliminarPedido(pedidoSeleccionado.id_pedido);
      if (success) {
        closeDeleteModal();
        setPedidoSeleccionado(null);
      }
    }
  };

  // MODIFICADA: Función para cambiar estado con notificación
  const cambiarEstado = async (pedidoId: number, nuevoEstadoId: number) => {
    const pedido = pedidos.find(p => p.id_pedido === pedidoId);
    
    // Si el pedido ya está entregado, no permitir cambios
    if (pedido?.fk_estado_pedido === 3) {
      notifications.show({
        title: 'Error',
        message: 'No se puede cambiar el estado de un pedido entregado',
        color: 'red',
      });
      return;
    }

    // Si el nuevo estado es "Entregado", mostrar confirmación
    if (nuevoEstadoId === 3) {
      setPedidoSeleccionado(pedido || null);
      openEntregarModal();
      return;
    }

    // Para otros cambios de estado, aplicar directamente
    const success = await cambiarEstadoPedido(pedidoId, nuevoEstadoId);
    if (success) {
      const nuevoEstado = estadosPedido.find(e => e.id_estado_pedido === nuevoEstadoId);
      notifications.show({
        title: 'Estado actualizado',
        message: `El pedido ${pedido?.folio} ahora está en estado "${nuevoEstado?.descripcion}"`,
        color: 'green',
      });
    }
  };

  // NUEVA: Función para confirmar entrega con notificación
  const confirmarEntrega = async () => {
    if (pedidoSeleccionado) {
      const success = await cambiarEstadoPedido(pedidoSeleccionado.id_pedido, 3);
      if (success) {
        notifications.show({
          title: 'Pedido entregado',
          message: `El pedido ${pedidoSeleccionado.folio} ha sido marcado como entregado exitosamente`,
          color: 'green',
        });
        closeEntregarModal();
        setPedidoSeleccionado(null);
      }
    }
  };

  const getEstadoColor = (estadoId: number) => {
    return estadosPedido.find(e => e.id_estado_pedido === estadoId)?.color || 'gray';
  };

  const getPrioridadColor = (prioridadId: number) => {
    return prioridadesPedido.find(p => p.id_prioridad_pedido === prioridadId)?.color || 'gray';
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

        {/* FILTROS - MODIFICADO con botón de búsqueda y loader */}
        <Paper withBorder p="md" shadow="xs">
          <Group align="flex-end" gap="xs">
            <TextInput
              placeholder="Buscar por folio o cliente..."
              leftSection={<IconSearch size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 2 }}
              size="md"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleBuscarConLoader();
                }
              }}
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
              onClick={handleLimpiarConLoader}
              size="md"
              disabled={applyingSearch}
            >
              Limpiar
            </Button>
            
            <Button 
              onClick={handleBuscarConLoader}
              size="md"
              disabled={applyingSearch}
            >
              Buscar
            </Button>
          </Group>
        </Paper>

        {/* Tabla de Pedidos - Estilo corregido CON LOADER */}
        <Paper withBorder p="md" shadow="xs" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
          <Title order={4} mb="md" style={{ flexShrink: 0 }}>Lista de Pedidos</Title>
          <Box style={{ flexGrow: 1, overflowY: 'auto' }}>
            {loading || applyingSearch ? (
              <Center style={{ height: '50%' }}>
                <Stack align="center" gap="md">
                  <Loader size="lg" />
                  <Text c="dimmed">
                    {applyingSearch ? 'Buscando pedidos...' : 'Cargando pedidos...'}
                  </Text>
                </Stack>
              </Center>
            ) : (
              <Table.ScrollContainer minWidth={800}>
                <Table striped withColumnBorders withRowBorders verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Folio</Table.Th>
                      <Table.Th>Cliente</Table.Th>
                      <Table.Th>Fecha</Table.Th>
                      <Table.Th style={{ width: '120px' }}>Estado</Table.Th>
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
                          <Text>${pedido.total.toFixed(2)}</Text>
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'center' }}>
                          <Text>{pedido.productos_count}</Text>
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
                                {/* ORDEN MODIFICADO: Cambios de estado primero cuando el pedido no está entregado */}
                                {pedido.fk_estado_pedido !== 3 ? (
                                  <>
                                    <Menu.Label>Cambiar Estado</Menu.Label>
                                    {/* MODIFICADO: Filtrar estados para excluir el estado actual */}
                                    {estadosPedido
                                      .filter(estado => estado.id_estado_pedido !== pedido.fk_estado_pedido)
                                      .map(estado => (
                                        <Menu.Item
                                          key={estado.id_estado_pedido}
                                          onClick={() => cambiarEstado(pedido.id_pedido, estado.id_estado_pedido)}
                                        >
                                          {estado.descripcion}
                                        </Menu.Item>
                                      ))}
                                    <Menu.Divider />
                                    
                                    <Menu.Item
                                      leftSection={<IconFileDownload size="1rem" />}
                                      onClick={() => handleImprimir(pedido)}
                                      disabled={imprimiendo}
                                    >
                                      {imprimiendo && pedidoSeleccionado?.id_pedido === pedido.id_pedido ? (
                                        <Group gap="xs">
                                          <Loader size="xs" />
                                          <span>Generando...</span>
                                        </Group>
                                      ) : (
                                        'Imprimir'
                                      )}
                                    </Menu.Item>
                                    <Menu.Divider />
                                    
                                    <Menu.Item
                                      color="red"
                                      leftSection={<IconTrash size="1rem" />}
                                      onClick={() => handleDelete(pedido)}
                                    >
                                      Eliminar
                                    </Menu.Item>
                                  </>
                                ) : (
                                  // Cuando el pedido está entregado
                                  <>
                                    <Menu.Item
                                      leftSection={<IconFileDownload size="1rem" />}
                                      onClick={() => handleImprimir(pedido)}
                                      disabled={imprimiendo}
                                    >
                                      {imprimiendo && pedidoSeleccionado?.id_pedido === pedido.id_pedido ? (
                                        <Group gap="xs">
                                          <Loader size="xs" />
                                          <span>Generando...</span>
                                        </Group>
                                      ) : (
                                        'Imprimir'
                                      )}
                                    </Menu.Item>
                                    <Menu.Divider />
                                    
                                    <Menu.Label>Estado Actual</Menu.Label>
                                    <Menu.Item disabled>
                                      Entregado (No editable)
                                    </Menu.Item>
                                    <Menu.Divider />
                                    
                                    <Menu.Item
                                      color="red"
                                      leftSection={<IconTrash size="1rem" />}
                                      onClick={() => handleDelete(pedido)}
                                      disabled
                                    >
                                      Eliminar
                                    </Menu.Item>
                                  </>
                                )}
                              </Menu.Dropdown>
                            </Menu>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}

            {!loading && !applyingSearch && filteredPedidos.length === 0 && (
              <Box p="xl" style={{ textAlign: 'center' }}>
                <Text c="dimmed">
                  {filtrosAplicados 
                    ? "No se encontraron pedidos con los filtros aplicados" 
                    : "No hay pedidos registrados"}
                </Text>
              </Box>
            )}
          </Box>
        </Paper>
      </Stack>

      {/* Modal de Ver Detalles usando componente OrderDetailsModal */}
      <OrderDetailsModal
        opened={viewModal}
        onClose={closeViewModal}
        pedido={pedidoSeleccionado}
        detallesPedido={detallesPedido}
        estadosPedido={estadosPedido}
        prioridadesPedido={prioridadesPedido}
      />

      {/* Modal de Confirmación de Eliminación - ESTILO ACTUALIZADO */}
      <Modal
        opened={deleteModal}
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
            ¿Estás seguro de eliminar el pedido <Text span fw={600}>"{pedidoSeleccionado?.folio}"</Text>?
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

      {/* NUEVO: Modal de Confirmación para Entregar Pedido */}
      <Modal
        opened={entregarModal}
        onClose={closeEntregarModal}
        title={<Title order={4}>Marcar como Entregado</Title>}
        size="md"
        centered
      >
        <Stack gap="md">
          <Alert 
            icon={<IconAlertCircle size="1rem" />}
            title="¿Confirmar entrega?" 
            color="green"
          >
            Esta acción marcará el pedido <Text span fw={600}>{pedidoSeleccionado?.folio}</Text> como entregado. 
            Una vez entregado, no podrás cambiar su estado nuevamente.
            ¿Deseas continuar?
          </Alert>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeEntregarModal}>
              Cancelar
            </Button>
            <Button color="green" onClick={confirmarEntrega}>
              Sí, Entregar Pedido
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}