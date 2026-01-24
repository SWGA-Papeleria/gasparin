// src/components/purchases/PurchaseValidationModal.tsx
import React from 'react';
import {
  Modal,
  Title,
  Stack,
  Text,
  Paper,
  Group,
  Grid,
  NumberInput,
  TextInput,
  Button,
  Box,
} from '@mantine/core';
import type { ProductoCompra } from '../../types/purchases.types';

interface PurchaseValidationModalProps {
  opened: boolean;
  onClose: () => void;
  productosValidacion: ProductoCompra[];
  onUpdateProducto: (index: number, campo: keyof ProductoCompra, valor: any) => void;
  onValidate: () => void;
}

export const PurchaseValidationModal: React.FC<PurchaseValidationModalProps> = ({
  opened,
  onClose,
  productosValidacion,
  onUpdateProducto,
  onValidate,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Title order={4}>Validar Compra - Productos Requeridos</Title>}
      size="lg"
      centered
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Ingrese la cantidad real recibida y el costo unitario de cada producto
        </Text>

        {productosValidacion.map((producto, index) => (
          <Paper key={index} withBorder p="md" bg="gray.0">
            <Group justify="space-between" mb="sm">
              <Box style={{ flex: 2 }}>
                <Text fw={500}>{producto.producto_nombre}</Text>
                <Text size="sm" c="dimmed">SKU: {producto.sku}</Text>
              </Box>
              <Text size="sm" c="blue">
                Demanda: {producto.demanda} {producto.unidad_medida}
              </Text>
            </Group>
            
            <Grid>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <NumberInput
                  label="Cantidad"
                  value={producto.cantidad_recibida || 0}
                  onChange={(value) => onUpdateProducto(index, 'cantidad_recibida', Number(value))}
                  min={0}
                  max={producto.demanda}
                  size="md"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <NumberInput
                  label="Costo Unitario"
                  value={producto.costo_unitario || 0}
                  onChange={(value) => onUpdateProducto(index, 'costo_unitario', Number(value))}
                  prefix="$"
                  min={0}
                  size="md"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="Subtotal"
                  value={`$${(producto.subtotal || 0).toFixed(2)}`}
                  readOnly
                  size="md"
                />
              </Grid.Col>
            </Grid>
          </Paper>
        ))}

        {/* Total de la compra validada */}
        <Paper withBorder p="md" bg="blue.0">
          <Group justify="space-between">
            <Text fw={700} size="lg">Total Validado:</Text>
            <Text fw={700} size="xl">
              ${productosValidacion.reduce((total, producto) => total + (producto.subtotal || 0), 0).toFixed(2)}
            </Text>
          </Group>
        </Paper>

        <Group justify="flex-end">
          <Group>
            <Button variant="subtle" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={onValidate}
              color="green"
            >
              Validar Compra
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
};