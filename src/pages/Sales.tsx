// src/pages/Sales.tsx
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
  Container,
  Select,
  Badge,
  Stack,
  Box,
  Tooltip,
  ScrollArea,
  Center,
  Loader,
} from '@mantine/core';
import { 
  IconSearch, 
  IconEdit, 
  IconEye,
  IconPrinter,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useAuthContext } from '../context/AuthContext';

import { useSales } from '../hooks/useSales';
import SalesDetailModal from '../components/sales/SaleDetailsModal';
import SalesStatusModal from '../components/sales/SaleStatusModal';

export default function Sales() {
  const { user } = useAuthContext();
  const {
    // Estado
    estadosVenta,
    metodosPago,
    isLoading,
    isRefreshing,
    searchInput,
    filtrosAplicados,
    paymentFilter,
    statusFilter,
    dateFilter,
    filteredVentas,
    
    // Setters
    setSearchInput,
    setPaymentFilter,
    setStatusFilter,
    setDateFilter,
    
    // Funciones
    handleBuscar,
    handleLimpiar,
    handleUpdateVenta,
    handlePrint,
    getStatusColor,
    formatFecha,
    isPrinting
  } = useSales();

  // Modales
  const [detailModal, { open: openDetailModal, close: closeDetailModal }] = useDisclosure(false);
  const [statusModal, { open: openStatusModal, close: closeStatusModal }] = useDisclosure(false);
  
  const [selectedSale, setSelectedSale] = useState<any>(null);

  const handleViewDetails = (venta: any) => {
    setSelectedSale(venta);
    openDetailModal();
  };

  const handleChangeStatus = (venta: any) => {
    setSelectedSale(venta);
    openStatusModal();
  };

  const handleUpdateStatus = async (
    venta: any,
    nuevoEstado: string,
    motivoDevolucion?: string,
    motivoCancelacion?: string,
    productosDevolucion?: any[]
  ) => {
    const ventaActualizada = { ...venta, fk_estado_venta: Number(nuevoEstado) };
    
    if (nuevoEstado === '3' && motivoDevolucion && productosDevolucion) {
      // Lógica para devolución
      const totalDevolucion = productosDevolucion.reduce((total, producto) => {
        if (producto.devolver && producto.cantidadDevolver && producto.cantidadDevolver > 0) {
          const subtotalDevolver = (producto.cantidadDevolver / producto.cantidad) * producto.subtotal;
          return total + subtotalDevolver;
        }
        return total;
      }, 0);
      
      ventaActualizada.total = venta.total - totalDevolucion;
    }
    
    const success = await handleUpdateVenta(ventaActualizada);
    
    if (success) {
      // Mostrar notificación según el estado
      const estadoNombre = estadosVenta.find(e => e.id_estado_venta === Number(nuevoEstado))?.descripcion;
      
      // Aquí irían las notificaciones
      return true;
    }
    
    return false;
  };

  // Determinar si se debe mostrar el loader
  const showLoader = isLoading || isRefreshing;

  // Preparar las filas de la tabla
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
            <ActionIcon 
              variant="light" 
              color="green" 
              onClick={() => handlePrint(venta)}
              size="sm"
              loading={isPrinting(venta.id_venta)}
              disabled={isPrinting(venta.id_venta)}
            >
              {isPrinting(venta.id_venta) ? (
                <Loader size="sm" color="green" />
              ) : (
                <IconPrinter size="1rem" />
              )}
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

        {/* Filtros con botón de búsqueda */}
        <Paper withBorder p="md" shadow="xs">
          <Group align="flex-end" gap="xs">
            <TextInput
              placeholder="Buscar por folio o cliente..."
              leftSection={<IconSearch size={16} />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ flex: 2 }}
              size="md"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleBuscar();
                }
              }}
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
              onClick={handleLimpiar}
              size="md"
            >
              Limpiar
            </Button>
            <Button 
              onClick={handleBuscar}
              size="md"
            >
              Buscar
            </Button>
          </Group>
        </Paper>

        {/* Tabla */}
        <Paper withBorder p="md" shadow="xs" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
          <Title order={4} mb="md" style={{ flexShrink: 0 }}>Historial de Ventas</Title>

          <Box style={{ flexGrow: 1, overflow: 'auto' }}>
            {showLoader ? (
              <Center style={{ height: '50%' }}>
                <Stack align="center" gap="md">
                  <Loader size="lg" />
                  <Text c="dimmed">
                    {isRefreshing ? "Cargando datos..." : "Cargando ventas..."}
                  </Text>
                </Stack>
              </Center>
            ) : (
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
                            {filtrosAplicados 
                              ? "No se encontraron ventas con los filtros aplicados" 
                              : "No hay ventas registradas"}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    )}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            )}
          </Box>
        </Paper>

        {/* Modales */}
        <SalesDetailModal
          opened={detailModal}
          onClose={closeDetailModal}
          selectedSale={selectedSale}
          getStatusColor={getStatusColor}
          formatFecha={formatFecha}
        />

        <SalesStatusModal
          opened={statusModal}
          onClose={closeStatusModal}
          selectedSale={selectedSale}
          estadosVenta={estadosVenta}
          user={user}
          onUpdateStatus={handleUpdateStatus}
        />
      </Stack>
    </Container>
  );
}