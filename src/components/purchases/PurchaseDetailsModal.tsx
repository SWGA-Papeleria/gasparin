// src/components/purchases/PurchaseDetailsModal.tsx
import React from 'react';
import {
  Modal,
  Title,
  Stack,
  Paper,
  Group,
  Text,
  Table,
  Badge,
} from '@mantine/core';
import {
  IconPackage,
  IconCalendar,
  IconBuildingStore,
  IconUser,
} from '@tabler/icons-react';
import type { Compra } from '../../types/purchases.types';

interface PurchaseDetailsModalProps {
  opened: boolean;
  onClose: () => void;
  purchase: Compra | null;
  formatFecha: (fecha: string) => string;
}

export const PurchaseDetailsModal: React.FC<PurchaseDetailsModalProps> = ({
  opened,
  onClose,
  purchase,
  formatFecha,
}) => {
  if (!purchase) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Title order={4}>Detalles de Compra C-{purchase.id_compra.toString().padStart(3, '0')}</Title>}
      size="lg"
      centered
    >
      <Stack gap="md">
        <Paper withBorder p="md">
          <Group justify="space-between">
            <Stack gap="xs">
              <Group>
                <IconPackage size="1.2rem" />
                <Text fw={600}>Información de Compra</Text>
              </Group>
              <Text>{purchase.proveedor_nombre}</Text>
            </Stack>
            <Stack gap="xs" align="flex-end">
              <Text fw={700} size="xl">${purchase.costo_total?.toFixed(2) || '0.00'}</Text>
              <Text size="sm" c="dimmed">Total Compra</Text>
            </Stack>
          </Group>
        </Paper>

        <Paper withBorder p="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Stack gap="xs">
                <Group>
                  <IconCalendar size="1rem" />
                  <Text fw={500}>Fecha Compra:</Text>
                  <Text>{formatFecha(purchase.fecha_compra)}</Text>
                </Group>
              </Stack>
              <Stack gap="xs">
                <Group>
                  <IconBuildingStore size="1rem" />
                  <Text fw={500}>Proveedor:</Text>
                  <Text>{purchase.proveedor_nombre}</Text>
                </Group>
                <Group>
                  <IconUser size="1rem" />
                  <Text fw={500}>Responsable:</Text>
                  <Text>{purchase.usuario_nombre}</Text>
                </Group>
              </Stack>
            </Group>
          </Stack>
        </Paper>

        <Paper withBorder p="md">
          <Text fw={500} mb="md">Productos de la Compra</Text>
          {purchase.productos && purchase.productos.length > 0 ? (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>SKU</Table.Th>
                  <Table.Th>Producto</Table.Th>
                  {purchase.estado === 'validado' ? (
                    <>
                      <Table.Th style={{ textAlign: 'center' }}>Cantidad</Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>Costo Unit.</Table.Th>
                      <Table.Th style={{ textAlign: 'right' }}>Subtotal</Table.Th>
                    </>
                  ) : (
                    <Table.Th style={{ textAlign: 'center' }}>Demanda</Table.Th>
                  )}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {purchase.productos.map((producto) => (
                  <Table.Tr key={producto.id_compra_producto}>
                    <Table.Td>{producto.sku}</Table.Td>
                    <Table.Td>
                      <Text>{producto.producto_nombre}</Text>
                      {producto.unidad_medida && (
                        <Text size="sm" c="dimmed">{producto.unidad_medida}</Text>
                      )}
                    </Table.Td>
                    {purchase.estado === 'validado' ? (
                      <>
                        <Table.Td style={{ textAlign: 'center' }}>
                          {producto.cantidad_recibida || 0}
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          ${producto.costo_unitario?.toFixed(2) || '0.00'}
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'right' }}>
                          ${producto.subtotal?.toFixed(2) || '0.00'}
                        </Table.Td>
                      </>
                    ) : (
                      <Table.Td style={{ textAlign: 'center' }}>
                        {producto.demanda}
                      </Table.Td>
                    )}
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
      </Stack>
    </Modal>
  );
};