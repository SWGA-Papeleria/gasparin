// src/pages/Purchases.tsx
import { useState, useEffect } from 'react';
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
  Menu,
  Loader,
  Grid,
  Alert,
  Center,
} from '@mantine/core';
import { 
  IconPlus, 
  IconSearch, 
  IconEye,
  IconEdit,
  IconPrinter,
  IconDotsVertical,
  IconTrash,
  IconCheck,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useAuthContext } from '../context/AuthContext';
import { notifications } from '@mantine/notifications';

// Componentes y hooks
import { PurchaseDetailsModal } from '../components/purchases/PurchaseDetailsModal';
import { PurchaseValidationModal } from '../components/purchases/PurchaseValidationModal';
import { usePurchases } from '../hooks/usePurchases';
import type { Compra, ProductoCompra } from '../types/purchases.types';

export default function Purchases() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  
  // Hooks personalizados
  const {
    compras,
    proveedores,
    loading,
    searchTerm,
    setSearchTerm,
    filtrosAplicados,
    handleAplicarFiltros,
    handleLimpiarFiltros,
    handleDeleteCompra,
    handleValidateCompra,
    getEstadoColor,
    getEstadoText,
    formatFecha,
  } = usePurchases();

  // Estados locales de UI
  const [searchInput, setSearchInput] = useState('');
  const [providerFilter, setProviderFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const [printingPurchaseId, setPrintingPurchaseId] = useState<number | null>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<Compra | null>(null);
  const [productosValidacion, setProductosValidacion] = useState<ProductoCompra[]>([]);
  
  // Modales
  const [detailModal, { open: openDetailModal, close: closeDetailModal }] = useDisclosure(false);
  const [deleteModal, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [validateModal, { open: openValidateModal, close: closeValidateModal }] = useDisclosure(false);

  // Filtrado de compras
  const filteredCompras = compras.filter(compra => {
    // Si no se han aplicado filtros, mostrar todas
    if (!filtrosAplicados) return true;
    
    // Filtrar por término de búsqueda
    const matchesSearch = searchTerm === '' || 
      compra.proveedor_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      compra.id_compra.toString().includes(searchTerm);
    
    // Aplicar filtros adicionales
    const matchesProvider = !providerFilter || compra.fk_proveedor.toString() === providerFilter;
    const matchesDate = !dateFilter || compra.fecha_compra === dateFilter;
    const matchesStatus = !statusFilter || compra.estado === statusFilter;
    
    return matchesSearch && matchesProvider && matchesDate && matchesStatus;
  });

  // Handlers
  const handleBuscar = () => {
    if (!searchInput.trim()) return; 
    setSearchTerm(searchInput);
    handleAplicarFiltros();
  };

  const handleLimpiarFiltrosLocal = () => {
    setSearchInput('');
    setSearchTerm('');
    setProviderFilter(null);
    setDateFilter(null);
    setStatusFilter(null);
    handleLimpiarFiltros();
  };

  const handleViewDetails = (compra: Compra) => {
    setSelectedPurchase(compra);
    openDetailModal();
  };

  const handleEditPurchase = (compra: Compra) => {
    navigate(`/dashboard/compras/editar/${compra.id_compra}`);
  };

  const handleDelete = (compra: Compra) => {
    setSelectedPurchase(compra);
    openDeleteModal();
  };

  const handleValidate = (compra: Compra) => {
    setSelectedPurchase(compra);
    
    const productosParaValidar = compra.productos?.map(producto => ({
      ...producto,
      cantidad_recibida: producto.demanda,
      costo_unitario: 0,
      subtotal: 0
    })) || [];
    
    setProductosValidacion(productosParaValidar);
    openValidateModal();
  };

  const confirmDelete = async () => {
    if (selectedPurchase) {
      const success = await handleDeleteCompra(selectedPurchase.id_compra);
      
      if (success) {
        notifications.show({
          title: 'Compra eliminada',
          message: `La compra C-${selectedPurchase.id_compra.toString().padStart(3, '0')} se ha eliminado exitosamente`,
          color: 'green',
        });
      }
      
      closeDeleteModal();
    }
  };

  const handleActualizarProductoValidacion = (index: number, campo: keyof ProductoCompra, valor: any) => {
    const nuevosProductos = [...productosValidacion];
    nuevosProductos[index] = {
      ...nuevosProductos[index],
      [campo]: valor
    };

    if (campo === 'cantidad_recibida' || campo === 'costo_unitario') {
      const cantidad = campo === 'cantidad_recibida' ? valor : nuevosProductos[index].cantidad_recibida || 0;
      const costo = campo === 'costo_unitario' ? valor : nuevosProductos[index].costo_unitario || 0;
      nuevosProductos[index].subtotal = cantidad * costo;
    }

    setProductosValidacion(nuevosProductos);
  };

  const confirmValidate = async () => {
    if (selectedPurchase) {
      try {
        await handleValidateCompra(selectedPurchase.id_compra, productosValidacion);
        
        notifications.show({
          title: 'Compra validada',
          message: `La compra C-${selectedPurchase.id_compra.toString().padStart(3, '0')} se ha validado exitosamente`,
          color: 'green',
        });
        
        closeValidateModal();
      } catch (error) {
        console.error('Error validando compra:', error);
      }
    }
  };

  const handlePrint = async (compra: Compra, tipo: 'demanda' | 'validado') => {
    setPrintingPurchaseId(compra.id_compra);
    
    // Simular generación de PDF
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (tipo === 'demanda') {
      console.log(`Generando PDF de LISTA DE COMPRA para compra C-${compra.id_compra.toString().padStart(3, '0')}`);
    } else {
      console.log(`Generando PDF de COMPRA VALIDADA para compra C-${compra.id_compra.toString().padStart(3, '0')}`);
    }
    
    notifications.show({
      title: 'PDF generado',
      message: `El PDF de ${tipo === 'demanda' ? 'lista de compra' : 'compra validada'} para compra C-${compra.id_compra.toString().padStart(3, '0')} se ha generado exitosamente`,
      color: 'green',
    });
    
    setPrintingPurchaseId(null);
  };

  // Renderizado de filas de la tabla con loader
  const renderTableRows = () => {
    if (loading.filtros || loading.compras) {
      return (
        <Table.Tr>
          <Table.Td colSpan={8} style={{ textAlign: 'center' }}>
            <Center py="xl">
              <Stack align="center" gap="md">
                <Loader size="lg" />
                <Text c="dimmed">
                  {loading.filtros ? 'Aplicando filtros...' : 'Cargando compras...'}
                </Text>
              </Stack>
            </Center>
          </Table.Td>
        </Table.Tr>
      );
    }

    if (filteredCompras.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={8} style={{ textAlign: 'center' }}>
            <Text c="dimmed" py="xl">
              {filtrosAplicados 
                ? "No se encontraron compras con los filtros aplicados" 
                : "No hay compras registradas"}
            </Text>
          </Table.Td>
        </Table.Tr>
      );
    }

    return filteredCompras.map((compra) => (
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
        <Table.Td>
          <Badge variant="light" color={getEstadoColor(compra.estado)}>
            {getEstadoText(compra.estado)}
          </Badge>
        </Table.Td>
        <Table.Td style={{ textAlign: 'right' }}>
          <Text>${compra.costo_total?.toFixed(2) || '0.00'}</Text>
        </Table.Td>
        <Table.Td>
          <Group gap="xs" justify="center">
            <Tooltip label="Ver detalles" position="bottom" withArrow>
              <ActionIcon 
                variant="light" 
                color="blue" 
                onClick={() => handleViewDetails(compra)}
                size="sm"
              >
                <IconEye size="1rem" />
              </ActionIcon>
            </Tooltip>

            {compra.estado === 'pendiente' && (
              <>
                <Tooltip label="Editar compra" position="bottom" withArrow>
                  <ActionIcon 
                    variant="light" 
                    color="orange" 
                    onClick={() => handleEditPurchase(compra)}
                    size="sm"
                  >
                    <IconEdit size="1rem" />
                  </ActionIcon>
                </Tooltip>

                <Menu position="bottom-end">
                  <Menu.Target>
                    <Tooltip label="Más opciones" position="bottom" withArrow>
                      <ActionIcon variant="light" size="sm">
                        <IconDotsVertical size="1rem" />
                      </ActionIcon>
                    </Tooltip>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconCheck size="1rem" />}
                      onClick={() => handleValidate(compra)}
                    >
                      Validar Compra
                    </Menu.Item>
                    <Menu.Divider />
                    
                    <Menu.Item
                      leftSection={
                        printingPurchaseId === compra.id_compra ? 
                          <Loader size="1rem" /> : 
                          <IconPrinter size="1rem" />
                      }
                      onClick={() => handlePrint(compra, 'demanda')}
                      disabled={printingPurchaseId === compra.id_compra}
                    >
                      {printingPurchaseId === compra.id_compra ? 'Generando...' : 'Imprimir'}
                    </Menu.Item>
                    <Menu.Divider />
                    
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size="1rem" />}
                      onClick={() => handleDelete(compra)}
                    >
                      Eliminar
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </>
            )}

            {compra.estado === 'validado' && (
              <Tooltip label="Imprimir" position="bottom" withArrow>
                <ActionIcon 
                  variant="light" 
                  color="green" 
                  onClick={() => handlePrint(compra, 'validado')}
                  size="sm"
                  loading={printingPurchaseId === compra.id_compra}
                >
                  {printingPurchaseId === compra.id_compra ? (
                    <Loader size="1rem" />
                  ) : (
                    <IconPrinter size="1rem" />
                  )}
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Table.Td>
      </Table.Tr>
    ));
  };

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
              size='md'
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
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ flex: 2 }}
              size="md"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchInput.trim()) { 
                  handleBuscar();
                }
              }}
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

            <Select
              placeholder="Estado"
              data={[
                { value: 'pendiente', label: 'Pendiente' },
                { value: 'validado', label: 'Validado' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              clearable
              style={{ flex: 1 }}
              size="md"
            />
            
            <Button 
              variant="subtle" 
              onClick={handleLimpiarFiltrosLocal}
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

        {/* Tabla de Compras */}
        <Paper withBorder p="md" shadow="xs" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
          <Group justify="space-between" mb="md" style={{ flexShrink: 0 }}>
            <Title order={4}>Historial de Compras</Title>
          </Group>

          <Box style={{ flexGrow: 1, overflow: 'auto', position: 'relative' }}>
            <ScrollArea>
              <Table striped withColumnBorders withRowBorders verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Folio</Table.Th>
                    <Table.Th>Fecha</Table.Th>
                    <Table.Th>Proveedor</Table.Th>
                    <Table.Th>Responsable</Table.Th>
                    <Table.Th>Productos</Table.Th>
                    <Table.Th>Estado</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Total</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {renderTableRows()}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Box>
        </Paper>

        {/* Modal de Detalles */}
        <PurchaseDetailsModal
          opened={detailModal}
          onClose={closeDetailModal}
          purchase={selectedPurchase}
          formatFecha={formatFecha}
        />

        {/* Modal de Eliminación */}
        <Modal
          opened={deleteModal}
          onClose={closeDeleteModal}
          title={<Title order={4}>Confirmar Eliminación</Title>}
          size="md"
          centered
        >
          <Stack gap="md">
            <Alert icon={<IconAlertCircle size="1rem" />} title="¿Estás seguro?" color="red">
              Esta acción no se puede deshacer. 
              ¿Deseas continuar?
            </Alert>
            <Group justify="flex-end">
              <Button variant="subtle" onClick={closeDeleteModal}>
                Cancelar
              </Button>
              <Button 
                color="red" 
                onClick={confirmDelete}
              >
                Sí, Eliminar
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* Modal de Validación */}
        <PurchaseValidationModal
          opened={validateModal}
          onClose={closeValidateModal}
          productosValidacion={productosValidacion}
          onUpdateProducto={handleActualizarProductoValidacion}
          onValidate={confirmValidate}
        />
      </Stack>
    </Container>
  );
}