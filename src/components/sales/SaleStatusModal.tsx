// components/sales/SalesStatusModal.tsx
import { useState } from 'react';
import {
  Modal,
  Stack,
  Text,
  Select,
  Divider,
  Textarea,
  Paper,
  Group,
  Button,
  Badge,
  Box,
  NumberInput,
  ActionIcon,
  Tooltip,
  Alert,
} from '@mantine/core';
import {
  IconInfoCircle,
  IconShoppingCart,
  IconX,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import type { Venta, DetalleVenta, EstadoVenta } from '../../types/sales.types';

interface SalesStatusModalProps {
  opened: boolean;
  onClose: () => void;
  selectedSale: Venta | null;
  estadosVenta: EstadoVenta[];
  user: any;
  onUpdateStatus: (
    venta: Venta,
    nuevoEstado: string,
    motivoDevolucion?: string,
    motivoCancelacion?: string,
    productosDevolucion?: DetalleVenta[]
  ) => Promise<boolean>;
}

export default function SalesStatusModal({
  opened,
  onClose,
  selectedSale,
  estadosVenta,
  user,
  onUpdateStatus,
}: SalesStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [motivoDevolucion, setMotivoDevolucion] = useState('');
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [productosDevolucion, setProductosDevolucion] = useState<DetalleVenta[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProductoDevolucionChange = (index: number, field: string, value: any) => {
    const updatedProductos = [...productosDevolucion];
    
    if (field === 'devolver') {
      updatedProductos[index].devolver = value;
      if (value) {
        updatedProductos[index].cantidadDevolver = 1;
      } else {
        updatedProductos[index].cantidadDevolver = 0;
      }
    } else if (field === 'cantidadDevolver') {
      const numero = Number(value);
      
      if (!isNaN(numero) && numero >= 1 && numero <= updatedProductos[index].cantidad) {
        updatedProductos[index].cantidadDevolver = numero;
      } else if (numero > updatedProductos[index].cantidad) {
        updatedProductos[index].cantidadDevolver = updatedProductos[index].cantidad;
      } else if (numero < 1) {
        updatedProductos[index].cantidadDevolver = 1;
      }
    }
    
    setProductosDevolucion(updatedProductos);
  };

  const calcularTotalDevolucion = () => {
    return productosDevolucion.reduce((total, producto) => {
      if (producto.devolver && producto.cantidadDevolver && producto.cantidadDevolver > 0) {
        const subtotalDevolver = (producto.cantidadDevolver / producto.cantidad) * producto.subtotal;
        return total + subtotalDevolver;
      }
      return total;
    }, 0);
  };

  const handleSubmit = async () => {
    if (!selectedSale || !selectedStatus) return;

    setIsSubmitting(true);

    try {
      let success = false;
      
      if (selectedStatus === '3') {
        const productosADevolver = productosDevolucion.filter(p => p.devolver && p.cantidadDevolver && p.cantidadDevolver > 0);
        
        if (productosADevolver.length === 0) {
          notifications.show({
            title: 'Error',
            message: 'Selecciona al menos un producto para devolver',
            color: 'red',
          });
          return;
        }

        if (!motivoDevolucion.trim()) {
          notifications.show({
            title: 'Error',
            message: 'Por favor ingrese el motivo de la devolución',
            color: 'red',
          });
          return;
        }

        success = await onUpdateStatus(
          selectedSale,
          selectedStatus,
          motivoDevolucion,
          undefined,
          productosDevolucion
        );
      } else if (selectedStatus === '2') {
        if (!motivoCancelacion.trim()) {
          notifications.show({
            title: 'Error',
            message: 'Por favor ingrese el motivo de la cancelación',
            color: 'red',
          });
          return;
        }

        success = await onUpdateStatus(
          selectedSale,
          selectedStatus,
          undefined,
          motivoCancelacion
        );
      } else {
        success = await onUpdateStatus(selectedSale, selectedStatus);
      }

      if (success) {
        handleClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedStatus(null);
    setMotivoDevolucion('');
    setMotivoCancelacion('');
    setProductosDevolucion([]);
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={`Cambiar Estado - ${selectedSale?.folio_venta}`}
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
              if (value !== '3') setMotivoDevolucion('');
              if (value !== '2') setMotivoCancelacion('');
            }}
            size="md"
          />

          {selectedStatus === '3' && (
            <Stack gap="md">
              <Divider />
              <Text fw={600} c="orange">Seleccionar Productos para Devolución</Text>
              
              <Textarea
                label="Motivo de la devolución *"
                placeholder="Describa el motivo de la devolución"
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

              <Paper withBorder p="md">
                <Text fw={600} mb="md">Productos de la venta</Text>
                <Stack gap="md">
                  {(selectedSale.detalle_venta || []).map((producto, index) => (
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
                          {producto.devolver ? (
                            <ActionIcon
                              color="red"
                              variant="filled"
                              onClick={() => handleProductoDevolucionChange(index, 'devolver', !producto.devolver)}
                            >
                              <IconX size="1rem" />
                            </ActionIcon>
                          ) : (
                            <Tooltip label="Seleccionar para devolución" position="bottom" withArrow>
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

              {productosDevolucion.some(p => p.devolver && p.cantidadDevolver && p.cantidadDevolver > 0) && (
                <Paper withBorder p="md" bg="orange.0">
                  <Group justify="space-between">
                    <Text fw={600}>Total a devolver:</Text>
                    <Text fw={700} size="lg" c="orange">
                      ${calcularTotalDevolucion().toFixed(2)}
                    </Text>
                  </Group>
                </Paper>
              )}
            </Stack>
          )}

          {selectedStatus === '2' && (
            <Stack gap="md">
              <Divider />
              <Text fw={600} c="red">Información de Cancelación</Text>
              
              <Textarea
                label="Motivo de la cancelación *"
                placeholder="Describa el motivo de la cancelación"
                value={motivoCancelacion}
                onChange={(event) => setMotivoCancelacion(event.currentTarget.value)}
                rows={3}
                required
                size="md"
              />
            </Stack>
          )}

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
            <Button variant="subtle" onClick={handleClose} size="md">
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedStatus || 
                (selectedStatus === '3' && !motivoDevolucion.trim()) ||
                (selectedStatus === '2' && !motivoCancelacion.trim())
              }
              color={
                selectedStatus === '3' ? 'orange' :
                selectedStatus === '2' ? 'red' : 'blue'
              }
              loading={isSubmitting}
              size="md"
            >
              {selectedStatus === '3' ? 'Registrar Devolución' :
               selectedStatus === '2' ? 'Confirmar Cancelación' : 'Actualizar Estado'}
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}