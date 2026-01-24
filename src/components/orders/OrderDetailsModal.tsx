// src/components/orders/OrderDetailsModal.tsx
import {
  Modal,
  Title,
  Stack,
  Paper,
  Grid,
  Text,
  Badge,
  Table,
  Group,
} from '@mantine/core';
import type { Pedido, DetallePedido, EstadoPedido, PrioridadPedido } from '../../types/orders.types';

interface OrderDetailsModalProps {
  opened: boolean;
  onClose: () => void;
  pedido: Pedido | null;
  detallesPedido: DetallePedido[];
  estadosPedido: EstadoPedido[];
  prioridadesPedido: PrioridadPedido[];
}

export default function OrderDetailsModal({
  opened,
  onClose,
  pedido,
  detallesPedido,
  estadosPedido,
  prioridadesPedido,
}: OrderDetailsModalProps) {
  const getEstadoColor = (estadoId: number) => {
    return estadosPedido.find(e => e.id_estado_pedido === estadoId)?.color || 'gray';
  };

  const getPrioridadColor = (prioridadId: number) => {
    return prioridadesPedido.find(p => p.id_prioridad_pedido === prioridadId)?.color || 'gray';
  };

  if (!pedido) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Title order={4}>Detalles del Pedido {pedido.folio}</Title>}
      size="lg"
      centered
    >
      <Stack gap="md">
        {/* Información del Pedido */}
        <Paper withBorder p="md">
          <Grid>
            <Grid.Col span={6}>
              <Text fw={500}>Cliente:</Text>
              <Text>{pedido.cliente_nombre}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text fw={500}>Fecha:</Text>
              <Text>{new Date(pedido.fecha_pedido).toLocaleDateString('es-MX')}</Text>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text fw={500}>Estado:</Text>
              <Badge color={getEstadoColor(pedido.fk_estado_pedido)}>
                {pedido.estado}
              </Badge>
            </Grid.Col>
            <Grid.Col span={6}>
              <Text fw={500}>Prioridad:</Text>
              <Badge color={getPrioridadColor(pedido.fk_prioridad_pedido)}>
                {pedido.prioridad}
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
              <Text fw={700}>${pedido.total.toFixed(2)}</Text>
            </Group>
          </Paper>
        </Paper>
      </Stack>
    </Modal>
  );
}