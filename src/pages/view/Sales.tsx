// src/pages/view/Sales.tsx
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
  Select,
  NumberInput,
  Badge,
  Stack,
  Box,
  Tooltip,
  Textarea,
  ScrollArea,
  Divider,
  Alert,
} from '@mantine/core';
import { 
  IconPlus, 
  IconSearch, 
  IconEdit, 
  IconEye,
  IconDownload,
  IconCalendar,
  IconUser,
  IconReceipt,
  IconClock,
  IconCash,
  IconShoppingCart,
  IconInfoCircle,
  IconX,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '../../context/AuthContext';

// Interfaces actualizadas según diagrama ER
interface EstadoVenta {
  id_estado_venta: number;
  descripcion: string;
}

interface Venta {
  id_venta: number;
  folio_venta: string;
  fk_sesion_caja: number;
  fk_usuario: number;
  fk_metodo_pago: number;
  fk_cliente: number;
  fk_pedido: number | null;
  fk_estado_venta: number;
  fecha_venta: string;
  total: number;
  created_at: string;
  updated_at: string;
  
  // Campos para mostrar
  estado_venta_nombre?: string;
  metodo_pago_nombre?: string;
  usuario_nombre?: string;
  cliente_nombre?: string;
  sesion_caja_id?: string;
  detalle_venta?: DetalleVenta[];
}

interface DetalleVenta {
  id_detalle_venta: number;
  fk_venta: number;
  fk_presentacion_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto_nombre?: string;
  sku?: string;
  unidad_medida?: string;
  // Nuevos campos para devolución
  devolver?: boolean;
  cantidadDevolver?: number;
}

interface MetodoPago {
  id_metodo_pago: number;
  descripcion: string;
}

export default function Sales() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [newSaleModal, { open: openNewSaleModal, close: closeNewSaleModal }] = useDisclosure(false);
  const [detailModal, { open: openDetailModal, close: closeDetailModal }] = useDisclosure(false);
  const [statusModal, { open: openStatusModal, close: closeStatusModal }] = useDisclosure(false);
  const [selectedSale, setSelectedSale] = useState<Venta | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [motivoDevolucion, setMotivoDevolucion] = useState('');
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [productosDevolucion, setProductosDevolucion] = useState<DetalleVenta[]>([]);

  // Datos según diagrama ER
  const [estadosVenta] = useState<EstadoVenta[]>([
    { id_estado_venta: 1, descripcion: 'finalizada' },
    { id_estado_venta: 2, descripcion: 'cancelada' },
    { id_estado_venta: 3, descripcion: 'devolucion' }
  ]);

  const [metodosPago] = useState<MetodoPago[]>([
    { id_metodo_pago: 1, descripcion: 'Efectivo' },
    { id_metodo_pago: 2, descripcion: 'Tarjeta' },
    { id_metodo_pago: 3, descripcion: 'Transferencia' }
  ]);

  const [ventas, setVentas] = useState<Venta[]>([
    {
      id_venta: 1,
      folio_venta: 'F-001',
      fk_sesion_caja: 1,
      fk_usuario: 1,
      fk_metodo_pago: 1,
      fk_cliente: 1,
      fk_pedido: null,
      fk_estado_venta: 1,
      fecha_venta: '2024-01-15 10:30:00',
      total: 1250.75,
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
      estado_venta_nombre: 'finalizada',
      metodo_pago_nombre: 'Efectivo',
      usuario_nombre: 'Ana García',
      cliente_nombre: 'Juan Pérez',
      sesion_caja_id: 'SC-001',
      detalle_venta: [
        {
          id_detalle_venta: 1,
          fk_venta: 1,
          fk_presentacion_producto: 1,
          cantidad: 2,
          precio_unitario: 25.00,
          subtotal: 50.00,
          producto_nombre: 'Cuaderno Profesional',
          sku: 'CUA-PROF-100H',
          unidad_medida: 'Pieza'
        },
        {
          id_detalle_venta: 2,
          fk_venta: 1,
          fk_presentacion_producto: 2,
          cantidad: 5,
          precio_unitario: 5.50,
          subtotal: 27.50,
          producto_nombre: 'Bolígrafo BIC Azul',
          sku: 'BOL-BIC-AZUL',
          unidad_medida: 'Pieza'
        }
      ]
    },
    {
      id_venta: 2,
      folio_venta: 'F-002',
      fk_sesion_caja: 1,
      fk_usuario: 2,
      fk_metodo_pago: 2,
      fk_cliente: 2,
      fk_pedido: null,
      fk_estado_venta: 1,
      fecha_venta: '2024-01-15 14:20:00',
      total: 890.50,
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
      estado_venta_nombre: 'finalizada',
      metodo_pago_nombre: 'Tarjeta',
      usuario_nombre: 'Carlos López',
      cliente_nombre: 'María García',
      sesion_caja_id: 'SC-001',
      detalle_venta: [
        {
          id_detalle_venta: 3,
          fk_venta: 2,
          fk_presentacion_producto: 3,
          cantidad: 1,
          precio_unitario: 45.00,
          subtotal: 45.00,
          producto_nombre: 'Resma Papel A4',
          sku: 'RESMA-A4-500',
          unidad_medida: 'Caja'
        }
      ]
    }
  ]);

  // Estados para formularios
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<string | null>(null);
  const [totalVenta, setTotalVenta] = useState<number | string>('');
  const [notas, setNotas] = useState('');

  // Filtrar ventas
  const filteredVentas = ventas.filter(venta =>
    venta.folio_venta.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (venta.cliente_nombre && venta.cliente_nombre.toLowerCase().includes(searchQuery.toLowerCase()))
  ).filter(venta => {
    const matchesPayment = !paymentFilter || venta.fk_metodo_pago.toString() === paymentFilter;
    const matchesStatus = !statusFilter || venta.fk_estado_venta.toString() === statusFilter;
    const matchesDate = !dateFilter || filtrarPorFecha(venta.fecha_venta, dateFilter);
    return matchesPayment && matchesStatus && matchesDate;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setPaymentFilter(null);
    setStatusFilter(null);
    setDateFilter(null);
  };

  const filtrarPorFecha = (fechaVenta: string, filtro: string) => {
    const fecha = new Date(fechaVenta);
    const hoy = new Date();

        switch (filtro) {
            case 'hoy':
            return fecha.toDateString() === hoy.toDateString();
            case 'semana':
            const inicioSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay()));
            return fecha >= inicioSemana;
            case 'mes':
            return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
            default:
            return true;
        }
    };

  const handleNewSale = () => {
    if (!metodoPagoSeleccionado || !totalVenta) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    const nuevaVenta: Venta = {
      id_venta: Math.max(...ventas.map(v => v.id_venta)) + 1,
      folio_venta: `F-${(Math.max(...ventas.map(v => v.id_venta)) + 1).toString().padStart(3, '0')}`,
      fk_sesion_caja: 1,
      fk_usuario: 1,
      fk_metodo_pago: Number(metodoPagoSeleccionado),
      fk_cliente: clienteSeleccionado ? Number(clienteSeleccionado) : 0,
      fk_pedido: null,
      fk_estado_venta: 1, // finalizada por defecto
      fecha_venta: new Date().toISOString(),
      total: Number(totalVenta),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      estado_venta_nombre: 'finalizada',
      metodo_pago_nombre: metodosPago.find(m => m.id_metodo_pago === Number(metodoPagoSeleccionado))?.descripcion,
      usuario_nombre: user?.name || 'Usuario Actual',
      cliente_nombre: clienteSeleccionado ? 'Cliente Registrado' : 'Cliente Mostrador',
      sesion_caja_id: 'SC-001',
      detalle_venta: []
    };

    setVentas([nuevaVenta, ...ventas]);
    
    // Limpiar formulario
    setClienteSeleccionado(null);
    setMetodoPagoSeleccionado(null);
    setTotalVenta('');
    setNotas('');
    closeNewSaleModal();
  };

  const handleViewDetails = (venta: Venta) => {
    setSelectedSale(venta);
    openDetailModal();
  };

  const handleChangeStatus = (venta: Venta) => {
    setSelectedSale(venta);
    setSelectedStatus(venta.fk_estado_venta.toString());
    
    // Inicializar productos para devolución
    if (venta.detalle_venta) {
      const productosInicializados = venta.detalle_venta.map(producto => ({
        ...producto,
        devolver: false,
        cantidadDevolver: 0
      }));
      setProductosDevolucion(productosInicializados);
    }
    
    openStatusModal();
  };

  // Función para manejar cambios en los productos a devolver
  const handleProductoDevolucionChange = (index: number, field: string, value: any) => {
    const updatedProductos = [...productosDevolucion];
    
    if (field === 'devolver') {
      updatedProductos[index].devolver = value;
      // Si se selecciona, inicializar con 1; si se deselecciona, resetear a 0
      if (value) {
        updatedProductos[index].cantidadDevolver = 1;
      } else {
        updatedProductos[index].cantidadDevolver = 0;
      }
    } else if (field === 'cantidadDevolver') {
      // Convertir a número y validar
      const numero = Number(value);
      
      // Si es un número válido y está dentro del rango
      if (!isNaN(numero) && numero >= 1 && numero <= updatedProductos[index].cantidad) {
        updatedProductos[index].cantidadDevolver = numero;
      }
      // Si el número es mayor al máximo, usar el máximo
      else if (numero > updatedProductos[index].cantidad) {
        updatedProductos[index].cantidadDevolver = updatedProductos[index].cantidad;
      }
      // Si es menor a 1, usar 1
      else if (numero < 1) {
        updatedProductos[index].cantidadDevolver = 1;
      }
    }
    
    setProductosDevolucion(updatedProductos);
  };

  // Calcular el total a devolver
  const calcularTotalDevolucion = () => {
    return productosDevolucion.reduce((total, producto) => {
      if (producto.devolver && producto.cantidadDevolver && producto.cantidadDevolver > 0) {
        const subtotalDevolver = (producto.cantidadDevolver / producto.cantidad) * producto.subtotal;
        return total + subtotalDevolver;
      }
      return total;
    }, 0);
  };

  const handleUpdateStatus = () => {
    if (!selectedSale || !selectedStatus) return;

    if (selectedStatus === '3') { // Devolución
      const productosADevolver = productosDevolucion.filter(p => p.devolver && p.cantidadDevolver && p.cantidadDevolver > 0);
      
      if (productosADevolver.length === 0) {
        alert('Selecciona al menos un producto para devolver');
        return;
      }

      const totalDevolucion = calcularTotalDevolucion();
      
      console.log('Registrando devolución parcial:', {
        venta: selectedSale.folio_venta,
        motivo: motivoDevolucion,
        productos: productosADevolver,
        totalDevolucion: totalDevolucion,
        nuevoTotalVenta: selectedSale.total - totalDevolucion,
        usuario: user?.name || 'Usuario Actual',
        fecha: new Date().toISOString()
      });
      
      // Lógica para actualizar stock solo con los productos seleccionados
      productosADevolver.forEach(producto => {
        console.log(`Devolviendo al stock: ${producto.cantidadDevolver} unidades de ${producto.producto_nombre}`);
        // Aquí iría la llamada a la API para actualizar el stock
      });

      // ACTUALIZAR LA VENTA CON EL NUEVO TOTAL (restando la devolución)
      setVentas(ventas.map(venta =>
        venta.id_venta === selectedSale.id_venta
          ? {
              ...venta,
              fk_estado_venta: Number(selectedStatus),
              estado_venta_nombre: 'devolucion',
              total: venta.total - totalDevolucion, // ← REDUCIR EL TOTAL
              updated_at: new Date().toISOString()
            }
          : venta
      ));

    } else if (selectedStatus === '2') { // Cancelada
      console.log('Cancelando venta:', {
        venta: selectedSale.folio_venta,
        motivo: motivoCancelacion,
        usuario: user?.name || 'Usuario Actual',
        fecha: new Date().toISOString()
      });

      setVentas(ventas.map(venta =>
        venta.id_venta === selectedSale.id_venta
          ? {
              ...venta,
              fk_estado_venta: Number(selectedStatus),
              estado_venta_nombre: 'cancelada',
              updated_at: new Date().toISOString()
            }
          : venta
      ));
    } else {
      // Para otros estados (finalizada)
      setVentas(ventas.map(venta =>
        venta.id_venta === selectedSale.id_venta
          ? {
              ...venta,
              fk_estado_venta: Number(selectedStatus),
              estado_venta_nombre: estadosVenta.find(e => e.id_estado_venta === Number(selectedStatus))?.descripcion,
              updated_at: new Date().toISOString()
            }
          : venta
      ));
    }

    // Limpiar estados
    handleCloseStatusModal();
  };

  const handleCloseStatusModal = () => {
    closeStatusModal();
    setMotivoDevolucion('');
    setMotivoCancelacion('');
    setSelectedStatus(null);
    setSelectedSale(null);
    setProductosDevolucion([]);
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'finalizada': return 'green';
      case 'cancelada': return 'red';
      case 'devolucion': return 'orange';
      default: return 'gray';
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const rows = filteredVentas.map((venta) => (
    <Table.Tr key={venta.id_venta}>
      <Table.Td>
        <Text>{venta.folio_venta}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          {formatFecha(venta.fecha_venta)}
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          {venta.cliente_nombre || 'Cliente Mostrador'}
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge color={getStatusColor(venta.estado_venta_nombre || '')} variant="light">
          {venta.estado_venta_nombre}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge variant="outline" color="blue">
          {venta.metodo_pago_nombre}
        </Badge>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        ${venta.total.toFixed(2)}
      </Table.Td>
      <Table.Td style={{ textAlign: 'center' }}>
        <Group gap='xs' justify="center">
          <Tooltip label="Ver detalles" position="bottom" withArrow>
            <ActionIcon variant="light" color="blue" onClick={() => handleViewDetails(venta)} size="sm">
              <IconEye size="1rem" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Cambiar estado" position="bottom" withArrow>
            <ActionIcon variant="light" color="orange" onClick={() => handleChangeStatus(venta)} size="sm">
              <IconEdit size="1rem" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Descargar recibo" position="bottom" withArrow>
            <ActionIcon variant="light" color="green" size="sm">
              <IconDownload size="1rem" />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="xl">
      <Stack gap="md">
        {/* Header */}
        <Paper withBorder p="md" shadow="xs" style={{ flexShrink: 0 }}>
          <Group justify="space-between">
            <div>
              <Title order={3}>Ventas</Title>
              <Text c="dimmed" size="sm">Gestión y consulta del historial de ventas</Text>
            </div>
          </Group>
        </Paper>

        {/* Filtros */}
        <Paper withBorder p="md" shadow="xs">
          <Group align="flex-end" gap="xs">
            <TextInput
              placeholder="Buscar por folio o cliente..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 2 }}
              size="md"
            />
            
            <Select
              placeholder="Método de pago"
              data={metodosPago.map(mp => ({
                value: mp.id_metodo_pago.toString(),
                label: mp.descripcion
              }))}
              value={paymentFilter}
              onChange={setPaymentFilter}
              clearable
              style={{ flex: 1 }}
              size="md"
            />

            <Select
              placeholder="Estado"
              data={estadosVenta.map(estado => ({
                value: estado.id_estado_venta.toString(),
                label: estado.descripcion
              }))}
              value={statusFilter}
              onChange={setStatusFilter}
              clearable
              style={{ flex: 1 }}
              size="md"
            />

            <TextInput
                type="date"
                placeholder="Fecha"
                value={dateFilter || ''}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ flex: 1 }}
                size="md"
            />
            
            <Button 
              variant="subtle" 
              onClick={clearFilters}
              size="md"
            >
              Limpiar
            </Button>
          </Group>
        </Paper>

        {/* Tabla */}
        <Paper withBorder p="md" shadow="xs" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
          <Group justify="space-between" mb="md" style={{ flexShrink: 0 }}>
            <Title order={4}>Historial de Ventas</Title>
            <Text c="dimmed" size="sm">
              {filteredVentas.length} de {ventas.length} ventas
            </Text>
          </Group>

          <Box style={{ flexGrow: 1, overflow: 'auto' }}>
            <ScrollArea>
              <Table striped withColumnBorders withRowBorders verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Folio</Table.Th>
                    <Table.Th>Fecha</Table.Th>
                    <Table.Th>Cliente</Table.Th>
                    <Table.Th>Estado</Table.Th>
                    <Table.Th>Pago</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Total</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.length > 0 ? rows : (
                    <Table.Tr>
                      <Table.Td colSpan={7} style={{ textAlign: 'center' }}>
                        <Text c="dimmed" py="xl">
                          No se encontraron ventas con los filtros aplicados
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Box>
        </Paper>

        {/* Modal Detalles Venta */}
        <Modal
          opened={detailModal}
          onClose={closeDetailModal}
          title={<Title order={4}>Detalles de Folio {selectedSale?.folio_venta}</Title>}
          size="lg"
          centered
        >
          {selectedSale && (
            <Stack gap="md">
              {/* Información General */}
              <Paper withBorder p="md">
                <Group justify="space-between">
                  <Stack gap="xs">
                    <Group>
                      <IconReceipt size="1.2rem" />
                      <Text fw={600}>Información de Venta</Text>
                    </Group>
                    <Group>
                      <Badge color={getStatusColor(selectedSale.estado_venta_nombre || '')} size="lg">
                        {selectedSale.estado_venta_nombre}
                      </Badge>
                      <Badge variant="outline" color="blue" size="lg">
                        {selectedSale.metodo_pago_nombre}
                      </Badge>
                    </Group>
                  </Stack>
                  <Stack gap="xs" align="flex-end">
                    <Text fw={700} size="xl">${selectedSale.total.toFixed(2)}</Text>
                    <Text size="sm" c="dimmed">Total</Text>
                  </Stack>
                </Group>
              </Paper>

              {/* Detalles de la Venta */}
              <Paper withBorder p="md">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Stack gap="xs">
                      <Group>
                        <IconCalendar size="1rem" />
                        <Text fw={500}>Fecha y Hora:</Text>
                        <Text>{formatFecha(selectedSale.fecha_venta)}</Text>
                      </Group>
                      <Group>
                        <IconUser size="1rem" />
                        <Text fw={500}>Cliente:</Text>
                        <Text>{selectedSale.cliente_nombre || 'Cliente Mostrador'}</Text>
                      </Group>
                    </Stack>
                    <Stack gap="xs" align="flex-end">
                      <Group>
                        <IconCash size="1rem" />
                        <Text fw={500}>Vendedor:</Text>
                        <Text>{selectedSale.usuario_nombre}</Text>
                      </Group>
                      <Group>
                        <IconClock size="1rem" />
                        <Text fw={500}>Sesión:</Text>
                        <Text>{selectedSale.sesion_caja_id}</Text>
                      </Group>
                    </Stack>
                  </Group>
                </Stack>
              </Paper>

              {/* Productos Vendidos */}
              <Paper withBorder p="md">
                <Text fw={600} mb="md">Productos Vendidos</Text>
                {selectedSale.detalle_venta && selectedSale.detalle_venta.length > 0 ? (
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Producto</Table.Th>
                        <Table.Th>SKU</Table.Th>
                        <Table.Th style={{ textAlign: 'center' }}>Cantidad</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Precio Unit.</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Subtotal</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {selectedSale.detalle_venta.map((detalle) => (
                        <Table.Tr key={detalle.id_detalle_venta}>
                          <Table.Td>
                            <Text>{detalle.producto_nombre}</Text>
                            {detalle.unidad_medida && (
                              <Text size="sm" c="dimmed">{detalle.unidad_medida}</Text>
                            )}
                          </Table.Td>
                          <Table.Td>{detalle.sku}</Table.Td>
                          <Table.Td style={{ textAlign: 'center' }}>{detalle.cantidad}</Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>${detalle.precio_unitario.toFixed(2)}</Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>${detalle.subtotal.toFixed(2)}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                ) : (
                  <Text c="dimmed" ta="center" py="md">
                    No hay detalles disponibles para esta venta
                  </Text>
                )}
              </Paper>

              {/* Resumen */}
              <Paper withBorder p="md" bg="gray.0">
                <Group justify="space-between">
                  <Text fw={600}>Total de la Venta</Text>
                  <Text fw={700} size="lg">${selectedSale.total.toFixed(2)}</Text>
                </Group>
              </Paper>
            </Stack>
          )}
        </Modal>

        {/* Modal Cambiar Estado */}
        <Modal
          opened={statusModal}
          onClose={handleCloseStatusModal}
          title={<Title order={4}>Cambiar Estado - {selectedSale?.folio_venta}</Title>}
          size="lg"
          centered
        >
          {selectedSale && (
            <Stack gap="md">
              <Text>Selecciona el nuevo estado para esta venta:</Text>
              
              <Select
                data={estadosVenta.map(estado => ({
                  value: estado.id_estado_venta.toString(),
                  label: estado.descripcion
                }))}
                value={selectedStatus}
                onChange={(value) => {
                  setSelectedStatus(value);
                  // Resetear campos adicionales cuando cambia el estado
                  if (value !== '3') {
                    setMotivoDevolucion('');
                  }
                  if (value !== '2') {
                    setMotivoCancelacion('');
                  }
                }}
                size="md"
              />

              {/* Campos adicionales para DEVOLUCIÓN */}
              {selectedStatus === '3' && (
                <Stack gap="md">
                  <Divider />
                  <Text fw={600} c="orange">Seleccionar Productos para Devolución</Text>                          
                  
                  <Textarea
                    label="Motivo de la devolución *"
                    placeholder="Describa el motivo de la devolución (producto dañado, error en pedido, etc.)"
                    value={motivoDevolucion}
                    onChange={(event) => setMotivoDevolucion(event.currentTarget.value)}
                    rows={3}
                    required
                    size="md"
                  />

                  <Alert 
                    variant="light" 
                    color="blue" 
                    title="Información importante" 
                    icon={<IconInfoCircle />}
                    mb="md"
                  >
                    La cantidad a devolver no puede ser mayor a la cantidad originalmente vendida. 
                  </Alert>

                  {/* Lista de productos para seleccionar */}
                  <Paper withBorder p="md">
                    <Text fw={600} mb="md">Productos de la venta</Text>
                    <Stack gap="md">
                      {productosDevolucion.map((producto, index) => (
                        <Paper key={producto.id_detalle_venta} withBorder p="sm" bg={producto.devolver ? "blue.0" : "transparent"}>
                          <Group justify="space-between">
                            <Box style={{ flex: 2 }}>
                              <Text fw={500}>{producto.producto_nombre}</Text>
                              <Text size="sm" c="dimmed">SKU: {producto.sku}</Text>
                              <Text size="sm" c="dimmed">
                                Vendido: {producto.cantidad} {producto.unidad_medida} • ${producto.subtotal.toFixed(2)}
                              </Text>
                            </Box>
                            
                            <Group>
                              {/* BOTÓN MEJORADO CON TOOLTIP DINÁMICO E ÍCONO CAMBIANTE */}
                              {producto.devolver ? (
                                <ActionIcon
                                  color="red"
                                  variant="filled"
                                  onClick={() => handleProductoDevolucionChange(index, 'devolver', !producto.devolver)}
                                >
                                  <IconX size="1rem" />
                                </ActionIcon>
                              ) : (
                                // Con tooltip cuando no está seleccionado (IconShoppingCart)
                                <Tooltip 
                                  label="Seleccionar para devolución" 
                                  position="bottom" 
                                  withArrow
                                >
                                  <ActionIcon
                                    color="blue"
                                    variant="outline"
                                    onClick={() => handleProductoDevolucionChange(index, 'devolver', !producto.devolver)}
                                  >
                                    <IconShoppingCart size="1rem" />
                                  </ActionIcon>
                                </Tooltip>
                              )}
                                                            
                              {producto.devolver && (
                                <NumberInput
                                  placeholder="Cantidad"
                                  value={producto.cantidadDevolver}
                                  onChange={(value) => {
                                    const numero = Number(value);
                                    // Solo actualizar si el número es válido y está en rango
                                    if (!isNaN(numero) && numero >= 0 && numero <= producto.cantidad) {
                                      handleProductoDevolucionChange(index, 'cantidadDevolver', numero);
                                    }
                                  }}
                                  min={0}
                                  max={producto.cantidad}
                                  clampBehavior="strict"
                                  size="xs"
                                  style={{ width: '100px' }}
                                  allowDecimal={false}
                                  allowNegative={false}
                                />
                              )}
                            </Group>
                          </Group>
                          
                          {producto.devolver && producto.cantidadDevolver && producto.cantidadDevolver > 0 && (
                            <Group justify="space-between" mt="xs" p="xs" bg="green.1">
                              <Text size="sm">Subtotal a devolver:</Text>
                              <Text fw={600} size="sm" c="green">
                                ${((producto.cantidadDevolver / producto.cantidad) * producto.subtotal).toFixed(2)}
                              </Text>
                            </Group>
                          )}
                        </Paper>
                      ))}
                    </Stack>
                  </Paper>

                  {/* Resumen de devolución */}
                  {productosDevolucion.some(p => p.devolver && p.cantidadDevolver && p.cantidadDevolver > 0) && (
                    <Paper withBorder p="md" bg="orange.0">
                      <Group justify="space-between">
                        <Text fw={600}>Total a devolver:</Text>
                        <Text fw={700} size="lg" c="orange">
                          ${calcularTotalDevolucion().toFixed(2)}
                        </Text>
                      </Group>
                      <Text size="sm" mt="xs">
                        Productos seleccionados: {productosDevolucion.filter(p => p.devolver && p.cantidadDevolver && p.cantidadDevolver > 0).length}
                      </Text>
                    </Paper>
                  )}

                  <Paper withBorder p="md" bg="orange.0">
                    <Text size="sm" c="orange">
                      <strong>Nota:</strong> Solo los productos seleccionados serán devueltos al stock 
                        y el total de esta venta se reducirá por el monto correspondiente.
                    </Text>
                  </Paper>
                </Stack>
              )}

              {/* Campos adicionales para CANCELADA */}
              {selectedStatus === '2' && (
                <Stack gap="md">
                  <Divider />
                  <Text fw={600} c="red">Información de Cancelación</Text>
                  
                  <Textarea
                    label="Motivo de la cancelación *"
                    placeholder="Describa el motivo de la cancelación (error en venta, cliente desistió, etc.)"
                    value={motivoCancelacion}
                    onChange={(event) => setMotivoCancelacion(event.currentTarget.value)}
                    rows={3}
                    required
                    size="md"
                  />

                  <Paper withBorder p="md" bg="red.0">
                    <Text size="sm" c="red">
                       <strong>Nota:</strong> Las ventas canceladas no se incluyen en los cálculos de 
                        cierre de caja ni en las estadísticas de ventas, pero se mantienen en el sistema.
                    </Text>
                  </Paper>
                </Stack>
              )}

              {/* Información de auditoría (siempre visible) */}
              <Paper withBorder p="sm" bg="blue.0">
                <Stack gap="xs">
                  <Text size="sm" fw={500}>Información de auditoría:</Text>
                  <Group justify="space-between">
                    <Text size="sm">Usuario:</Text>
                    <Text size="sm" fw={500}>{user?.name || 'Usuario Actual'}</Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm">Fecha:</Text>
                    <Text size="sm" fw={500}>{new Date().toLocaleString('es-ES')}</Text>
                  </Group>
                </Stack>
              </Paper>

              <Group justify="flex-end" gap="xs">
                <Button variant="subtle" onClick={handleCloseStatusModal} size="md">
                  Cancelar
                </Button>
                <Button 
                  onClick={handleUpdateStatus}
                  disabled={!selectedStatus || 
                    (selectedStatus === '3' && !motivoDevolucion.trim()) ||
                    (selectedStatus === '2' && !motivoCancelacion.trim())
                  }
                  color={
                    selectedStatus === '3' ? 'orange' :
                    selectedStatus === '2' ? 'red' : 'blue'
                  }
                  size="md"
                >
                  {selectedStatus === '3' ? 'Registrar Devolución' :
                   selectedStatus === '2' ? 'Confirmar Cancelación' : 'Actualizar Estado'}
                </Button>
              </Group>
            </Stack>
          )}
        </Modal>

        {/* Modal Nueva Venta */}
        <Modal
          opened={newSaleModal}
          onClose={closeNewSaleModal}
          title={<Title order={4}>Registrar Nueva Venta</Title>}
          size="md"
          centered
        >
          <Stack gap="md">
            <Select
              label="Cliente"
              placeholder="Selecciona un cliente"
              data={[
                { value: '', label: 'Cliente Mostrador' }
              ]}
              value={clienteSeleccionado}
              onChange={setClienteSeleccionado}
              clearable
              size="md"
            />

            <Select
              label="Método de Pago"
              placeholder="Selecciona método de pago"
              data={metodosPago.map(mp => ({
                value: mp.id_metodo_pago.toString(),
                label: mp.descripcion
              }))}
              value={metodoPagoSeleccionado}
              onChange={setMetodoPagoSeleccionado}
              required
              size="md"
            />

            <NumberInput
              label="Total"
              placeholder="0.00"
              value={totalVenta}
              onChange={setTotalVenta}
              prefix="$"
              decimalScale={2}
              min={0}
              required
              size="md"
            />

            <Textarea
              label="Notas"
              placeholder="Observaciones adicionales..."
              value={notas}
              onChange={(event) => setNotas(event.currentTarget.value)}
              rows={3}
              size="md"
            />

            <Group justify="flex-end" gap="xs">
              <Button variant="subtle" onClick={closeNewSaleModal} size="md">
                Cancelar
              </Button>
              <Button 
                onClick={handleNewSale} 
                disabled={!metodoPagoSeleccionado || !totalVenta}
                size="md"
              >
                Registrar Venta
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
}