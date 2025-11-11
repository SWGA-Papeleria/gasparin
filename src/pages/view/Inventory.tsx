// pages/view/Inventory.tsx
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
} from '@mantine/core';
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconPackage,
  IconHistory,
  IconArrowUp,
  IconArrowDown,
  IconAdjustments,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

// Interfaces según el diagrama ER
interface PresentacionProducto {
  id_presentacion_producto: number;
  sku: string;
  fk_producto: number;
  fk_unidad_medida: number;
  precio_venta: number;
  factor_conversion: number;
  unidad_nombre?: string;
  producto_nombre?: string;
  stock_actual?: number;
}

interface MovimientoStock {
  id_stock: number;
  fk_presentacion_producto: number;
  cantidad: number;
  fecha_movimiento: Date;
  fk_tipo_movimiento: number;
  tipo_nombre?: string;
  motivo?: string;
  realizado_por?: string; // <- CAMPO AÑADIDO
}

interface TipoMovimiento {
  id_tipo_movimiento: number;
  descripcion: string;
  es_entrada: boolean;
}

export default function Inventory() {
  // Datos de ejemplo
  const [tiposMovimiento] = useState<TipoMovimiento[]>([
    { id_tipo_movimiento: 1, descripcion: 'Ajuste de Inventario', es_entrada: true },
    { id_tipo_movimiento: 2, descripcion: 'Merma/Pérdida', es_entrada: false },
    { id_tipo_movimiento: 3, descripcion: 'Devolución de Cliente', es_entrada: true },
    { id_tipo_movimiento: 4, descripcion: 'Uso Interno', es_entrada: false },
    { id_tipo_movimiento: 5, descripcion: 'Donación/Regalo', es_entrada: false },
    { id_tipo_movimiento: 6, descripcion: 'Ajuste por Diferencia', es_entrada: true },
    { id_tipo_movimiento: 7, descripcion: 'Ajuste por Diferencia', es_entrada: false },
  ]);

  const [presentaciones, setPresentaciones] = useState<PresentacionProducto[]>([
    {
      id_presentacion_producto: 1,
      sku: 'BOL-BIC-AZUL',
      fk_producto: 1,
      fk_unidad_medida: 1,
      precio_venta: 5.50,
      factor_conversion: 1,
      unidad_nombre: 'Pieza',
      producto_nombre: 'Bolígrafo BIC Azul',
      stock_actual: 45
    },
    {
      id_presentacion_producto: 2,
      sku: 'BOL-BIC-NEGRO',
      fk_producto: 1,
      fk_unidad_medida: 1,
      precio_venta: 5.50,
      factor_conversion: 1,
      unidad_nombre: 'Pieza',
      producto_nombre: 'Bolígrafo BIC Negro',
      stock_actual: 32
    },
    {
      id_presentacion_producto: 3,
      sku: 'CUA-PROF-100H',
      fk_producto: 2,
      fk_unidad_medida: 1,
      precio_venta: 25.00,
      factor_conversion: 1,
      unidad_nombre: 'Pieza',
      producto_nombre: 'Cuaderno Profesional 100H',
      stock_actual: 15
    },
    {
      id_presentacion_producto: 4,
      sku: 'RESMA-A4-500',
      fk_producto: 3,
      fk_unidad_medida: 3,
      precio_venta: 45.00,
      factor_conversion: 1,
      unidad_nombre: 'Caja',
      producto_nombre: 'Resma Papel A4 500h',
      stock_actual: 8
    },
  ]);

  const [movimientos, setMovimientos] = useState<MovimientoStock[]>([
    {
      id_stock: 1,
      fk_presentacion_producto: 1,
      cantidad: 100,
      fecha_movimiento: new Date('2024-01-15'),
      fk_tipo_movimiento: 1,
      tipo_nombre: 'Ajuste de Inventario',
      motivo: 'Ajuste inicial de stock',
      realizado_por: 'Ana García' // <- DATO AÑADIDO
    },
    {
      id_stock: 2,
      fk_presentacion_producto: 1,
      cantidad: -5,
      fecha_movimiento: new Date('2024-01-16'),
      fk_tipo_movimiento: 2,
      tipo_nombre: 'Merma/Pérdida',
      motivo: 'Productos dañados en almacén',
      realizado_por: 'Carlos López' // <- DATO AÑADIDO
    },
    {
      id_stock: 3,
      fk_presentacion_producto: 2,
      cantidad: 50,
      fecha_movimiento: new Date('2024-01-10'),
      fk_tipo_movimiento: 1,
      tipo_nombre: 'Ajuste de Inventario',
      motivo: 'Corrección por diferencia en conteo',
      realizado_por: 'María Rodríguez' // <- DATO AÑADIDO
    },
    {
      id_stock: 4,
      fk_presentacion_producto: 3,
      cantidad: -2,
      fecha_movimiento: new Date('2024-01-12'),
      fk_tipo_movimiento: 4,
      tipo_nombre: 'Uso Interno',
      motivo: 'Uso en oficina',
      realizado_por: 'Juan Pérez' // <- DATO AÑADIDO
    },
  ]);

  // Estados para modales
  const [movimientoModalOpened, { open: openMovimientoModal, close: closeMovimientoModal }] = useDisclosure(false);
  const [historialModalOpened, { open: openHistorialModal, close: closeHistorialModal }] = useDisclosure(false);

  // Estados para formularios
  const [selectedPresentacion, setSelectedPresentacion] = useState<PresentacionProducto | null>(null);
  const [tipoMovimiento, setTipoMovimiento] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState<number | string>(0);
  const [motivo, setMotivo] = useState('');

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<string | null>(null);

  // Filtrar presentaciones
  const filteredPresentaciones = presentaciones.filter(pres =>
    pres.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pres.producto_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(pres => {
    if (!stockFilter) return true;
    const stock = pres.stock_actual || 0;
    
    switch (stockFilter) {
      case 'bajo': return stock < 10;
      case 'medio': return stock >= 10 && stock < 50;
      case 'alto': return stock >= 50;
      case 'sin-stock': return stock === 0;
      default: return true;
    }
  });

  // Manejar movimiento de stock (SOLO PARA AJUSTES)
  const handleRegistrarMovimiento = () => {
    if (!selectedPresentacion || !tipoMovimiento || !cantidad || !motivo.trim()) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    const tipo = tiposMovimiento.find(t => t.id_tipo_movimiento === parseInt(tipoMovimiento));
    if (!tipo) return;

    const cantidadNumerica = Number(cantidad);
    const cantidadFinal = tipo.es_entrada ? cantidadNumerica : -cantidadNumerica;

    // Crear nuevo movimiento de AJUSTE
    const nuevoMovimiento: MovimientoStock = {
      id_stock: Math.max(...movimientos.map(m => m.id_stock), 0) + 1,
      fk_presentacion_producto: selectedPresentacion.id_presentacion_producto,
      cantidad: cantidadFinal,
      fecha_movimiento: new Date(),
      fk_tipo_movimiento: parseInt(tipoMovimiento),
      tipo_nombre: tipo.descripcion,
      motivo: motivo.trim(),
      realizado_por: 'Usuario Actual' // <- CAMPO AÑADIDO (puedes cambiar por el usuario real)
    };

    // Actualizar movimientos
    setMovimientos([...movimientos, nuevoMovimiento]);

    // Actualizar stock actual en la presentación (SOLO PARA AJUSTES)
    setPresentaciones(presentaciones.map(pres =>
      pres.id_presentacion_producto === selectedPresentacion.id_presentacion_producto
        ? { ...pres, stock_actual: (pres.stock_actual || 0) + cantidadFinal }
        : pres
    ));

    // Cerrar modal y resetear formulario
    closeMovimientoModal();
    resetMovimientoForm();
  };

  const resetMovimientoForm = () => {
    setTipoMovimiento(null);
    setCantidad(0);
    setMotivo('');
    setSelectedPresentacion(null);
  };

  const handleAbrirMovimientoModal = (presentacion: PresentacionProducto) => {
    setSelectedPresentacion(presentacion);
    openMovimientoModal();
  };

  const handleVerHistorial = (presentacion: PresentacionProducto) => {
    setSelectedPresentacion(presentacion);
    openHistorialModal();
  };

  // Obtener movimientos de una presentación específica
  const getMovimientosByPresentacion = (presentacionId: number) => {
    return movimientos
      .filter(mov => mov.fk_presentacion_producto === presentacionId)
      .sort((a, b) => new Date(b.fecha_movimiento).getTime() - new Date(a.fecha_movimiento).getTime());
  };

  // Calcular stock acumulado para el historial
  const calcularStockAcumulado = (movimientos: MovimientoStock[]) => {
    let acumulado = 0;
    return movimientos.map(mov => {
      acumulado += mov.cantidad;
      return { ...mov, stock_acumulado: acumulado };
    });
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'red', label: 'Sin Stock' };
    if (stock < 10) return { color: 'orange', label: 'Bajo' };
    if (stock < 50) return { color: 'yellow', label: 'Medio' };
    return { color: 'green', label: 'Alto' };
  };

  const getMovimientoIcon = (cantidad: number) => {
    return cantidad > 0 ? <IconArrowUp size={16} color="green" /> : <IconArrowDown size={16} color="red" />;
  };

  // Tabla de inventario
  const inventarioRows = filteredPresentaciones.map((presentacion) => {
    const stockStatus = getStockStatus(presentacion.stock_actual || 0);
    
    return (
      <Table.Tr key={presentacion.id_presentacion_producto}>
        <Table.Td>
          <Text>{presentacion.sku}</Text>
        </Table.Td>
        <Table.Td>
          <Text>{presentacion.producto_nombre}</Text>
        </Table.Td>
        <Table.Td>
          <Badge variant="light">{presentacion.unidad_nombre}</Badge>
        </Table.Td>
        <Table.Td style={{ textAlign: 'right' }}>
          <Text>${presentacion.precio_venta.toFixed(2)}</Text>
        </Table.Td>
        <Table.Td style={{ textAlign: 'center' }}>
          <Text>{presentacion.stock_actual}</Text>
        </Table.Td>
        <Table.Td style={{ textAlign: 'center' }}>
          <Badge color={stockStatus.color}>
            {stockStatus.label}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Group gap="xs" justify="center">
            <Tooltip label="Corrección de Inventario" position="bottom" withArrow>
              <ActionIcon
                variant="light"
                color="orange"
                onClick={() => handleAbrirMovimientoModal(presentacion)}
                size="sm"
              >
                <IconAdjustments size="1rem" />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Ver Historial de Movimientos" position="bottom" withArrow>
              <ActionIcon
                variant="light"
                color="blue"
                onClick={() => handleVerHistorial(presentacion)}
                size="sm"
              >
                <IconHistory size="1rem" />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Container size="xl">
      {/* CABECERA */}
      <Paper withBorder p="md" mb="md" shadow="xs" style={{ flexShrink: 0 }}>
        <Group justify="space-between">
          <div>
            <Title order={3}>Gestión de Inventario</Title>
            <Text c="dimmed" size="sm">Control de stock y ajustes de inventario</Text>
          </div>
        </Group>
      </Paper>

      {/* FILTROS */}
      <Paper withBorder p="md" mb="md" shadow="xs">
        <Group align="flex-end" gap="xs">
          <TextInput
            placeholder="Buscar por SKU o nombre..."
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 2 }}
            size="md"
          />
          
          <Select
            placeholder="Estado de Stock"
            data={[
              { value: 'bajo', label: 'Stock Bajo (<10)' },
              { value: 'medio', label: 'Stock Medio (10-50)' },
              { value: 'alto', label: 'Stock Alto (>50)' },
              { value: 'sin-stock', label: 'Sin Stock' },
            ]}
            value={stockFilter}
            onChange={setStockFilter}
            clearable
            style={{ flex: 1 }}
            size="md"
          />
          
          <Button 
            variant="subtle" 
            onClick={() => {
              setSearchTerm('');
              setStockFilter(null);
            }}
            size="md"
          >
            Limpiar
          </Button>
        </Group>
      </Paper>

      {/* TABLA DE INVENTARIO */}
      <Paper withBorder p="md" shadow="xs" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
        <Title order={4} mb="md" style={{ flexShrink: 0 }}>Inventario de Productos</Title>
        <Box style={{ flexGrow: 1, overflowY: 'auto' }}>
          <Table striped withColumnBorders withRowBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>SKU</Table.Th>
                <Table.Th>Producto</Table.Th>
                <Table.Th>Unidad</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>Precio Venta</Table.Th>
                <Table.Th style={{ textAlign: 'center' }}>Stock Actual</Table.Th>
                <Table.Th style={{ textAlign: 'center' }}>Estado</Table.Th>
                <Table.Th style={{ textAlign: 'center' }}>Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {inventarioRows.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7} style={{ textAlign: 'center' }}>
                    <Text c="dimmed" py="xl">
                      No se encontraron productos con los filtros aplicados
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                inventarioRows
              )}
            </Table.Tbody>
          </Table>
        </Box>
      </Paper>

      {/* Modal para Corrección de Inventario */}
      <Modal
        opened={movimientoModalOpened}
        onClose={closeMovimientoModal}
        title={<Title order={4}>Corrección de Inventario</Title>}
        size="md"
        centered
      >
        {selectedPresentacion && (
          <Stack gap="md">
            <Text fw={500}>Producto: <Text span>{selectedPresentacion.producto_nombre}</Text></Text>
            <Text fw={500}>SKU: <Text span>{selectedPresentacion.sku}</Text></Text>
            <Text fw={500}>Stock Actual: <Text span>{selectedPresentacion.stock_actual}</Text></Text>
            
            <Select
              label="Tipo de Corrección"
              placeholder="Seleccione tipo"
              data={tiposMovimiento.map(tipo => ({
                value: tipo.id_tipo_movimiento.toString(),
                label: `${tipo.descripcion} (${tipo.es_entrada ? 'Entrada' : 'Salida'})`
              }))}
              value={tipoMovimiento}
              onChange={setTipoMovimiento}
              required
              size="md"
            />
            
            <NumberInput
              label="Cantidad"
              value={cantidad}
              onChange={setCantidad}
              placeholder="0"
              min={0.01}
              step={1}
              required
              size="md"
            />
            
            <Textarea
              label="Motivo de la Corrección"
              value={motivo}
              onChange={(event) => setMotivo(event.currentTarget.value)}
              placeholder="Describa el motivo de la corrección de inventario"
              required
              size="md"
            />
            
            <Group justify="flex-end" gap="xs">
              <Button variant="subtle" onClick={closeMovimientoModal} size="md">
                Cancelar
              </Button>
              <Button 
                onClick={handleRegistrarMovimiento} 
                disabled={!tipoMovimiento || !cantidad || !motivo.trim()}
                size="md"
                color="orange"
              >
                Registrar Corrección
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Modal para Historial de Movimientos */}
      <Modal
        opened={historialModalOpened}
        onClose={closeHistorialModal}
        title={
          <Title order={4}>
            {`Historial de Movimientos: ${selectedPresentacion?.sku}`}
          </Title>
        }
        size="lg"
        centered
      >
        {selectedPresentacion && (
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500}>Producto: <Text span>{selectedPresentacion.producto_nombre}</Text></Text>
              <Text fw={500}>Stock Actual: <Text span>{selectedPresentacion.stock_actual}</Text></Text>
            </Group>
            
            {getMovimientosByPresentacion(selectedPresentacion.id_presentacion_producto).length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                No hay movimientos para esta presentación
              </Text>
            ) : (
              <Box style={{ height: '400px', overflowY: 'auto' }}>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Fecha</Table.Th>
                      <Table.Th>Tipo</Table.Th>
                      <Table.Th>Motivo</Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>Cantidad</Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>Saldo</Table.Th>
                      <Table.Th>Realizado por</Table.Th> {/* <- NUEVA COLUMNA AÑADIDA */}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {calcularStockAcumulado(getMovimientosByPresentacion(selectedPresentacion.id_presentacion_producto))
                      .map((movimiento, index) => (
                      <Table.Tr key={movimiento.id_stock}>
                        <Table.Td>
                          <Text size="sm">
                            {movimiento.fecha_movimiento.toLocaleDateString()}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            {getMovimientoIcon(movimiento.cantidad)}
                            <Badge variant="light" color={movimiento.cantidad > 0 ? 'green' : 'red'}>
                              {movimiento.tipo_nombre}
                            </Badge>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" lineClamp={1}>
                            {movimiento.motivo || '-'}
                          </Text>
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          <Text color={movimiento.cantidad > 0 ? 'green' : 'red'} fw={500}>
                            {movimiento.cantidad > 0 ? '+' : ''}{movimiento.cantidad}
                          </Text>
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          <Text>
                            {movimiento.stock_acumulado}
                          </Text>
                        </Table.Td>
                        <Table.Td> {/* <- NUEVA CELDA AÑADIDA */}
                          <Text size="sm">
                            {movimiento.realizado_por || 'Sistema'}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Box>
            )}
          </Stack>
        )}
      </Modal>
    </Container>
  );
}