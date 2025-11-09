// src/pages/view/NewPurchase.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Table,
} from '@mantine/core';
import { 
  IconPlus, 
  IconSearch,
  IconEdit,    
  IconCheck,  
  IconX,
  IconTrash,
  IconArrowLeft,
  IconListDetails,
  IconChevronRight,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

// Interfaces (sin cambios)
interface Proveedor {
  id_proveedor: number;
  nombre: string;
  contacto: string;
  telefono?: string;
  correo?: string;
}

interface ProductoCompra {
  id_compra_producto?: number;
  fk_presentacion_producto: number;
  cantidad: number;
  costo_unitario: number;
  subtotal: number;
  producto_nombre?: string;
  sku?: string;
  unidad_medida?: string;
}

interface PresentacionProducto {
  id_presentacion_producto: number;
  sku: string;
  fk_producto: number;
  fk_unidad_medida: number;
  factor_conversion: number;
  precio_venta: number;
  unidad_nombre?: string;
  stock_actual?: number;
  producto_nombre?: string;
}

interface Producto {
  id_producto: number;
  nombre_base: string;
  descripcion: string;
  atributos?: AtributoProducto[];
}

interface Atributo {
  id_atributo: number;
  nombre: string;
}

interface AtributoProducto {
  id_atributo: number;
  nombre: string;
  valor: string;
}

export default function NewPurchase() {
  const navigate = useNavigate();
  const [productListModal, { open: openProductListModal, close: closeProductListModal }] = useDisclosure(false);
  const [newProductModal, { open: openNewProductModal, close: closeNewProductModal }] = useDisclosure(false);
  
  // Estados del formulario
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<string | null>(null);
  const [fechaCompra, setFechaCompra] = useState(new Date().toISOString().split('T')[0]);
  const [productosCompra, setProductosCompra] = useState<ProductoCompra[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<string | null>(null);
  const [cantidadProducto, setCantidadProducto] = useState<number>(0);
  const [costoUnitario, setCostoUnitario] = useState<number>(0);
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [cantidadEditando, setCantidadEditando] = useState<number>(0);
  const [costoEditando, setCostoEditando] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<string | null>(null);
  const [factorConversion, setFactorConversion] = useState<number | string>(1);

  // Estados para nuevo producto
  const [nombreBase, setNombreBase] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [sku, setSku] = useState('');
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<string | null>(null);
  const [precioVenta, setPrecioVenta] = useState<number | string>(0);

  // Datos de ejemplo (sin cambios)
  const [proveedores] = useState<Proveedor[]>([
    { id_proveedor: 1, nombre: 'Distribuidora Papelera SA', contacto: 'Juan Rodríguez', telefono: '555-1001', correo: 'juan@distpapel.com' },
    { id_proveedor: 2, nombre: 'Suministros Oficina MX', contacto: 'María Sánchez', telefono: '555-1002', correo: 'maria@suministros.com' },
    { id_proveedor: 3, nombre: 'Materiales Escolares Premium', contacto: 'Carlos Mendoza', telefono: '555-1003', correo: 'carlos@materiales.com' }
  ]);

  const [unidades] = useState([
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

  const [productos, setProductos] = useState<Producto[]>([
    { 
        id_producto: 1, 
        nombre_base: 'Bolígrafo', 
        descripcion: 'Bolígrafo estándar para escritura',
        atributos: [
        { id_atributo: 4, nombre: 'Marca', valor: 'BIC' },
        { id_atributo: 1, nombre: 'Color', valor: 'Azul' }
        ]
    },
    { 
        id_producto: 2, 
        nombre_base: 'Cuaderno', 
        descripcion: 'Cuaderno profesional',
        atributos: [
        { id_atributo: 4, nombre: 'Marca', valor: 'Norma' },
        { id_atributo: 2, nombre: 'Tamaño', valor: 'A4' }
        ]
    },
    { 
        id_producto: 3, 
        nombre_base: 'Resma de Papel', 
        descripcion: 'Resma de papel bond A4',
        atributos: [
        { id_atributo: 4, nombre: 'Marca', valor: 'HP' },
        { id_atributo: 3, nombre: 'Material', valor: 'Bond' }
        ]
    },
 ]);

  const [presentaciones, setPresentaciones] = useState<PresentacionProducto[]>([
    {
        id_presentacion_producto: 1,
        sku: 'BOL-BIC-AZUL',
        fk_producto: 1,
        fk_unidad_medida: 1,
        factor_conversion: 1,
        precio_venta: 5.50,
        unidad_nombre: 'Pieza',
        producto_nombre: 'Bolígrafo',
        stock_actual: 45
    },
    {
        id_presentacion_producto: 2,
        sku: 'BOL-BIC-NEGRO',
        fk_producto: 1,
        fk_unidad_medida: 1,
        factor_conversion: 1,
        precio_venta: 5.50,
        unidad_nombre: 'Pieza',
        producto_nombre: 'Bolígrafo',
        stock_actual: 32
    },
  ]);

  // Función para obtener estado del stock (MOVIDA AQUÍ)
  const getStockStatus = (stock: number): { color: string; label: string } => {
    if (stock === 0) return { color: 'red', label: 'Sin Stock' };
    if (stock < 10) return { color: 'orange', label: 'Bajo' };
    if (stock < 50) return { color: 'yellow', label: 'Medio' };
    return { color: 'green', label: 'Alto' };
  };

  // Funciones (sin cambios en la lógica principal)
  const calcularTotalCompra = () => {
    return productosCompra.reduce((total, producto) => total + producto.subtotal, 0);
  };

  const agregarProducto = () => {
    if (!productoSeleccionado || cantidadProducto <= 0 || costoUnitario <= 0) {
      alert('Por favor complete todos los campos del producto');
      return;
    }

    const producto = presentaciones.find(p => p.id_presentacion_producto === Number(productoSeleccionado));
    if (!producto) return;

    const productoExistenteIndex = productosCompra.findIndex(
      p => p.fk_presentacion_producto === Number(productoSeleccionado)
    );

    if (productoExistenteIndex !== -1) {
      const nuevosProductos = [...productosCompra];
      nuevosProductos[productoExistenteIndex] = {
        ...nuevosProductos[productoExistenteIndex],
        cantidad: cantidadProducto,
        costo_unitario: costoUnitario,
        subtotal: cantidadProducto * costoUnitario
      };
      setProductosCompra(nuevosProductos);
    } else {
      const nuevoProducto: ProductoCompra = {
        fk_presentacion_producto: Number(productoSeleccionado),
        cantidad: cantidadProducto,
        costo_unitario: costoUnitario,
        subtotal: cantidadProducto * costoUnitario,
        producto_nombre: `${producto.producto_nombre} (${producto.sku})`,
        sku: producto.sku,
        unidad_medida: producto.unidad_nombre
      };

      setProductosCompra([...productosCompra, nuevoProducto]);
    }
    
    setProductoSeleccionado(null);
    setCantidadProducto(0);
    setCostoUnitario(0);
  };

  const eliminarProducto = (index: number) => {
    const nuevosProductos = [...productosCompra];
    nuevosProductos.splice(index, 1);
    setProductosCompra(nuevosProductos);
  };

  const iniciarEdicion = (index: number) => {
    setEditandoIndex(index);
    setCantidadEditando(productosCompra[index].cantidad);
    setCostoEditando(productosCompra[index].costo_unitario);
  };

  const cancelarEdicion = () => {
    setEditandoIndex(null);
    setCantidadEditando(0);
    setCostoEditando(0);
  };

  const guardarEdicion = (index: number) => {
    if (cantidadEditando <= 0 || costoEditando <= 0) {
      alert('La cantidad y costo deben ser mayores a 0');
      return;
    }

    const nuevosProductos = [...productosCompra];
    nuevosProductos[index] = {
      ...nuevosProductos[index],
      cantidad: cantidadEditando,
      costo_unitario: costoEditando,
      subtotal: cantidadEditando * costoEditando
    };

    setProductosCompra(nuevosProductos);
    cancelarEdicion();
  };

  const handleRegistrarCompra = () => {
    if (!proveedorSeleccionado || productosCompra.length === 0) {
      alert('Por favor seleccione un proveedor y agregue al menos un producto');
      return;
    }

    // Aquí iría la lógica para guardar la compra en la base de datos
    alert('Compra registrada exitosamente');
    navigate('..');
  };

  const resetNewProductForm = () => {
    setNombreBase('');
    setDescripcion('');
    setSku('');
    setUnidadSeleccionada(null);
    setPrecioVenta(0);
    setFactorConversion(1);
  };

  // Función para filtrar presentaciones (CORREGIDA)
  const filteredPresentaciones = presentaciones
    .filter(pres => {
      const searchLower = searchTerm.toLowerCase();
      const productoBase = productos.find(p => p.id_producto === pres.fk_producto);
      
      return (
        pres.sku.toLowerCase().includes(searchLower) ||
        pres.producto_nombre?.toLowerCase().includes(searchLower) ||
        productoBase?.nombre_base.toLowerCase().includes(searchLower) ||
        productoBase?.descripcion.toLowerCase().includes(searchLower)
      );
    })
    .filter(pres => {
      if (!stockFilter) return true;
      const stock = pres.stock_actual || 0;
      
      switch (stockFilter) {
        case 'bajo': return stock < 10;
        case 'medio': return stock >= 10 && stock < 50;
        case 'alto': return stock >= 50;
        case 'sin-stock': return stock === 0;
        default: return true;
      }
    });

  const handleSaveNewProduct = () => {
    if (!nombreBase || !sku || !unidadSeleccionada || !precioVenta) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    // Crear nuevo producto
    const nuevoProductoId = Math.max(...productos.map(p => p.id_producto), 0) + 1;
    const nuevoProducto: Producto = {
      id_producto: nuevoProductoId,
      nombre_base: nombreBase,
      descripcion,
      atributos: []
    };

    // Crear nueva presentación
    const nuevaPresentacionId = Math.max(...presentaciones.map(p => p.id_presentacion_producto), 0) + 1;
    const nuevaPresentacion: PresentacionProducto = {
      id_presentacion_producto: nuevaPresentacionId,
      sku,
      fk_producto: nuevoProductoId,
      fk_unidad_medida: parseInt(unidadSeleccionada),
      precio_venta: Number(precioVenta),
      factor_conversion: Number(factorConversion), 
      unidad_nombre: unidades.find(u => u.id_unidad === parseInt(unidadSeleccionada))?.nombre,
      producto_nombre: nombreBase,
      stock_actual: 0
    };

    // Actualizar estados
    setProductos([nuevoProducto, ...productos]);
    setPresentaciones([nuevaPresentacion, ...presentaciones]);

    // Seleccionar automáticamente el nuevo producto
    setProductoSeleccionado(nuevaPresentacionId.toString());

    // Limpiar formulario y cerrar modal
    resetNewProductForm();
    closeNewProductModal();
    
    alert('Producto creado exitosamente. Ahora puedes agregarlo a tu compra.');
  };

  return (
    <Container size="xl">
      <Stack gap="md">
        {/* Breadcrumbs */}

        {/* Header */}
        <Paper withBorder p="md" shadow="xs" style={{ flexShrink: 0 }}>
            <Group justify="space-between" align="flex-start">
                <div>
                <Group>
                    <ActionIcon
                    variant="subtle"
                    onClick={() => navigate('/dashboard/compras')}
                    size="lg"
                    >
                    <IconArrowLeft size="1.2rem" />
                    </ActionIcon>
                    <Title order={3}>Registrar Nueva Compra</Title>
                </Group>
                <Text c="dimmed" size="sm" mt={4}>
                    Complete la información de la compra a proveedor
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
                        Nueva Compra
                    </Anchor>
                </Breadcrumbs>
                </div>
            </Group>
        </Paper>

        {/* Información General de la Compra */}
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
                onChange={setProveedorSeleccionado}
                required
                size="md"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Fecha de Compra"
                type="date"
                value={fechaCompra}
                onChange={(e) => setFechaCompra(e.target.value)}
                size="md"
              />
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Agregar Productos */}
        <Paper withBorder p="md" shadow="xs">
          <Title order={4} mb="md">Agregar Productos</Title>
          
          {/* Selección de Productos */}
          <Paper withBorder p="md" mb="md">
            <Text fw={600} mb="md">Seleccionar Producto</Text>
            <Grid align="flex-end">
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Select
                  label="Producto"
                  placeholder="Escribe para buscar producto..."
                  data={presentaciones.map(prod => ({
                    value: prod.id_presentacion_producto.toString(),
                    label: `${prod.producto_nombre} (${prod.sku}) - Stock: ${prod.stock_actual}`
                  }))}
                  value={productoSeleccionado}
                  onChange={setProductoSeleccionado}
                  searchable
                  clearable
                  nothingFoundMessage="No se encontraron productos..."
                  size="md"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 3 }}>
                <NumberInput
                  label="Cantidad"
                  placeholder="0"
                  value={cantidadProducto}
                  onChange={(value) => setCantidadProducto(Number(value))}
                  min={1}
                  size="md"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 3 }}>
                <NumberInput
                  label="Costo Unitario"
                  placeholder="0.00"
                  value={costoUnitario}
                  onChange={(value) => setCostoUnitario(Number(value))}
                  prefix="$"
                  min={0}
                  size="md"
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 2 }}>
                <Box style={{ display: 'flex', height: '100%', alignItems: 'flex-end' }}>
                  <Button 
                    onClick={agregarProducto} 
                    disabled={!productoSeleccionado || !cantidadProducto || !costoUnitario}
                    fullWidth
                    size="md"
                  >
                    Agregar
                  </Button>
                </Box>
              </Grid.Col>
            </Grid>
            
            <Group justify="center" mt="md">
              <Button 
                variant="light" 
                leftSection={<IconListDetails size="1rem" />}
                onClick={openProductListModal}
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
              <Stack gap="sm">
                {productosCompra.map((producto, index) => (
                  <Group key={index} justify="space-between" p="sm" bg="gray.0">
                    <Box style={{ flex: 2 }}>
                      <Text fw={500}>{producto.producto_nombre}</Text>
                      <Text size="sm" c="dimmed">SKU: {producto.sku}</Text>
                    </Box>
                    
                    {editandoIndex === index ? (
                      // Modo edición
                      <>
                        <NumberInput
                          value={cantidadEditando}
                          onChange={(value) => setCantidadEditando(Number(value))}
                          min={1}
                          size="sm"
                          style={{ width: '80px' }}
                        />
                        <Text>{producto.unidad_medida}</Text>
                        <NumberInput
                          value={costoEditando}
                          onChange={(value) => setCostoEditando(Number(value))}
                          prefix="$"
                          min={0}
                          size="sm"
                          style={{ width: '100px' }}
                        />
                        <Text>c/u</Text>
                        <Text fw={600}>${(cantidadEditando * costoEditando).toFixed(2)}</Text>
                        <Group gap="xs">
                          <ActionIcon 
                            color="green" 
                            variant="subtle"
                            onClick={() => guardarEdicion(index)}
                          >
                            <IconCheck size="1rem" />
                          </ActionIcon>
                          <ActionIcon 
                            color="gray" 
                            variant="subtle"
                            onClick={cancelarEdicion}
                          >
                            <IconX size="1rem" />
                          </ActionIcon>
                        </Group>
                      </>
                    ) : (
                      // Modo visualización
                      <>
                        <Text>{producto.cantidad} {producto.unidad_medida}</Text>
                        <Text>${producto.costo_unitario.toFixed(2)} c/u</Text>
                        <Text fw={600}>${producto.subtotal.toFixed(2)}</Text>
                        <Group gap="xs">
                          <ActionIcon 
                            color="blue" 
                            variant="subtle"
                            onClick={() => iniciarEdicion(index)}
                          >
                            <IconEdit size="1rem" />
                          </ActionIcon>
                          <ActionIcon 
                            color="red" 
                            variant="subtle"
                            onClick={() => eliminarProducto(index)}
                          >
                            <IconTrash size="1rem" />
                          </ActionIcon>
                        </Group>
                      </>
                    )}
                  </Group>
                ))}
              </Stack>
              
              {/* Total */}
              <Paper withBorder p="md" mt="md" bg="blue.0">
                <Group justify="space-between">
                  <Text fw={700} size="lg">Total de la Compra:</Text>
                  <Text fw={700} size="xl">${calcularTotalCompra().toFixed(2)}</Text>
                </Group>
              </Paper>
            </Paper>
          )}
        </Paper>

        {/* Botones de Acción */}
        <Group justify="flex-end" gap="xs">
          <Button 
            variant="subtle" 
            onClick={() => navigate('/dashboard/compras')}
            size="md"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleRegistrarCompra} 
            disabled={!proveedorSeleccionado || productosCompra.length === 0}
            size="md"
          >
            Registrar Compra
          </Button>
        </Group>
      </Stack>

      {/* Modal de Lista Completa de Productos */}
      <Modal
        opened={productListModal}
        onClose={closeProductListModal}
        title={<Title order={4}>Lista Completa de Productos</Title>}
        size="90%"  // ← HACER MÁS ANCHO
        centered
        >
        <Stack gap="md">
            {/* Barra de búsqueda y botón agregar */}
            <Group align="flex-end" gap="xs">
            <TextInput
                placeholder="Buscar por SKU o nombre..."
                leftSection={<IconSearch size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
            
            <Button 
                variant="subtle" 
                onClick={() => {
                setSearchTerm('');
                setStockFilter(null);
                }}
                size="md"
            >
                Limpiar
            </Button>
            
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

            {/* Tabla de productos - MÁS INFORMACIÓN COMO EN INVENTORY */}
            <Paper withBorder style={{ maxHeight: '500px', overflow: 'auto' }}>
            <Table striped highlightOnHover>
                <Table.Thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                <Table.Tr>
                    <Table.Th>SKU</Table.Th>
                    <Table.Th>Producto</Table.Th>
                    <Table.Th>Unidad</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Precio Venta</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Stock</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Estado</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Acciones</Table.Th>
                </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {filteredPresentaciones.map((producto: PresentacionProducto) => {
                        const stockStatus = getStockStatus(producto.stock_actual || 0);
                        const productoBase = productos.find(p => p.id_producto === producto.fk_producto);
                        
                        return (
                        <Table.Tr key={producto.id_presentacion_producto}>
                            <Table.Td>
                            <Text>{producto.sku}</Text>
                            </Table.Td>
                            <Table.Td>
                                <div>
                                    <Text>
                                    {productoBase?.nombre_base}
                                    {productoBase?.atributos && productoBase.atributos.length > 0 && (
                                        <Text span>
                                        {' '}
                                        {productoBase.atributos.map(atributo => atributo.valor).join(' ')}
                                        </Text>
                                    )}
                                    </Text>
                                    {producto.producto_nombre && producto.producto_nombre !== productoBase?.nombre_base && (
                                    <Text size="sm" c="blue" mt={0}>Variante: {producto.producto_nombre}</Text>
                                    )}
                                </div>
                            </Table.Td>
                            <Table.Td>
                            <Badge variant="light">{producto.unidad_nombre}</Badge>
                            </Table.Td>
                            <Table.Td style={{ textAlign: 'right' }}>
                            <Text>${producto.precio_venta.toFixed(2)}</Text>
                            </Table.Td>
                            <Table.Td style={{ textAlign: 'center' }}>
                            <Text>{producto.stock_actual}</Text> {/* Solo texto normal */}
                            </Table.Td>
                            <Table.Td style={{ textAlign: 'center' }}>
                            <Badge color={stockStatus.color}>
                                {stockStatus.label}
                            </Badge>
                            </Table.Td>
                            <Table.Td style={{ textAlign: 'center' }}>
                            <Button
                                size="xs"
                                onClick={() => {
                                setProductoSeleccionado(producto.id_presentacion_producto.toString());
                                closeProductListModal();
                                }}
                            >
                                Seleccionar
                            </Button>
                            </Table.Td>
                        </Table.Tr>
                        );
                    })}
                </Table.Tbody>
            </Table>
            </Paper>
        </Stack>
      </Modal>

      {/* Modal de Crear Nuevo Producto */}
      <Modal
        opened={newProductModal}
        onClose={closeNewProductModal}
        title={<Title order={4}>Crear Nuevo Producto</Title>}
        size="lg"
        centered
      >
        <Stack gap="md">
          {/* Información del Producto Base */}
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Nombre del Producto"
                value={nombreBase}
                onChange={(event) => setNombreBase(event.currentTarget.value)}
                placeholder="Ej: Bolígrafo, Cuaderno, Libreta..."
                required
                size="md"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Descripción"
                value={descripcion}
                onChange={(event) => setDescripcion(event.currentTarget.value)}
                placeholder="Descripción del producto..."
                size="md"
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
                value={sku}
                onChange={(event) => setSku(event.currentTarget.value)}
                placeholder="Código único del producto"
                required
                size="md"
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
                value={unidadSeleccionada}
                onChange={setUnidadSeleccionada}
                required
                size="md"
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="Precio de venta"
                value={precioVenta}
                onChange={setPrecioVenta}
                placeholder="0.00"
                min={0}
                required
                size="md"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="Factor de conversión"
                value={factorConversion}
                onChange={setFactorConversion}
                placeholder="1"
                min={1}
                step={1}
                required
                size="md"
                
              />
            </Grid.Col>
          </Grid>

          <Group justify="flex-end" gap="xs">
            <Button variant="subtle" onClick={closeNewProductModal} size="md">
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveNewProduct}
              disabled={!nombreBase || !sku || !unidadSeleccionada || !precioVenta}
              size="md"
            >
              Crear Producto
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}