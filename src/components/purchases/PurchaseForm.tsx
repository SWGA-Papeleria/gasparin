// src/components/purchases/PurchaseForm.tsx
import React from 'react';
import {
  Grid,
  Select,
  TextInput,
  NumberInput,
  Button,
  Group,
  Paper,
  Title,
  Text,
  Badge,
  Table,
  ActionIcon,
  Tooltip,
  Box,
  Stack,
  Loader,
} from '@mantine/core';
import { 
  IconEdit,
  IconTrash,
  IconListDetails,
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import type {
  PurchaseFormValues,
  Proveedor,
  PresentacionProducto,
  ProductoCompra
} from '../../types/purchases.types';
import LabelWithTooltip from '../common/LabelWithTooltip';

interface PurchaseFormProps {
  proveedores: Proveedor[];
  presentaciones: PresentacionProducto[];
  productosCompra: ProductoCompra[];
  modoEdicion?: boolean;
  loading?: {
    productos?: boolean;
  };
  onAddProduct: (producto: ProductoCompra) => void;
  onRemoveProduct: (index: number) => void;
  onEditProduct: (index: number) => void;
  onOpenProductList: () => void;
}

export const PurchaseForm: React.FC<PurchaseFormProps> = ({
  proveedores,
  presentaciones,
  productosCompra,
  modoEdicion = false,
  loading,
  onAddProduct,
  onRemoveProduct,
  onEditProduct,
  onOpenProductList,
}) => {
  const [productoSeleccionado, setProductoSeleccionado] = React.useState<string | null>(null);
  const [demandaProducto, setDemandaProducto] = React.useState<number>(0);

  const productoCompraForm = useForm<PurchaseFormValues>({
    initialValues: {
      producto: '',
      demanda: 0,
    },
    validate: {
      producto: (value) => {
        if (!value) {
          return 'El producto es requerido';
        }
        return null;
      },
      demanda: (value) => {
        if (value === undefined || value <= 0) {
            return 'La demanda debe ser mayor a 0';
        }
        return null;
        },
    },
  });

  const handleAgregarProducto = () => {
    const validation = productoCompraForm.validate();
    if (validation.hasErrors) {
      return;
    }

    if (!productoSeleccionado || demandaProducto <= 0) {
      return;
    }

    const producto = presentaciones.find(p => p.id_presentacion_producto === Number(productoSeleccionado));
    if (!producto) return;

    const productoExistenteIndex = productosCompra.findIndex(
      p => p.fk_presentacion_producto === Number(productoSeleccionado)
    );

    const nuevoProducto: ProductoCompra = {
      fk_presentacion_producto: Number(productoSeleccionado),
      demanda: demandaProducto,
      producto_nombre: `${producto.producto_nombre} (${producto.sku})`,
      sku: producto.sku,
      unidad_medida: producto.unidad_nombre
    };

    if (productoExistenteIndex !== -1) {
      const updatedProductos = [...productosCompra];
      updatedProductos[productoExistenteIndex] = nuevoProducto;
    } else {
      onAddProduct(nuevoProducto);
    }

    setProductoSeleccionado(null);
    setDemandaProducto(0);
    productoCompraForm.reset();
  };

  return (
    <Stack gap="md">
      {/* Selección de Productos */}
      <Paper withBorder p="md" mb="md">
        <Text fw={600} mb="md">Seleccionar Producto</Text>

        <Grid>
          {/* Producto */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Select
              label="Producto"
              placeholder="Escribe para buscar producto..."
              data={presentaciones.map(prod => ({
                value: prod.id_presentacion_producto.toString(),
                label: `${prod.producto_nombre} (${prod.sku}) - Stock: ${prod.stock_actual}`,
              }))}
              value={productoSeleccionado}
              onChange={(value) => {
                setProductoSeleccionado(value);
                productoCompraForm.setFieldValue('producto', value || '');
              }}
              searchable
              clearable
              nothingFoundMessage="No se encontraron productos..."
              size="md"
              withAsterisk
              error={undefined}
            />
          </Grid.Col>

          {/* Demanda */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <NumberInput
              label={
                <LabelWithTooltip
                  label="Demanda"
                  tooltip="Cantidad que se planea comprar"
                />
              }
              placeholder="0"
              value={demandaProducto}
              onChange={(value) => {
                const numValue = Number(value);
                setDemandaProducto(numValue);
                productoCompraForm.setFieldValue('demanda', numValue);
              }}
              min={1}
              size="md"
              withAsterisk
              error={undefined}
            />
          </Grid.Col>

          {/* Botón */}
          <Grid.Col
            span={{ base: 12, md: 3 }}
            style={{ display: 'flex', alignItems: 'flex-end' }}
          >
            <Button
              onClick={handleAgregarProducto}
              fullWidth
              size="md"
              disabled={loading?.productos}
            >
              {loading?.productos ? <Loader size="sm" /> : 'Agregar'}
            </Button>
          </Grid.Col>
        </Grid>

        {/* Errores */}
        {(productoCompraForm.errors.producto || productoCompraForm.errors.demanda) && (
          <Box mt="xs">
            {productoCompraForm.errors.producto && (
              <Text c="red" size="sm">
                {productoCompraForm.errors.producto}
              </Text>
            )}
            {productoCompraForm.errors.demanda && (
              <Text c="red" size="sm">
                {productoCompraForm.errors.demanda}
              </Text>
            )}
          </Box>
        )}

        <Group mt="md">
          <Button
            variant="light"
            leftSection={<IconListDetails size="1rem" />}
            onClick={onOpenProductList}
            size="sm"
          >
            Ver Lista Completa de Productos
          </Button>
        </Group>
      </Paper>

      {/* Lista de Productos Agregados */}
      {productosCompra.length > 0 && (
        <Paper withBorder p="md">
          <Text fw={600} mb="md">Productos en la Compra</Text>
          {loading?.productos ? (
            <Box py="xl" style={{ display: 'flex', justifyContent: 'center' }}>
              <Loader />
            </Box>
          ) : (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>SKU</Table.Th>
                  <Table.Th>Producto</Table.Th>
                  <Table.Th style={{ textAlign: 'center' }}>Demanda</Table.Th>
                  <Table.Th style={{ textAlign: 'center' }}>Unidad</Table.Th>
                  <Table.Th style={{ textAlign: 'center' }}>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {productosCompra.map((producto, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>
                      <Text>{producto.sku}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text>{producto.producto_nombre}</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Text>{producto.demanda}</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Badge variant="light">{producto.unidad_medida}</Badge>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Group gap="xs" justify="center">
                        <Tooltip label="Editar demanda">
                          <ActionIcon 
                            color="orange" 
                            variant="light"
                            onClick={() => onEditProduct(index)}
                          >
                            <IconEdit size="1rem" />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Eliminar producto">
                          <ActionIcon 
                            color="red" 
                            variant="light"
                            onClick={() => onRemoveProduct(index)}
                          >
                            <IconTrash size="1rem" />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </Paper>
      )}
    </Stack>
  );
};