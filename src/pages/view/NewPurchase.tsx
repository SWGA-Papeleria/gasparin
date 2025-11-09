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
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

// Interfaces
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
}

interface Atributo {
  id_atributo: number;
  nombre: string;
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

  // Estados para nuevo producto
  const [nombreBase, setNombreBase] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [sku, setSku] = useState('');
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<string | null>(null);
  const [precioVenta, setPrecioVenta] = useState<number | string>(0);

  // Datos de ejemplo
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
    { id_producto: 1, nombre_base: 'Bolígrafo', descripcion: 'Bolígrafo estándar para escritura' },
    { id_producto: 2, nombre_base: 'Cuaderno', descripcion: 'Cuaderno profesional' },
    { id_producto: 3, nombre_base: 'Resma de Papel', descripcion: 'Resma de papel bond A4' },
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
    {
      id_presentacion_producto: 3,
      sku: 'CUA-PROF-100H',
      fk_producto: 2,
      fk_unidad_medida: 1,
      factor_conversion: 1,
      precio_venta: 25.00,
      unidad_nombre: 'Pieza',
      producto_nombre: 'Cuaderno',
      stock_actual: 15
    },
    {
      id_presentacion_producto: 4,
      sku: 'RESMA-A4-500',
      fk_producto: 3,
      fk_unidad_medida: 3,
      factor_conversion: 1,
      precio_venta: 45.00,
      unidad_nombre: 'Caja',
      producto_nombre: 'Resma de Papel',
      stock_actual: 8
    },
  ]);

  // Breadcrumbs items
  const items = [
    { title: 'Compras', href: '/compras' },
    { title: 'Nueva Compra', href: '#' },
  ].map((item, index) => (
    <Anchor href={item.href} key={index} onClick={(e) => { e.preventDefault(); navigate(item.href); }}>
      {item.title}
    </Anchor>
  ));

  // Funciones
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
    navigate('/compras');
  };

  const resetNewProductForm = () => {
    setNombreBase('');
    setDescripcion('');
    setSku('');
    setUnidadSeleccionada(null);
    setPrecioVenta(0);
  };

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
    };

    // Crear nueva presentación
    const nuevaPresentacionId = Math.max(...presentaciones.map(p => p.id_presentacion_producto), 0) + 1;
    const nuevaPresentacion: PresentacionProducto = {
      id_presentacion_producto: nuevaPresentacionId,
      sku,
      fk_producto: nuevoProductoId,
      fk_unidad_medida: parseInt(unidadSeleccionada),
      precio_venta: Number(precioVenta),
      factor_conversion: 1,
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
        <Breadcrumbs>{items}</Breadcrumbs>

        {/* Header */}
        <Paper withBorder p="md" shadow="xs">
          <Group justify="space-between">
            <div>
              <Title order={3}>Registrar Nueva Compra</Title>
              <Text c="dimmed" size="sm">Complete la información de la compra</Text>
            </div>
            <Button 
              variant="subtle"
              leftSection={<IconArrowLeft size="1rem" />}
              onClick={() => navigate('/compras')}
            >
              Volver a Compras
            </Button>
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
                  decimalScale={2}
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
                          decimalScale={2}
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
            onClick={() => navigate('/compras')}
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
        size="xl"
        centered
      >
        <Stack gap="md">
          {/* Barra de búsqueda y botón agregar */}
          <Group justify="space-between">
            <TextInput
              placeholder="Buscar productos..."
              leftSection={<IconSearch size={16} />}
              style={{ flex: 1 }}
              size="md"
            />
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

          {/* Tabla de productos */}
          <Paper withBorder style={{ maxHeight: '400px', overflow: 'auto' }}>
            <Table striped highlightOnHover>
              <Table.Thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 1 }}>
                <Table.Tr>
                  <Table.Th>SKU</Table.Th>
                  <Table.Th>Producto</Table.Th>
                  <Table.Th>Unidad</Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>Precio Venta</Table.Th>
                  <Table.Th style={{ textAlign: 'center' }}>Stock</Table.Th>
                  <Table.Th style={{ textAlign: 'center' }}>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {presentaciones.map((producto) => (
                  <Table.Tr key={producto.id_presentacion_producto}>
                    <Table.Td>
                      <Text fw={500}>{producto.sku}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text>{producto.producto_nombre}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light">{producto.unidad_nombre}</Badge>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'right' }}>
                      <Text>${producto.precio_venta.toFixed(2)}</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: 'center' }}>
                      <Badge 
                        color={
                          (producto.stock_actual || 0) === 0 ? 'red' : 
                          (producto.stock_actual || 0) < 10 ? 'orange' : 'green'
                        }
                      >
                        {producto.stock_actual}
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
                ))}
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
          <Text fw={600}>Información del Producto</Text>
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
                decimalScale={2}
                required
                size="md"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <NumberInput
                label="Factor de conversión"
                value={1}
                placeholder="1"
                min={1}
                step={1}
                required
                size="md"
                allowDecimal={false}
                disabled
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