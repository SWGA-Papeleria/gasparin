// src/pages/view/Purchases.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Badge,
  Stack,
  Box,
  Tooltip,
  ScrollArea,
} from '@mantine/core';
import { 
  IconPlus, 
  IconSearch, 
  IconEye,
  IconDownload,
  IconCalendar,
  IconUser,
  IconBuildingStore,
  IconPackage,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '../../context/AuthContext';

// Interfaces basadas en el diagrama ER
interface Proveedor {
  id_proveedor: number;
  nombre: string;
  contacto: string;
  telefono?: string;
  correo?: string;
}

interface ProductoCompra {
  id_compra_producto?: number;
  fk_presentacion_producto: number;
  cantidad: number;
  costo_unitario: number;
  subtotal: number;
  producto_nombre?: string;
  sku?: string;
  unidad_medida?: string;
}

interface Compra {
  id_compra: number;
  fk_proveedor: number;
  fk_usuario: number;
  fecha_compra: string;
  costo_total: number;
  created_at: string;
  updated_at: string;
  proveedor_nombre?: string;
  usuario_nombre?: string;
  productos?: ProductoCompra[];
}

export default function Purchases() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  
  const [detailModal, { open: openDetailModal, close: closeDetailModal }] = useDisclosure(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Compra | null>(null);

  // Datos de prueba
  const [proveedores] = useState<Proveedor[]>([
    { id_proveedor: 1, nombre: 'Distribuidora Papelera SA', contacto: 'Juan Rodríguez', telefono: '555-1001', correo: 'juan@distpapel.com' },
    { id_proveedor: 2, nombre: 'Suministros Oficina MX', contacto: 'María Sánchez', telefono: '555-1002', correo: 'maria@suministros.com' },
    { id_proveedor: 3, nombre: 'Materiales Escolares Premium', contacto: 'Carlos Mendoza', telefono: '555-1003', correo: 'carlos@materiales.com' }
  ]);

  const [compras, setCompras] = useState<Compra[]>([
    {
      id_compra: 1,
      fk_proveedor: 1,
      fk_usuario: 1,
      fecha_compra: '2024-01-10',
      costo_total: 1250.00,
      created_at: '2024-01-10',
      updated_at: '2024-01-10',
      proveedor_nombre: 'Distribuidora Papelera SA',
      usuario_nombre: 'Ana García',
      productos: [
        {
          id_compra_producto: 1,
          fk_presentacion_producto: 1,
          cantidad: 50,
          costo_unitario: 18.00,
          subtotal: 900.00,
          producto_nombre: 'Bolígrafo BIC Azul',
          sku: 'BOL-BIC-AZUL',
          unidad_medida: 'Pieza'
        },
        {
          id_compra_producto: 2,
          fk_presentacion_producto: 3,
          cantidad: 10,
          costo_unitario: 35.00,
          subtotal: 350.00,
          producto_nombre: 'Cuaderno Profesional',
          sku: 'CUA-PROF-100H',
          unidad_medida: 'Pieza'
        }
      ]
    },
    {
      id_compra: 2,
      fk_proveedor: 2,
      fk_usuario: 2,
      fecha_compra: '2024-01-12',
      costo_total: 480.50,
      created_at: '2024-01-12',
      updated_at: '2024-01-12',
      proveedor_nombre: 'Suministros Oficina MX',
      usuario_nombre: 'Carlos López',
      productos: [
        {
          id_compra_producto: 3,
          fk_presentacion_producto: 2,
          cantidad: 80,
          costo_unitario: 4.50,
          subtotal: 360.00,
          producto_nombre: 'Bolígrafo BIC Negro',
          sku: 'BOL-BIC-NEGRO',
          unidad_medida: 'Pieza'
        },
        {
          id_compra_producto: 4,
          fk_presentacion_producto: 4,
          cantidad: 5,
          costo_unitario: 24.10,
          subtotal: 120.50,
          producto_nombre: 'Resma Papel A4',
          sku: 'RESMA-A4-500',
          unidad_medida: 'Caja'
        }
      ]
    }
  ]);

  // Filtrar compras
  const filteredCompras = compras.filter(compra =>
    compra.proveedor_nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    compra.id_compra.toString().includes(searchQuery)
  ).filter(compra => {
    const matchesProvider = !providerFilter || compra.fk_proveedor.toString() === providerFilter;
    const matchesDate = !dateFilter || compra.fecha_compra === dateFilter;
    return matchesProvider && matchesDate;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setProviderFilter(null);
    setDateFilter(null);
  };

  const handleViewDetails = (compra: Compra) => {
    setSelectedPurchase(compra);
    openDetailModal();
  };

  const getProviderColor = (id: number) => {
    const colors = ['blue', 'green', 'orange', 'red', 'violet'];
    return colors[id % colors.length];
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const rows = filteredCompras.map((compra) => (
    <Table.Tr key={compra.id_compra}>
      <Table.Td>
        <Text>C-{compra.id_compra.toString().padStart(3, '0')}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          {formatFecha(compra.fecha_compra)}
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Text>{compra.proveedor_nombre}</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          {compra.usuario_nombre}
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge variant="light" color="blue">
          {compra.productos?.length || 0} productos
        </Badge>
      </Table.Td>
      <Table.Td style={{ textAlign: 'right' }}>
        <Text>${compra.costo_total.toFixed(2)}</Text>
      </Table.Td>
      <Table.Td style={{ textAlign: 'center' }}>
        <Group gap='xs' justify="center">
          <Tooltip label="Ver detalles" position="bottom" withArrow>
            <ActionIcon variant="light" color="blue" onClick={() => handleViewDetails(compra)} size="sm">
              <IconEye size="1rem" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Descargar PDF" position="bottom" withArrow>
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
              <Title order={3}>Compras a Proveedores</Title>
              <Text c="dimmed" size="sm">Gestión de compras e inventario</Text>
            </div>
            <Button 
              leftSection={<IconPlus size="1rem" />}
              onClick={() => navigate('nueva')}
            >
              Nueva Compra
            </Button>
          </Group>
        </Paper>

        {/* Filtros */}
        <Paper withBorder p="md" shadow="xs">
          <Group align="flex-end" gap="xs">
            <TextInput
              placeholder="Buscar por proveedor o ID..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 2 }}
              size="md"
            />
            
            <Select
              placeholder="Proveedor"
              data={proveedores.map(prov => ({
                value: prov.id_proveedor.toString(),
                label: prov.nombre
              }))}
              value={providerFilter}
              onChange={setProviderFilter}
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
            <Title order={4}>Historial de Compras</Title>
            <Text c="dimmed" size="sm">
              {filteredCompras.length} de {compras.length} compras
            </Text>
          </Group>

          <Box style={{ flexGrow: 1, overflow: 'auto' }}>
            <ScrollArea>
              <Table striped withColumnBorders withRowBorders verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Folio</Table.Th>
                    <Table.Th>Fecha</Table.Th>
                    <Table.Th>Proveedor</Table.Th>
                    <Table.Th>Responsable</Table.Th>
                    <Table.Th>Productos</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Total</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {rows.length > 0 ? rows : (
                    <Table.Tr>
                      <Table.Td colSpan={7} style={{ textAlign: 'center' }}>
                        <Text c="dimmed" py="xl">
                          No se encontraron compras con los filtros aplicados
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Box>
        </Paper>

        {/* Modal Detalles Compra */}
        <Modal
          opened={detailModal}
          onClose={closeDetailModal}
          title={<Title order={4}>Detalles de Compra C-{selectedPurchase?.id_compra.toString().padStart(3, '0')}</Title>}
          size="lg"
          centered
        >
          {selectedPurchase && (
            <Stack gap="md">
              {/* Información General */}
              <Paper withBorder p="md">
                <Group justify="space-between">
                  <Stack gap="xs">
                    <Group>
                      <IconPackage size="1.2rem" />
                      <Text fw={600}>Información de Compra</Text>
                    </Group>
                    <Group>
                      <Badge variant="light" color={getProviderColor(selectedPurchase.fk_proveedor)} size="lg">
                        {selectedPurchase.proveedor_nombre}
                      </Badge>
                    </Group>
                  </Stack>
                  <Stack gap="xs" align="flex-end">
                    <Text fw={700} size="xl">${selectedPurchase.costo_total.toFixed(2)}</Text>
                    <Text size="sm" c="dimmed">Total Compra</Text>
                  </Stack>
                </Group>
              </Paper>

              {/* Detalles de la Compra */}
              <Paper withBorder p="md">
                <Stack gap="md">
                  <Group justify="space-between">
                    <Stack gap="xs">
                      <Group>
                        <IconCalendar size="1rem" />
                        <Text fw={500}>Fecha:</Text>
                        <Text>{formatFecha(selectedPurchase.fecha_compra)}</Text>
                      </Group>
                      <Group>
                        <IconBuildingStore size="1rem" />
                        <Text fw={500}>Proveedor:</Text>
                        <Text>{selectedPurchase.proveedor_nombre}</Text>
                      </Group>
                    </Stack>
                    <Stack gap="xs">
                      <Group>
                        <IconUser size="1rem" />
                        <Text fw={500}>Responsable:</Text>
                        <Text>{selectedPurchase.usuario_nombre}</Text>
                      </Group>
                      <Group>
                        <IconPackage size="1rem" />
                        <Text fw={500}>Productos:</Text>
                        <Text>{selectedPurchase.productos?.length || 0}</Text>
                      </Group>
                    </Stack>
                  </Group>
                </Stack>
              </Paper>

              {/* Productos Comprados */}
              <Paper withBorder p="md">
                <Text fw={600} mb="md">Productos Comprados</Text>
                {selectedPurchase.productos && selectedPurchase.productos.length > 0 ? (
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Producto</Table.Th>
                        <Table.Th>SKU</Table.Th>
                        <Table.Th style={{ textAlign: 'center' }}>Cantidad</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Costo Unit.</Table.Th>
                        <Table.Th style={{ textAlign: 'right' }}>Subtotal</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {selectedPurchase.productos.map((producto) => (
                        <Table.Tr key={producto.id_compra_producto}>
                          <Table.Td>
                            <Text>{producto.producto_nombre}</Text>
                            {producto.unidad_medida && (
                              <Text size="sm" c="dimmed">{producto.unidad_medida}</Text>
                            )}
                          </Table.Td>
                          <Table.Td>{producto.sku}</Table.Td>
                          <Table.Td style={{ textAlign: 'center' }}>{producto.cantidad}</Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>${producto.costo_unitario.toFixed(2)}</Table.Td>
                          <Table.Td style={{ textAlign: 'right' }}>${producto.subtotal.toFixed(2)}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                ) : (
                  <Text c="dimmed" ta="center" py="md">
                    No hay detalles disponibles para esta compra
                  </Text>
                )}
              </Paper>

              {/* Resumen */}
              <Paper withBorder p="md" bg="gray.0">
                <Group justify="space-between">
                  <Text fw={600}>Total de la Compra</Text>
                  <Text fw={700} size="lg">${selectedPurchase.costo_total.toFixed(2)}</Text>
                </Group>
              </Paper>
            </Stack>
          )}
        </Modal>
      </Stack>
    </Container>
  );
}