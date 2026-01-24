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
  Menu,
  ScrollArea,
  Grid,
  Divider,
  Alert,
  Loader,
  Center,
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
  IconDotsVertical,
  IconTrash,
  IconEye,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';

import { useInventory } from '../hooks/useInventory';
import type {
  ProductoFormValues,
  MovimientoFormValues,
  AtributoSeleccionado,
  PresentacionProducto
} from '../types/inventory.types';

export default function Inventory() {
  const {
    // Estados del hook
    productos,
    presentaciones,
    isLoading,
    selectedPresentacion,
    searchTerm,
    marcaFilter,
    stockFilter,
    filtrosAplicados,
    tiposMovimiento,
    unidades,
    atributos,
    marcasDisponibles,
    filteredPresentaciones,
    
    // Setters del hook
    setSelectedProducto,
    setSelectedPresentacion,
    setSearchTerm,
    setMarcaFilter,
    setStockFilter,
    setFiltrosAplicados,
    
    // Funciones del hook
    handleSaveProduct,
    handleRegistrarMovimiento,
    handleDeleteProducto,
    handleDuplicarProducto,
    getMovimientosByPresentacion,
    calcularStockAcumulado,
    getStockStatus,
    handleAplicarFiltros,
    handleLimpiarFiltros,
  } = useInventory();

  // Estados locales para UI (modales)
  const [productoModalOpened, { open: openProductoModal, close: closeProductoModal }] = useDisclosure(false);
  const [movimientoModalOpened, { open: openMovimientoModal, close: closeMovimientoModal }] = useDisclosure(false);
  const [historialModalOpened, { open: openHistorialModal, close: closeHistorialModal }] = useDisclosure(false);
  const [detailModalOpened, { open: openDetailModal, close: closeDetailModal }] = useDisclosure(false);
  const [deleteConfirmModalOpened, { open: openDeleteConfirmModal, close: closeDeleteConfirmModal }] = useDisclosure(false);
  const [deleteAtributoConfirmModalOpened, { open: openDeleteAtributoConfirmModal, close: closeDeleteAtributoConfirmModal }] = useDisclosure(false);

  // Estados locales específicos de UI
  const [deletingPresentacion, setDeletingPresentacion] = useState<PresentacionProducto | null>(null);
  const [deletingAtributoIndex, setDeletingAtributoIndex] = useState<number | null>(null);
  const [atributosSeleccionados, setAtributosSeleccionados] = useState<AtributoSeleccionado[]>([]);
  const [atributoTemporal, setAtributoTemporal] = useState<string | null>(null);
  const [valorAtributoTemporal, setValorAtributoTemporal] = useState('');

  // Formularios
  const productoForm = useForm<ProductoFormValues>({
    initialValues: {
      nombre_base: '',
      descripcion: '',
      marca: '',
      existencia: 0,
      sku: '',
      fk_unidad_medida: '',
      precio_venta: 0,
    },
    validate: {
      nombre_base: (value) => {
        if (!value.trim()) return 'El nombre del producto es requerido';
        if (value.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres';
        if (value.trim().length > 100) return 'El nombre no puede tener más de 100 caracteres';
        return null;
      },
      sku: (value) => {
        if (!value.trim()) return 'El SKU es requerido';
        if (value.trim().length < 3) return 'El SKU debe tener al menos 3 caracteres';
        if (value.trim().length > 50) return 'El SKU no puede tener más de 50 caracteres';
        
        const skuNormalizado = value.trim().toUpperCase();
        const skuExistente = presentaciones.find(
          p => p.sku.toUpperCase() === skuNormalizado && 
          (!selectedPresentacion || p.id_presentacion_producto !== selectedPresentacion.id_presentacion_producto)
        );
        
        if (skuExistente) return 'Ya existe un producto con ese SKU';
        return null;
      },
      fk_unidad_medida: (value) => !value ? 'La unidad de medida es requerida' : null,
      precio_venta: (value) => value <= 0 ? 'El precio de venta debe ser mayor a 0' : null,
      existencia: (value) => value < 0 ? 'La existencia no puede ser negativa' : null,
    },
  });

  const movimientoForm = useForm<MovimientoFormValues>({
    initialValues: {
      fk_tipo_movimiento: '',
      cantidad: 0,
      motivo: '',
    },
    validate: {
      fk_tipo_movimiento: (value) => !value ? 'El tipo de movimiento es requerido' : null,
      cantidad: (value) => value <= 0 ? 'La cantidad debe ser mayor a 0' : null,
      motivo: (value) => {
        if (!value.trim()) return 'El motivo es requerido';
        if (value.trim().length < 3) return 'El motivo debe tener al menos 3 caracteres';
        if (value.trim().length > 500) return 'El motivo no puede tener más de 500 caracteres';
        return null;
      },
    },
  });

  // Handlers específicos de UI
  const handleAbrirModalCrear = () => {
    setSelectedProducto(null);
    setSelectedPresentacion(null);
    productoForm.reset();
    setAtributosSeleccionados([]);
    openProductoModal();
  };

  const handleAbrirModalEditar = (presentacion: PresentacionProducto) => {
    const producto = productos.find(p => p.id_producto === presentacion.fk_producto);
    if (producto) {
      setSelectedProducto(producto);
      setSelectedPresentacion(presentacion);
      
      productoForm.setValues({
        nombre_base: producto.nombre_base,
        descripcion: producto.descripcion,
        marca: producto.marca || '',
        existencia: producto.existencia || 0,
        sku: presentacion.sku,
        fk_unidad_medida: presentacion.fk_unidad_medida.toString(),
        precio_venta: presentacion.precio_venta,
      });
      
      if (presentacion.atributos && presentacion.atributos.length > 0) {
        const atributosFormato = presentacion.atributos.map(attr => ({
          id_atributo: attr.id_atributo,
          valor: attr.valor
        }));
        setAtributosSeleccionados(atributosFormato);
      } else {
        setAtributosSeleccionados([]);
      }
      
      openProductoModal();
    }
  };

  const handleAbrirMovimientoModal = (presentacion: PresentacionProducto) => {
    setSelectedPresentacion(presentacion);
    movimientoForm.reset();
    openMovimientoModal();
  };

  const handleVerHistorial = (presentacion: PresentacionProducto) => {
    setSelectedPresentacion(presentacion);
    openHistorialModal();
  };

  const handleVerDetalles = (presentacion: PresentacionProducto) => {
    setSelectedPresentacion(presentacion);
    openDetailModal();
  };

  const handleEliminarProducto = (presentacion: PresentacionProducto) => {
    setDeletingPresentacion(presentacion);
    openDeleteConfirmModal();
  };

  const confirmDeleteProducto = () => {
    if (deletingPresentacion) {
      handleDeleteProducto(deletingPresentacion);
    }
    closeDeleteConfirmModal();
    setDeletingPresentacion(null);
  };

  const handleAddAtributoTemporal = () => {
    if (!atributoTemporal || !valorAtributoTemporal) return;

    const nuevoAtributo = {
      id_atributo: parseInt(atributoTemporal),
      valor: valorAtributoTemporal
    };

    setAtributosSeleccionados([...atributosSeleccionados, nuevoAtributo]);
    setAtributoTemporal(null);
    setValorAtributoTemporal('');
  };

  const handleRemoveAtributo = (index: number) => {
    setDeletingAtributoIndex(index);
    openDeleteAtributoConfirmModal();
  };

  const confirmDeleteAtributo = () => {
    if (deletingAtributoIndex !== null) {
      setAtributosSeleccionados(atributosSeleccionados.filter((_, i) => i !== deletingAtributoIndex));
    }
    closeDeleteAtributoConfirmModal();
    setDeletingAtributoIndex(null);
  };

  const resetNewProductForm = () => {
    setSelectedProducto(null);
    setSelectedPresentacion(null);
    productoForm.reset();
    setAtributosSeleccionados([]);
    setAtributoTemporal(null);
    setValorAtributoTemporal('');
  };

  const resetMovimientoForm = () => {
    movimientoForm.reset();
    setSelectedPresentacion(null);
  };

  const handleSubmitProducto = (values: ProductoFormValues) => {
    handleSaveProduct(values, atributosSeleccionados, null, selectedPresentacion);
    closeProductoModal();
    resetNewProductForm();
  };

  const handleSubmitMovimiento = (values: MovimientoFormValues) => {
    if (!selectedPresentacion) {
      notifications.show({
        title: 'Error',
        message: 'No se ha seleccionado un producto',
        color: 'red',
      });
      return;
    }
    handleRegistrarMovimiento(values, selectedPresentacion);
    closeMovimientoModal();
    resetMovimientoForm();
  };

  // Renderizado de filas de la tabla
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
          {(() => {
            const producto = productos.find(p => p.id_producto === presentacion.fk_producto);
            return producto?.marca ? (
              <Text size="sm">{producto.marca}</Text>
            ) : (
              <Text size="sm" c="dimmed">Sin marca</Text>
            );
          })()}
        </Table.Td>
        <Table.Td>
          <Group gap="xs" justify="center">
            <Tooltip label="Ver detalles" position="bottom" withArrow>
              <ActionIcon
                variant="light"
                color="blue"
                onClick={() => handleVerDetalles(presentacion)}
                size="sm"
              >
                <IconEye size="1rem" />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Editar producto" position="bottom" withArrow>
              <ActionIcon
                variant="light"
                color="orange"
                onClick={() => handleAbrirModalEditar(presentacion)}
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
                  leftSection={<IconAdjustments size="1rem" />}
                  onClick={() => handleAbrirMovimientoModal(presentacion)}
                >
                  Corregir Inventario
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconHistory size="1rem" />}
                  onClick={() => handleVerHistorial(presentacion)}
                >
                  Ver Historial de Movimientos
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconPackage size="1rem" />}
                  onClick={() => handleDuplicarProducto(presentacion)}
                >
                  Duplicar Producto
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size="1rem" />}
                  onClick={() => handleEliminarProducto(presentacion)}
                >
                  Eliminar Producto
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
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
          <Button 
            leftSection={<IconPlus size="1rem" />}
            onClick={handleAbrirModalCrear}
            size="md"
          >
            Agregar Producto
          </Button>
        </Group>
      </Paper>

      {/* FILTROS */}
      <Paper withBorder p="md" mb="md" shadow="xs">
        <Stack gap="md">
          <Group align="flex-end" gap="xs">
            <TextInput
              placeholder="Buscar por SKU o nombre..."
              leftSection={<IconSearch size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
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
            
            <Select
              placeholder="Marca"
              data={marcasDisponibles}
              value={marcaFilter}
              onChange={setMarcaFilter}
              clearable
              style={{ flex: 1 }}
              size="md"
            />
            
            <Button 
              variant="subtle" 
              onClick={handleLimpiarFiltros}
              size="md"
            >
              Limpiar
            </Button>
            
            <Button 
              onClick={handleAplicarFiltros}
              size="md"
            >
              Buscar
            </Button>
          </Group>
        </Stack>
      </Paper>

      {/* TABLA DE INVENTARIO */}
      <Paper withBorder p="md" shadow="xs" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
        <Title order={4} mb="md" style={{ flexShrink: 0 }}>Inventario de Productos</Title>
        <Box style={{ flexGrow: 1, overflowY: 'auto' }}>
          {isLoading ? (
            <Center style={{ height: '50%' }}>
              <Stack align="center" gap="md">
                <Loader size="lg" />
                <Text c="dimmed">Cargando productos...</Text>
              </Stack>
            </Center>
          ) : (
            <ScrollArea>
              <Table striped withColumnBorders withRowBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>SKU</Table.Th>
                    <Table.Th>Producto</Table.Th>
                    <Table.Th>Unidad</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Precio Venta</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Stock Actual</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Marca</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {inventarioRows.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={7} style={{ textAlign: 'center' }}>
                        <Text c="dimmed" py="xl">
                          {filtrosAplicados 
                            ? "No se encontraron productos con los filtros aplicados" 
                            : "No hay productos registrados"}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    inventarioRows
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          )}
        </Box>
      </Paper>

      {/* Modal para Agregar/Editar Producto */}
      <Modal
        opened={productoModalOpened}
        onClose={() => {
          closeProductoModal();
          resetNewProductForm();
        }}
        title={
          <Title order={4}>
            {selectedPresentacion ? "Editar Producto" : "Crear Nuevo Producto"}
          </Title>
        }
        size="80%"
        centered
        closeOnClickOutside={false}
      >
        <form onSubmit={productoForm.onSubmit(handleSubmitProducto)}>
          <Stack gap="md">
            {/* Información del Producto Base */}
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Nombre del Producto"
                  placeholder="Ej: Bolígrafo, Cuaderno, Libreta..."
                  size="md"
                  {...productoForm.getInputProps('nombre_base')}
                  withAsterisk
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="Marca"
                  placeholder="Seleccione marca"
                  data={marcasDisponibles}
                  searchable
                  size="md"
                  {...productoForm.getInputProps('marca')}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={{ base: 12, md: 12 }}>
                <TextInput
                  label="Descripción"
                  placeholder="Descripción del producto..."
                  size="md"
                  {...productoForm.getInputProps('descripcion')}
                />
              </Grid.Col>
            </Grid>

            <Divider />

            {/* Información de la Presentación */}
            <Text fw={600}>Información de la Presentación</Text>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="SKU"
                  placeholder="Código único del producto"
                  size="md"
                  {...productoForm.getInputProps('sku')}
                  withAsterisk
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="Unidad de medida"
                  placeholder="Selecciona una unidad"
                  data={unidades.map(unidad => ({
                    value: unidad.id_unidad.toString(),
                    label: `${unidad.nombre} ${unidad.unidad_base ? '(Base)' : ''}`
                  }))}
                  size="md"
                  {...productoForm.getInputProps('fk_unidad_medida')}
                  withAsterisk
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <NumberInput
                  label="Precio de venta"
                  placeholder="0.00"
                  min={0}
                  size="md"
                  {...productoForm.getInputProps('precio_venta')}
                  withAsterisk
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <NumberInput
                  label="Cantidad en existencia"
                  placeholder="0"
                  min={0}
                  size="md"
                  {...productoForm.getInputProps('existencia')}
                />
              </Grid.Col>
            </Grid>

            {/* SECCIÓN: Atributos de la Presentación */}
            <Paper withBorder p="md" bg="gray.0">
              <Title order={5} mb="md">Atributos de la Presentación</Title>
              <Stack gap="md">
                <Group align="flex-end" gap="xs">
                  <Select
                    placeholder="Seleccionar atributo"
                    data={atributos
                      .filter(attr => 
                        !atributosSeleccionados.some(selected => selected.id_atributo === attr.id_atributo)
                      )
                      .map(attr => ({
                        value: attr.id_atributo.toString(),
                        label: attr.nombre
                      }))}
                    value={atributoTemporal}
                    onChange={setAtributoTemporal}
                    style={{ flex: 1 }}
                    size="md"
                  />
                  <Select
                    placeholder="Seleccionar valor"
                    data={[
                      ...(atributoTemporal === '1' ? [
                        { value: 'Rojo', label: 'Rojo' },
                        { value: 'Azul', label: 'Azul' },
                        { value: 'Verde', label: 'Verde' },
                        { value: 'Negro', label: 'Negro' },
                        { value: 'Blanco', label: 'Blanco' },
                      ] : []),
                      ...(atributoTemporal === '2' ? [
                        { value: 'Pequeño', label: 'Pequeño' },
                        { value: 'Mediano', label: 'Mediano' },
                        { value: 'Grande', label: 'Grande' },
                      ] : []),
                      ...(atributoTemporal === '3' ? [
                        { value: 'Plástico', label: 'Plástico' },
                        { value: 'Metal', label: 'Metal' },
                        { value: 'Madera', label: 'Madera' },
                        { value: 'Papel', label: 'Papel' },
                      ] : []),
                      ...(atributoTemporal === '4' ? [
                        { value: 'BIC', label: 'BIC' },
                        { value: 'Pilot', label: 'Pilot' },
                        { value: 'Faber-Castell', label: 'Faber-Castell' },
                      ] : []),
                      ...(atributoTemporal === '5' ? [
                        { value: 'Estándar', label: 'Estándar' },
                        { value: 'Premium', label: 'Premium' },
                        { value: 'Profesional', label: 'Profesional' },
                      ] : []),
                    ]}
                    value={valorAtributoTemporal}
                    onChange={(value) => setValorAtributoTemporal(value || '')}
                    style={{ flex: 1 }}
                    size="md"
                    disabled={!atributoTemporal}
                    searchable
                    clearable
                  />
                  <Button 
                    onClick={handleAddAtributoTemporal}
                    disabled={!atributoTemporal || !valorAtributoTemporal}
                    size="md"
                  >
                    Agregar
                  </Button>
                </Group>

                {atributosSeleccionados.length > 0 && (
                  <Text size="sm" c="dimmed">
                    {atributos.length - atributosSeleccionados.length} de {atributos.length} atributos disponibles
                  </Text>
                )}

                {atributosSeleccionados.length > 0 && (
                  <Stack gap="xs">
                    <Text size="sm" fw={500}>Atributos agregados:</Text>
                    {atributosSeleccionados.map((atributo, index) => {
                      const atributoInfo = atributos.find(a => a.id_atributo === atributo.id_atributo);
                      return (
                        <Group key={index} justify="space-between" bg="white" p="xs" style={{ borderRadius: '4px' }}>
                          <Text size="sm">
                            <Text span fw={500}>{atributoInfo?.nombre}:</Text> {atributo.valor}
                          </Text>
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => handleRemoveAtributo(index)}
                            size="sm"
                          >
                            <IconTrash size="1rem" />
                          </ActionIcon>
                        </Group>
                      );
                    })}
                  </Stack>
                )}
              </Stack>
            </Paper>

            <Group justify="flex-end" gap="xs">
              <Button 
                type="button"
                variant="subtle" 
                onClick={() => {
                  closeProductoModal();
                  resetNewProductForm();
                }} 
                size="md"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                size="md"
              >
                {selectedPresentacion ? "Actualizar Producto" : "Crear Producto"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Modal para Corrección de Inventario */}
      <Modal
        opened={movimientoModalOpened}
        onClose={() => {
          closeMovimientoModal();
          resetMovimientoForm();
        }}
        title={<Title order={4}>Corrección de Inventario</Title>}
        size="md"
        centered
        closeOnClickOutside={false}
      >
        {selectedPresentacion && (
          <form onSubmit={movimientoForm.onSubmit(handleSubmitMovimiento)}>
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
                size="md"
                {...movimientoForm.getInputProps('fk_tipo_movimiento')}
                withAsterisk
              />
              
              <NumberInput
                label="Cantidad"
                placeholder="0"
                min={0.01}
                step={1}
                size="md"
                {...movimientoForm.getInputProps('cantidad')}
                withAsterisk
              />
              
              <Textarea
                label="Motivo de la Corrección"
                placeholder="Describa el motivo de la corrección de inventario"
                size="md"
                {...movimientoForm.getInputProps('motivo')}
                withAsterisk
              />
              
              <Group justify="flex-end" gap="xs">
                <Button 
                  type="button"
                  variant="subtle" 
                  onClick={() => {
                    closeMovimientoModal();
                    resetMovimientoForm();
                  }} 
                  size="md"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  size="md"
                >
                  Registrar Corrección
                </Button>
              </Group>
            </Stack>
          </form>
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
        size="xl"
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
                      <Table.Th>Realizado por</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {calcularStockAcumulado(getMovimientosByPresentacion(selectedPresentacion.id_presentacion_producto))
                      .map((movimiento) => (
                      <Table.Tr key={movimiento.id_stock}>
                        <Table.Td>
                          <Text size="sm">
                            {movimiento.fecha_movimiento.toLocaleDateString()}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge 
                            variant="light" 
                            color={movimiento.cantidad > 0 ? 'green' : 'red'}
                            size="md"
                          >
                            {movimiento.tipo_nombre}
                          </Badge>
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
                        <Table.Td>
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

      {/* Modal para Ver Detalles del Producto */}
      <Modal
        opened={detailModalOpened}
        onClose={closeDetailModal}
        title={<Title order={4}>Detalles del Producto</Title>}
        size="md"
        centered
      >
        {selectedPresentacion && (
          <Stack gap="md">
            <Paper withBorder p="md">
              <Stack gap="sm">
                <Text fw={600} size="lg">{selectedPresentacion.producto_nombre}</Text>
                <Text size="sm" c="dimmed">SKU: {selectedPresentacion.sku}</Text>
                <Text size="sm">{(() => {
                  const producto = productos.find(p => p.id_producto === selectedPresentacion.fk_producto);
                  return producto?.descripcion || 'Sin descripción';
                })()}</Text>
              </Stack>
            </Paper>

            <Paper withBorder p="md">
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text fw={500}>Marca:</Text>
                  <Text>{(() => {
                    const producto = productos.find(p => p.id_producto === selectedPresentacion.fk_producto);
                    return producto?.marca || 'Sin marca';
                  })()}</Text>
                </Group>
                <Group justify="space-between">
                  <Text fw={500}>Unidad de medida:</Text>
                  <Text>{selectedPresentacion.unidad_nombre}</Text>
                </Group>
                <Group justify="space-between">
                  <Text fw={500}>Precio de venta:</Text>
                  <Text>${selectedPresentacion.precio_venta.toFixed(2)}</Text>
                </Group>
                <Group justify="space-between">
                  <Text fw={500}>Stock actual:</Text>
                  <Badge color={getStockStatus(selectedPresentacion.stock_actual || 0).color} size="lg">
                    {selectedPresentacion.stock_actual || 0} unidades
                  </Badge>
                </Group>
              </Stack>
            </Paper>

            {/* SECCIÓN DE ATRIBUTOS Y VALORES */}
            <Paper withBorder p="md">
              <Title order={5} mb="sm">Atributos del Producto</Title>
              {selectedPresentacion?.atributos && selectedPresentacion.atributos.length > 0 ? (
                <Stack gap="xs">
                  {selectedPresentacion.atributos.map((atributo, index) => (
                    <Group key={index} bg="gray.0" p="xs" style={{ borderRadius: '4px' }}>
                      <Text size="sm" fw={500}>{atributo.nombre}:</Text>
                      {atributo.valor}
                    </Group>
                  ))}
                </Stack>
              ) : (
                <Text c="dimmed" size="sm" style={{ textAlign: 'center' }} py="sm">
                  Este producto no tiene atributos definidos
                </Text>
              )}
            </Paper>
          </Stack>
        )}
      </Modal>

      {/* Modal de Confirmación para Eliminar Producto */}
      <Modal
        opened={deleteConfirmModalOpened}
        onClose={closeDeleteConfirmModal}
        title={<Title order={4}>Confirmar Eliminación</Title>}
        centered
        size="md"
      >
        <Stack gap="md">
          <Alert 
            icon={<IconAlertCircle size="1rem" />} 
            title="Confirmar eliminación" 
            color="red"
          >
            ¿Estás seguro de eliminar el producto <Text span fw={600}>"{deletingPresentacion?.producto_nombre}"</Text>?
            <br />
            SKU: <Text span fw={500}>{deletingPresentacion?.sku}</Text>
            <br />
            Esta acción es irreversible.
          </Alert>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeDeleteConfirmModal}>
              Cancelar
            </Button>
            <Button color="red" onClick={confirmDeleteProducto}>
              Sí, Eliminar
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal de Confirmación para Eliminar Atributo */}
      <Modal
        opened={deleteAtributoConfirmModalOpened}
        onClose={closeDeleteAtributoConfirmModal}
        title={<Title order={4}>Confirmar Eliminación de Atributo</Title>}
        centered
        size="md"
      >
        <Stack gap="md">
          <Alert 
            icon={<IconAlertCircle size="1rem" />} 
            title="Confirmar eliminación" 
            color="orange"
          >
            ¿Estás seguro de eliminar este atributo?
          </Alert>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeDeleteAtributoConfirmModal}>
              Cancelar
            </Button>
            <Button color="red" onClick={confirmDeleteAtributo}>
              Sí, Eliminar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}