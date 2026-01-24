// components/sales/SalesDetailModal.tsx
import {
  Modal,
  Stack,
  Paper,
  Group,
  Badge,
  Text,
  Table,
  Title,
} from '@mantine/core';
import {
  IconReceipt,
  IconCalendar,
  IconUser,
  IconCash,
  IconClock,
} from '@tabler/icons-react';
import type { Venta } from '../../types/sales.types';

interface SalesDetailModalProps {
  opened: boolean;
  onClose: () => void;
  selectedSale: Venta | null;
  getStatusColor: (estado: string) => string;
  formatFecha: (fecha: string) => string;
}

export default function SalesDetailModal({
  opened,
  onClose,
  selectedSale,
  getStatusColor,
  formatFecha,
}: SalesDetailModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
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
  );
}