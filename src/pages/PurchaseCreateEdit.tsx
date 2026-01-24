// src/pages/PurchaseCreateEdit.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
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
  Grid,
  Divider,
  Breadcrumbs,
  Anchor,
  Alert,
  Tooltip,
  Loader,
  Center,
  Table,
} from '@mantine/core';
import { 
  IconPlus, 
  IconSearch,
  IconEdit,
  IconTrash,
  IconArrowLeft,
  IconListDetails,
  IconChevronRight,
  IconAlertCircle,
  IconEye,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';

// Componentes
import { PurchaseForm } from '../components/purchases/PurchaseForm';
import LabelWithTooltip from '../components/common/LabelWithTooltip';

// Hooks y servicios
import { usePurchases } from '../hooks/usePurchases';
import type {
  PurchaseFormValues,
  ProductoCompra,
  PresentacionProducto,
  AtributoProducto
} from '../types/purchases.types';

// Interfaces locales
interface Atributo {
  id_atributo: number;
  nombre: string;
}

interface Unidad {
  id_unidad: number;
  nombre: string;
  unidad_base: boolean;
}

interface NewProductFormValues {
  nombre_base: string;
  descripcion: string;
  sku: string;
  unidad_medida: string;
  precio_venta: number;
  marca: string;
  existencia: number;
}

export default function PurchaseCreateEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Hooks personalizados
  const {
    proveedores,
    presentaciones,
    productos,
    loading,
    setLoading
  } = usePurchases();

  // Estados locales
  const [modoEdicion, setModoEdicion] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<string | null>(null);
  const [fechaCompra, setFechaCompra] = useState(new Date().toISOString().split('T')[0]);
  const [productosCompra, setProductosCompra] = useState<ProductoCompra[]>([]);
  
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [demandaEditando, setDemandaEditando] = useState<number>(0);
  const [indiceProductoEliminar, setIndiceProductoEliminar] = useState<number | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<string | null>(null);
  const [marcaFilter, setMarcaFilter] = useState<string | null>(null);
  const [filtrosAplicados, setFiltrosAplicados] = useState(false);

  // Estados para modales
  const [productListModal, { open: openProductListModal, close: closeProductListModal }] = useDisclosure(false);
  const [newProductModal, { open: openNewProductModal, close: closeNewProductModal }] = useDisclosure(false);
  const [editProductModal, { open: openEditProductModal, close: closeEditProductModal }] = useDisclosure(false);
  const [deleteAlert, { open: openDeleteAlert, close: closeDeleteAlert }] = useDisclosure(false);
  const [cancelAlert, { open: openCancelAlert, close: closeCancelAlert }] = useDisclosure(false);
  const [saveAlert, { open: openSaveAlert, close: closeSaveAlert }] = useDisclosure(false);
  const [detailModalOpened, { open: openDetailModal, close: closeDetailModal }] = useDisclosure(false);
  const [selectedPresentacion, setSelectedPresentacion] = useState<PresentacionProducto | null>(null);

  // Estados para nuevo producto
  const [atributosSeleccionados, setAtributosSeleccionados] = useState<{id_atributo: number, valor: string}[]>([]);
  const [atributoTemporal, setAtributoTemporal] = useState<string | null>(null);
  const [valorAtributoTemporal, setValorAtributoTemporal] = useState('');

  // Datos estáticos
  const [unidades] = useState<Unidad[]>([
    { id_unidad: 1, nombre: 'Pieza', unidad_base: true },
    { id_unidad: 2, nombre: 'Paquete', unidad_base: false },
    { id_unidad: 3, nombre: 'Caja', unidad_base: false },
    { id_unidad: 4, nombre: 'Metro', unidad_base: true },
    { id_unidad: 5, nombre: 'Litro', unidad_base: true },
  ]);

  const [atributos] = useState<Atributo[]>([
    { id_atributo: 1, nombre: 'Color' },
    { id_atributo: 2, nombre: 'Tamaño' },
    { id_atributo: 3, nombre: 'Material' },
    { id_atributo: 4, nombre: 'Marca' },
    { id_atributo: 5, nombre: 'Modelo' },
  ]);

  // Formularios
  const compraForm = useForm<PurchaseFormValues>({
    initialValues: {
      proveedor: '',
      fecha: new Date().toISOString().split('T')[0],
    },
    validate: {
      proveedor: (value) => {
        if (!value) {
          return 'El proveedor es requerido';
        }
        return null;
      },
    },
  });

  const newProductForm = useForm<NewProductFormValues>({
    initialValues: {
      nombre_base: '',
      descripcion: '',
      sku: '',
      unidad_medida: '',
      precio_venta: 0,
      marca: '',
      existencia: 0,
    },
    validate: {
      nombre_base: (value) => {
        if (!value.trim()) {
          return 'El nombre del producto es requerido';
        }
        if (value.trim().length < 3) {
          return 'El nombre debe tener al menos 3 caracteres';
        }
        if (value.trim().length > 100) {
          return 'El nombre no puede tener más de 100 caracteres';
        }
        return null;
      },
      sku: (value) => {
        if (!value.trim()) {
          return 'El SKU es requerido';
        }
        if (value.trim().length < 3) {
          return 'El SKU debe tener al menos 3 caracteres';
        }
        if (value.trim().length > 50) {
          return 'El SKU no puede tener más de 50 caracteres';
        }
        
        const skuNormalizado = value.trim().toUpperCase();
        const skuExistente = presentaciones.find(
          p => p.sku.toUpperCase() === skuNormalizado
        );
        
        if (skuExistente) {
          return 'Ya existe un producto con ese SKU';
        }
        
        return null;
      },
      unidad_medida: (value) => {
        if (!value) {
          return 'La unidad de medida es requerida';
        }
        return null;
      },
      precio_venta: (value) => {
        if (value <= 0) {
          return 'El precio de venta debe ser mayor a 0';
        }
        return null;
      },
      existencia: (value) => {
        if (value < 0) {
          return 'La existencia no puede ser negativa';
        }
        return null;
      },
    },
  });

  const editarProductoForm = useForm({
    initialValues: {
      demanda: 0,
    },
    validate: {
      demanda: (value) => {
        if (value <= 0) {
          return 'La demanda debe ser mayor a 0';
        }
        return null;
      },
    },
  });

  // Cargar datos en modo edición
  useEffect(() => {
    if (id) {
      setModoEdicion(true);
      // Simular carga de compra existente
      const compraExistente = {
        fk_proveedor: 1,
        fecha_compra: '2024-01-15',
        productos: [
          {
            fk_presentacion_producto: 1,
            demanda: 50,
            producto_nombre: 'Bolígrafo (BOL-BIC-AZUL)',
            sku: 'BOL-BIC-AZUL',
            unidad_medida: 'Pieza'
          },
          {
            fk_presentacion_producto: 2,
            demanda: 30,
            producto_nombre: 'Bolígrafo (BOL-BIC-NEGRO)',
            sku: 'BOL-BIC-NEGRO',
            unidad_medida: 'Pieza'
          }
        ]
      };
      
      setProveedorSeleccionado(compraExistente.fk_proveedor.toString());
      setFechaCompra(compraExistente.fecha_compra);
      setProductosCompra(compraExistente.productos);
      compraForm.setValues({
        proveedor: compraExistente.fk_proveedor.toString(),
        fecha: compraExistente.fecha_compra
      });
    }
  }, [id]);

  // Funciones de producto
  const agregarProducto = (producto: ProductoCompra) => {
    setProductosCompra([...productosCompra, producto]);
  };

  const eliminarProducto = (index: number) => {
    const nuevosProductos = [...productosCompra];
    nuevosProductos.splice(index, 1);
    setProductosCompra(nuevosProductos);
    closeDeleteAlert();
  };

  const confirmarEliminarProducto = (index: number) => {
    setIndiceProductoEliminar(index);
    openDeleteAlert();
  };

  const iniciarEdicion = (index: number) => {
    const producto = productosCompra[index];
    setDemandaEditando(producto.demanda);
    editarProductoForm.setValues({ demanda: producto.demanda });
    setEditandoIndex(index);
    openEditProductModal();
  };

  const cancelarEdicion = () => {
    setEditandoIndex(null);
    setDemandaEditando(0);
    editarProductoForm.reset();
  };

  const guardarEdicion = () => {
    const validation = editarProductoForm.validate();
    if (validation.hasErrors) {
      return;
    }

    if (demandaEditando <= 0 || editandoIndex === null) {
      openSaveAlert();
      return;
    }

    const nuevosProductos = [...productosCompra];
    nuevosProductos[editandoIndex] = {
      ...nuevosProductos[editandoIndex],
      demanda: demandaEditando,
    };

    setProductosCompra(nuevosProductos);
    closeEditProductModal();
    cancelarEdicion();
  };

  // Funciones principales
  const handleGuardarCompra = () => {
    const compraValidation = compraForm.validate();
    if (compraValidation.hasErrors) {
      return;
    }

    if (productosCompra.length === 0) {
      notifications.show({
        title: 'Compra incompleta',
        message: 'Debes agregar al menos un producto a la compra',
        color: 'red',
      });
      return;
    }

    if (!proveedorSeleccionado) {
      openSaveAlert();
      return;
    }

    notifications.show({
      title: modoEdicion ? 'Compra actualizada' : 'Compra creada',
      message: modoEdicion 
        ? 'La compra se ha actualizado exitosamente' 
        : 'La compra se ha creado exitosamente',
      color: 'green',
    });
    
    navigate('/dashboard/compras');
  };

  const handleCancelarCompra = () => {
    if (productosCompra.length > 0) {
      openCancelAlert();
    } else {
      navigate('/dashboard/compras');
    }
  };

  const confirmarCancelarCompra = () => {
    navigate('/dashboard/compras');
  };

  // Funciones para atributos
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
    setAtributosSeleccionados(atributosSeleccionados.filter((_, i) => i !== index));
  };

  // Funciones para filtros con loader
  const handleAplicarFiltros = () => {
    
    if (!searchTerm.trim() && !stockFilter && !marcaFilter) {
      // Si no hay filtros aplicados, no hacer nada
      return;
    }

    setLoading(prev => ({ ...prev, filtros: true }));
    setFiltrosAplicados(true);
    
    setTimeout(() => {
      setLoading(prev => ({ ...prev, filtros: false }));
    }, 500);
  };

  const handleLimpiarFiltros = () => {
    setLoading(prev => ({ ...prev, filtros: true }));
    setSearchTerm('');
    setStockFilter(null);
    setMarcaFilter(null);
    setFiltrosAplicados(false);
    
    setTimeout(() => {
      setLoading(prev => ({ ...prev, filtros: false }));
    }, 300);
  };

  const filteredPresentaciones = presentaciones.filter(pres => {
    // Si no se han aplicado filtros, mostrar todos
    if (!filtrosAplicados) return true;
    
    const matchesSearch = searchTerm === '' || 
      pres.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pres.producto_nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStock = !stockFilter || (() => {
      const stock = pres.stock_actual || 0;
      switch (stockFilter) {
        case 'bajo': return stock < 10;
        case 'medio': return stock >= 10 && stock < 50;
        case 'alto': return stock >= 50;
        case 'sin-stock': return stock === 0;
        default: return true;
      }
    })();
    
    const matchesMarca = !marcaFilter || (() => {
      const producto = productos.find(p => p.id_producto === pres.fk_producto);
      return producto?.marca === marcaFilter;
    })();
    
    return matchesSearch && matchesStock && matchesMarca;
  });

  // Funciones para nuevo producto
  const resetNewProductForm = () => {
    newProductForm.reset();
    setAtributosSeleccionados([]);
    setAtributoTemporal(null);
    setValorAtributoTemporal('');
  };

  const handleSaveNewProduct = (values: NewProductFormValues) => {
    const validation = newProductForm.validate();
    if (validation.hasErrors) {
      return;
    }

    const atributosCompletos: AtributoProducto[] = atributosSeleccionados.map(attr => {
      const atributoInfo = atributos.find(a => a.id_atributo === attr.id_atributo);
      return {
        id_atributo: attr.id_atributo,
        nombre: atributoInfo?.nombre || 'Atributo',
        valor: attr.valor
      };
    });

    // Aquí iría la lógica para guardar el producto en el backend
    console.log('Guardando producto:', values, atributosCompletos);

    notifications.show({
      title: 'Producto creado',
      message: 'El producto se ha creado exitosamente. Ahora puedes agregarlo a tu compra.',
      color: 'green',
    });

    resetNewProductForm();
    closeNewProductModal();
  };

  const handleVerDetalles = (presentacion: PresentacionProducto) => {
    setSelectedPresentacion(presentacion);
    openDetailModal();
  };

  const getStockStatus = (stock: number): { color: string; label: string } => {
    if (stock === 0) return { color: 'red', label: 'Sin Stock' };
    if (stock < 10) return { color: 'orange', label: 'Bajo' };
    if (stock < 50) return { color: 'yellow', label: 'Medio' };
    return { color: 'green', label: 'Alto' };
  };

  const marcasUnicas = [...new Set(productos.map(p => p.marca).filter(Boolean))] as string[];
  const marcasDisponibles = marcasUnicas.map(marca => ({
    value: marca,
    label: marca
  }));

  return (
    <Container size="xl">
      <Stack gap="md">
        {/* Header */}
        <Paper withBorder p="md" shadow="xs" style={{ flexShrink: 0 }}>
          <Group justify="space-between" align="center">
            <div>
              <Group>
                <ActionIcon
                  variant="subtle"
                  onClick={() => navigate('/dashboard/compras')}
                  size="lg"
                >
                  <IconArrowLeft size="1.2rem" />
                </ActionIcon>
                <Title order={3}>
                  {modoEdicion ? `Editar Compra #${id}` : 'Seleccionar Producto'}
                </Title>
              </Group>
              <Text c="dimmed" size="sm" mt={4}>
                {modoEdicion 
                  ? 'Modifica la información de la compra existente' 
                  : 'Complete la información de la compra a proveedor'
                }
              </Text>
              
              <Breadcrumbs separator={<IconChevronRight size="1rem" />} mt="sm">
                <Anchor
                  href="/dashboard/compras"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/dashboard/compras');
                  }}
                  c="blue"
                  style={{ cursor: 'pointer', fontSize: '14px' }}
                >
                  Compras
                </Anchor>
                <Anchor
                  href="#"
                  c="dimmed"
                  style={{ fontSize: '14px' }}
                  onClick={(e) => e.preventDefault()}
                >
                  {modoEdicion ? 'Editar Pedido' : 'Nueva Compra'}
                </Anchor>
              </Breadcrumbs>
            </div>
          </Group>
        </Paper>

        {/* Información General */}
        <Paper withBorder p="md" shadow="xs">
          <Title order={4} mb="md">Información General</Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Proveedor"
                placeholder="Selecciona un proveedor"
                data={proveedores.map(prov => ({
                  value: prov.id_proveedor.toString(),
                  label: prov.nombre
                }))}
                value={proveedorSeleccionado}
                onChange={(value) => {
                  setProveedorSeleccionado(value);
                  compraForm.setFieldValue('proveedor', value || '');
                }}
                size="md"
                withAsterisk
                error={compraForm.errors.proveedor}
                errorProps={{ style: { marginTop: '4px' } }}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Fecha de Compra"
                type="date"
                value={fechaCompra}
                onChange={(e) => {
                  setFechaCompra(e.target.value);
                  compraForm.setFieldValue('fecha', e.target.value);
                }}
                size="md"
              />
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Formulario de Productos */}
        <PurchaseForm
          proveedores={proveedores}
          presentaciones={presentaciones}
          productosCompra={productosCompra}
          modoEdicion={modoEdicion}
          loading={{ productos: loading.presentaciones }}
          onAddProduct={agregarProducto}
          onRemoveProduct={confirmarEliminarProducto}
          onEditProduct={iniciarEdicion}
          onOpenProductList={openProductListModal}
        />

        {/* Botones de Acción */}
        <Group justify="flex-end" gap="xs">
          <Button 
            variant="subtle" 
            color="blue"
            onClick={handleCancelarCompra}
            size="md"
          >
            Cancelar
          </Button>
          
          <Button 
            onClick={handleGuardarCompra}
            size="md"
          >
            {modoEdicion ? 'Actualizar Compra' : 'Guardar Compra'}
          </Button>
        </Group>
      </Stack>

      {/* Modal de Lista Completa de Productos */}
      <Modal
        opened={productListModal}
        onClose={closeProductListModal}
        title={<Title order={4}>Lista Completa de Productos</Title>}
        size="100%"
        centered
        closeOnClickOutside={false}
      >
        <Stack gap="md">
          {/* Barra de búsqueda y filtros */}
          <Paper withBorder p="md" shadow="xs">
            <Stack gap="md">
              <Group align="flex-end" gap="xs">
                <TextInput
                  placeholder="Buscar por SKU o nombre..."
                  leftSection={<IconSearch size={16} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.currentTarget.value)}
                  style={{ flex: 2 }}
                  size="md"
                  onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchTerm.trim()) { // ← Solo con texto
                    handleAplicarFiltros();
                  }
                }}
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

          {/* Botón para agregar nuevo producto */}
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Mostrando {filteredPresentaciones.length} de {presentaciones.length} productos
            </Text>
            <Button 
              leftSection={<IconPlus size="1rem" />}
              onClick={() => {
                closeProductListModal();
                openNewProductModal();
              }}
              size="md"
            >
              Agregar Producto
            </Button>
          </Group>

          {/* Tabla de productos con loader */}
          <Paper withBorder style={{ maxHeight: '500px', overflow: 'auto' }}>
            {loading.filtros ? (
              <Center py="xl">
                <Stack align="center" gap="md">
                  <Loader size="lg" />
                  <Text c="dimmed">Aplicando filtros...</Text>
                </Stack>
              </Center>
            ) : (
              <Table striped withColumnBorders withRowBorders>
                <Table.Thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                  <Table.Tr>
                    <Table.Th>SKU</Table.Th>
                    <Table.Th>Producto</Table.Th>
                    <Table.Th>Unidad</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Precio Venta</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Stock Actual</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredPresentaciones.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={6} style={{ textAlign: 'center' }}>
                        <Text c="dimmed" py="xl">
                          No se encontraron productos con los filtros aplicados
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    filteredPresentaciones.map((presentacion) => {
                      const stockStatus = getStockStatus(presentacion.stock_actual || 0);
                      const producto = productos.find(p => p.id_producto === presentacion.fk_producto);
                      
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
                              <Button
                                size="sm"
                                variant="light" 
                                onClick={() => {
                                  closeProductListModal();
                                }}
                              >
                                Seleccionar
                              </Button>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      );
                    })
                  )}
                </Table.Tbody>
              </Table>
            )}
          </Paper>
        </Stack>
      </Modal>

      {/* Modal de Editar Producto */}
      <Modal
        opened={editProductModal}
        onClose={() => {
          closeEditProductModal();
          cancelarEdicion();
        }}
        title={<Title order={4}>Editar Producto en Compra</Title>}
        size="md"
        centered
      >
        <Stack gap="md">
          <NumberInput
            label={
              <LabelWithTooltip
                label="Demanda"
                tooltip="Cantidad que se planea comprar"
              />
            }
            value={demandaEditando}
            onChange={(value) => {
              const numValue = Number(value);
              setDemandaEditando(numValue);
              editarProductoForm.setFieldValue('demanda', numValue);
            }}
            min={0}
            size="md"
            withAsterisk
            error={editarProductoForm.errors.demanda}
            errorProps={{ style: { marginTop: '4px' } }}
          />

          <Group justify="flex-end" gap="xs">
            <Button 
              variant="subtle" 
              onClick={() => {
                closeEditProductModal();
                cancelarEdicion();
              }} 
              size="md"
            >
              Cancelar
            </Button>
            <Button 
              onClick={guardarEdicion}
              size="md"
            >
              Guardar Cambios
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal de Crear Nuevo Producto */}
      <Modal
        opened={newProductModal}
        onClose={() => {
          closeNewProductModal();
          resetNewProductForm();
        }}
        title={<Title order={4}>Crear Nuevo Producto</Title>}
        size="80%"
        centered
        closeOnClickOutside={false}
      >
        <form onSubmit={newProductForm.onSubmit(handleSaveNewProduct)}>
          <Stack gap="md">
            {/* Información del Producto Base */}
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Nombre del Producto"
                  placeholder="Ej: Bolígrafo, Cuaderno, Libreta..."
                  size="md"
                  withAsterisk
                  {...newProductForm.getInputProps('nombre_base')}
                  errorProps={{ style: { marginTop: '4px' } }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="Marca"
                  placeholder="Seleccione marca"
                  data={[
                    { value: 'BIC', label: 'BIC' },
                    { value: 'Norma', label: 'Norma' },
                    { value: 'HP', label: 'HP' },
                    { value: 'Faber-Castell', label: 'Faber-Castell' },
                    { value: 'Pilot', label: 'Pilot' },
                  ]}
                  searchable
                  size="md"
                  {...newProductForm.getInputProps('marca')}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={{ base: 12, md: 12 }}>
                <TextInput
                  label="Descripción"
                  placeholder="Descripción del producto..."
                  size="md"
                  {...newProductForm.getInputProps('descripcion')}
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
                  withAsterisk
                  {...newProductForm.getInputProps('sku')}
                  errorProps={{ style: { marginTop: '4px' } }}
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
                  withAsterisk
                  {...newProductForm.getInputProps('unidad_medida')}
                  errorProps={{ style: { marginTop: '4px' } }}
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
                  withAsterisk
                  {...newProductForm.getInputProps('precio_venta')}
                  errorProps={{ style: { marginTop: '4px' } }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <NumberInput
                  label="Cantidad en existencia"
                  placeholder="0"
                  min={0}
                  size="md"
                  {...newProductForm.getInputProps('existencia')}
                  errorProps={{ style: { marginTop: '4px' } }}
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
                  closeNewProductModal();
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
                Crear Producto
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Modal de Confirmación para Eliminar Producto */}
      <Modal
        opened={deleteAlert}
        onClose={closeDeleteAlert}
        title={<Title order={4}>Eliminar Producto</Title>}
        size="md"
        centered
      >
        <Stack gap="md">
          <Alert icon={<IconAlertCircle size="1rem" />} title="¿Estás seguro?" color="orange">
            Esta acción eliminará el producto de la compra. 
            ¿Deseas continuar?
          </Alert>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeDeleteAlert}>
              Cancelar
            </Button>
            <Button 
              color="red" 
              onClick={() => indiceProductoEliminar !== null && eliminarProducto(indiceProductoEliminar)}
            >
              Sí, Eliminar
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal de Alerta para Cancelar Compra */}
      <Modal
        opened={cancelAlert}
        onClose={closeCancelAlert}
        title={<Title order={4}>Cancelar Compra</Title>}
        size="md"
        centered
      >
        <Stack gap="md">
          <Alert icon={<IconAlertCircle size="1rem" />} title="¿Estás seguro?" color="red">
            Esta acción eliminará toda la compra actual y no se podrá recuperar. 
            ¿Deseas continuar?
          </Alert>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeCancelAlert}>
              Conservar Compra
            </Button>
            <Button color="red" onClick={confirmarCancelarCompra}>
              Sí, Eliminar Compra
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal de Alerta para Guardar Compra */}
      <Modal
        opened={saveAlert}
        onClose={closeSaveAlert}
        title={<Title order={4}>Información Incompleta</Title>}
        size="md"
        centered
      >
        <Stack gap="md">
          <Alert icon={<IconAlertCircle size="1rem" />} title="Faltan datos requeridos" color="blue">
            Para guardar la compra necesitas seleccionar un proveedor y agregar al menos un producto.
          </Alert>
          <Group justify="flex-end">
            <Button onClick={closeSaveAlert}>
              Entendido
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal de Detalles del Producto */}
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
    </Container>
  );
}