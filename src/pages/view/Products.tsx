// pages/view/Products.tsx
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
  Divider,
  Box,
  Tooltip,
  Breadcrumbs,
  Anchor,
} from '@mantine/core';
import { 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconArrowLeft,
  IconEye,
  IconSearch,
  IconChevronRight,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import LabelWithTooltip from '../../components/LabelWithTooltip'; 

// Interfaces según el diagrama ER
interface Producto {
  id_producto: number;
  nombre_base: string;
  descripcion: string;
}

interface PresentacionProducto {
  id_presentacion_producto: number;
  sku: string;
  fk_producto: number;
  fk_unidad_medida: number;
  factor_conversion: number;
  precio_venta: number;
  unidad_nombre?: string;
  producto_nombre?: string;
}

interface AtributoProducto {
  id_atributo_producto: number;
  fk_presentacion_producto: number;
  fk_atributo: number;
  valor: string;
  atributo_nombre?: string;
}

interface Atributo {
  id_atributo: number;
  nombre: string;
}

export default function Products() {
  // Estados de navegación
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);

  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Datos de ejemplo
  const [unidades] = useState([
    { id_unidad: 1, nombre: 'Pieza', unidad_base: true },
    { id_unidad: 2, nombre: 'Paquete', unidad_base: false },
    { id_unidad: 3, nombre: 'Caja', unidad_base: false },
    { id_unidad: 4, nombre: 'Metro', unidad_base: true },
    { id_unidad: 5, nombre: 'Litro', unidad_base: true },
  ]);

  const [productos, setProductos] = useState<Producto[]>([
    {
      id_producto: 1,
      nombre_base: 'Bolígrafo',
      descripcion: 'Bolígrafo estándar para escritura',
    },
    {
      id_producto: 2,
      nombre_base: 'Cuaderno',
      descripcion: 'Cuaderno profesional',
    },
    {
      id_producto: 3,
      nombre_base: 'Resma de Papel',
      descripcion: 'Resma de papel bond A4',
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
    },
    {
      id_presentacion_producto: 3,
      sku: 'CUA-PROF-100H',
      fk_producto: 2,
      fk_unidad_medida: 1,
      factor_conversion: 1,
      precio_venta: 25.00,
      unidad_nombre: 'Pieza',
    },
    {
      id_presentacion_producto: 4,
      sku: 'RESMA-A4-500',
      fk_producto: 3,
      fk_unidad_medida: 3,
      factor_conversion: 1,
      precio_venta: 45.00,
      unidad_nombre: 'Caja',
    },
  ]);

  // Datos de atributos (del módulo Attributes)
  const [atributos] = useState<Atributo[]>([
    { id_atributo: 1, nombre: 'Color' },
    { id_atributo: 2, nombre: 'Tamaño' },
    { id_atributo: 3, nombre: 'Material' },
    { id_atributo: 4, nombre: 'Marca' },
    { id_atributo: 5, nombre: 'Modelo' },
  ]);

  const [atributosProducto, setAtributosProducto] = useState<AtributoProducto[]>([
    {
      id_atributo_producto: 1,
      fk_presentacion_producto: 1,
      fk_atributo: 1,
      valor: 'Azul',
      atributo_nombre: 'Color'
    },
    {
      id_atributo_producto: 2,
      fk_presentacion_producto: 1,
      fk_atributo: 4,
      valor: 'BIC',
      atributo_nombre: 'Marca'
    },
    {
      id_atributo_producto: 3,
      fk_presentacion_producto: 2,
      fk_atributo: 1,
      valor: 'Negro',
      atributo_nombre: 'Color'
    },
  ]);

  // Estados para modales
  const [productoModalOpened, { open: openProductoModal, close: closeProductoModal }] = useDisclosure(false);
  const [presentacionModalOpened, { open: openPresentacionModal, close: closePresentacionModal }] = useDisclosure(false);

  // Estados para formularios
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [editingPresentacion, setEditingPresentacion] = useState<PresentacionProducto | null>(null);
  const [nombreBase, setNombreBase] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [sku, setSku] = useState('');
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<string | null>(null);
  const [precioVenta, setPrecioVenta] = useState<number | string>(0);
  const [factorConversion, setFactorConversion] = useState<number | string>(1);
  
  // Estados para atributos en el modal de presentación
  const [atributosSeleccionados, setAtributosSeleccionados] = useState<{id_atributo: number, valor: string}[]>([]);
  const [atributoTemporal, setAtributoTemporal] = useState<string | null>(null);
  const [valorAtributoTemporal, setValorAtributoTemporal] = useState('');

  // Filtrar productos
  const filteredProductos = productos.filter(producto =>
    producto.nombre_base.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // CRUD para Productos
  const handleSaveProduct = () => {
    if (!nombreBase) return;

    if (editingProduct) {
      setProductos(productos.map(product => 
        product.id_producto === editingProduct.id_producto 
          ? { ...product, nombre_base: nombreBase, descripcion }
          : product
      ));
    } else {
      const newProduct: Producto = {
        id_producto: Math.max(...productos.map(p => p.id_producto)) + 1,
        nombre_base: nombreBase,
        descripcion,
      };
      setProductos([...productos, newProduct]);
    }
    closeProductoModal();
    resetForm();
  };

  // CRUD para Presentaciones
  const handleSavePresentacion = () => {
    if (!sku || !unidadSeleccionada || !precioVenta || !factorConversion) return;

    let nuevaPresentacionId: number;

    if (editingPresentacion) {
      // Actualizar presentación existente
      setPresentaciones(presentaciones.map(pres => 
        pres.id_presentacion_producto === editingPresentacion.id_presentacion_producto 
          ? {
              ...pres,
              sku,
              fk_unidad_medida: parseInt(unidadSeleccionada),
              precio_venta: Number(precioVenta),
              factor_conversion: Number(factorConversion),
              unidad_nombre: unidades.find(u => u.id_unidad === parseInt(unidadSeleccionada))?.nombre
            }
          : pres
      ));
      nuevaPresentacionId = editingPresentacion.id_presentacion_producto;

      // Actualizar atributos existentes
      const atributosActualizados = atributosProducto.filter(
        attr => attr.fk_presentacion_producto !== editingPresentacion.id_presentacion_producto
      );

      const nuevosAtributos = atributosSeleccionados.map((atributo, index) => ({
        id_atributo_producto: Math.max(...atributosProducto.map(a => a.id_atributo_producto), 0) + index + 1,
        fk_presentacion_producto: editingPresentacion.id_presentacion_producto,
        fk_atributo: atributo.id_atributo,
        valor: atributo.valor,
        atributo_nombre: atributos.find(a => a.id_atributo === atributo.id_atributo)?.nombre
      }));

      setAtributosProducto([...atributosActualizados, ...nuevosAtributos]);
    } else {
      if (!selectedProduct) return;
      
      // Crear nueva presentación
      nuevaPresentacionId = Math.max(...presentaciones.map(p => p.id_presentacion_producto), 0) + 1;
      
      const newPresentation: PresentacionProducto = {
        id_presentacion_producto: nuevaPresentacionId,
        sku,
        fk_producto: selectedProduct.id_producto,
        fk_unidad_medida: parseInt(unidadSeleccionada),
        precio_venta: Number(precioVenta),
        factor_conversion: Number(factorConversion),
        unidad_nombre: unidades.find(u => u.id_unidad === parseInt(unidadSeleccionada))?.nombre,
        producto_nombre: selectedProduct.nombre_base,
      };

      setPresentaciones([...presentaciones, newPresentation]);

      // Crear atributos para la nueva presentación
      const nuevosAtributos = atributosSeleccionados.map((atributo, index) => ({
        id_atributo_producto: Math.max(...atributosProducto.map(a => a.id_atributo_producto), 0) + index + 1,
        fk_presentacion_producto: nuevaPresentacionId,
        fk_atributo: atributo.id_atributo,
        valor: atributo.valor,
        atributo_nombre: atributos.find(a => a.id_atributo === atributo.id_atributo)?.nombre
      }));

      setAtributosProducto([...atributosProducto, ...nuevosAtributos]);
    }

    closePresentacionModal();
    resetPresentationForm();
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
    setAtributosSeleccionados(atributosSeleccionados.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setNombreBase('');
    setDescripcion('');
    setEditingProduct(null);
  };

  const resetPresentationForm = () => {
    setSku('');
    setUnidadSeleccionada(null);
    setPrecioVenta(0);
    setFactorConversion(1);
    setAtributosSeleccionados([]);
    setEditingPresentacion(null);
  };

  const handleVerDetalles = (producto: Producto) => {
    setSelectedProduct(producto);
    setCurrentView('detail');
  };

  const handleVolverALista = () => {
    setCurrentView('list');
    setSelectedProduct(null);
    setSearchTerm('');
  };

  const handleAgregarPresentacion = () => {
    setEditingPresentacion(null);
    resetPresentationForm();
    openPresentacionModal();
  };

  const handleEditarPresentacion = (presentacion: PresentacionProducto) => {
    setEditingPresentacion(presentacion);
    setSku(presentacion.sku);
    setUnidadSeleccionada(presentacion.fk_unidad_medida.toString());
    setPrecioVenta(presentacion.precio_venta);
    setFactorConversion(presentacion.factor_conversion);
    
    // Cargar atributos existentes para edición
    const atributosExistentes = getAtributosByPresentacion(presentacion.id_presentacion_producto);
    setAtributosSeleccionados(
      atributosExistentes.map(attr => ({
        id_atributo: attr.fk_atributo,
        valor: attr.valor
      }))
    );
    
    openPresentacionModal();
  };

  // Obtener presentaciones de un producto específico
  const getPresentacionesByProduct = (productoId: number) => {
    return presentaciones.filter(pres => pres.fk_producto === productoId);
  };

  // Obtener atributos de una presentación específica
  const getAtributosByPresentacion = (presentacionId: number) => {
    return atributosProducto.filter(atributo => atributo.fk_presentacion_producto === presentacionId);
  };

  // Formatear atributos para mostrar en la tabla (solo valores)
  const formatAtributosForDisplay = (presentacionId: number) => {
    const atributos = getAtributosByPresentacion(presentacionId);
    if (atributos.length === 0) return 'Sin atributos';
    
    return atributos.map(attr => attr.valor).join(', ');
  };

  // VISTA: Lista de Productos
  const ProductosListView = () => {
    const productosRows = filteredProductos.map((producto) => {
      const presentacionesCount = getPresentacionesByProduct(producto.id_producto).length;
      
      return (
        <Table.Tr key={producto.id_producto}>
          <Table.Td>
            <Text>{producto.nombre_base}</Text>
          </Table.Td>
          <Table.Td>
            <Text size="sm" lineClamp={2}>{producto.descripcion}</Text>
          </Table.Td>
          <Table.Td style={{ textAlign: 'center' }}>
            <Badge color={presentacionesCount > 0 ? 'blue' : 'gray'}>
              {presentacionesCount} presentaciones
            </Badge>
          </Table.Td>
          <Table.Td>
            <Group gap="xs" justify="center">
              <Tooltip label="Ver presentaciones" position="bottom" withArrow>
                <ActionIcon
                  variant="light"
                  color="blue"
                  onClick={() => handleVerDetalles(producto)}
                  size="sm"
                >
                  <IconEye size="1rem" />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Editar producto" position="bottom" withArrow>
                <ActionIcon
                  variant="light"
                  color="orange"
                  onClick={() => {
                    setEditingProduct(producto);
                    setNombreBase(producto.nombre_base);
                    setDescripcion(producto.descripcion);
                    openProductoModal();
                  }}
                  size="sm"
                >
                  <IconEdit size="1rem" />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Table.Td>
        </Table.Tr>
      );
    });

    return (
      <>
        {/* FILTROS */}
        <Paper withBorder p="md" mb="md" shadow="xs">
          <Group align="flex-end" gap="xs">
            <TextInput
              placeholder="Buscar por nombre o descripción..."
              leftSection={<IconSearch size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 2 }}
              size="md"
            />
            
            <Button 
              variant="subtle" 
              onClick={() => setSearchTerm('')}
              size="md"
            >
              Limpiar
            </Button>
          </Group>
        </Paper>

        <Paper withBorder p="md" shadow="xs" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
          <Title order={4} mb="md" style={{ flexShrink: 0 }}>Productos Base</Title>
          <Box style={{ flexGrow: 1, overflowY: 'auto' }}>
            <Table striped withColumnBorders withRowBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Producto Base</Table.Th>
                  <Table.Th>Descripción</Table.Th>
                  <Table.Th style={{ textAlign: 'center' }}>Presentaciones</Table.Th>
                  <Table.Th style={{ textAlign: 'center' }}>Acciones</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {productosRows.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={4} style={{ textAlign: 'center' }}>
                      <Text c="dimmed" py="xl">
                        No se encontraron productos con los filtros aplicados
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  productosRows
                )}
              </Table.Tbody>
            </Table>
          </Box>
        </Paper>
      </>
    );
  };

  // VISTA: Detalle del Producto
  const ProductoDetailView = () => {
    if (!selectedProduct) return null;

    const presentacionesDelProducto = getPresentacionesByProduct(selectedProduct.id_producto);

    return (
      <Paper withBorder p="md" shadow="xs" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
        <Stack gap="md" style={{ flex: 1 }}>
          <div>
            <Title order={4}>{selectedProduct.nombre_base}</Title>
            <Text c="dimmed">{selectedProduct.descripcion}</Text>
          </div>

          <Divider />

          <Text fw={500}>Presentaciones del Producto:</Text>
          
          {presentacionesDelProducto.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              No hay presentaciones para este producto
            </Text>
          ) : (
            <Box style={{ flexGrow: 1, overflowY: 'auto' }}>
              <Table striped withColumnBorders withRowBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>SKU</Table.Th>
                    <Table.Th>Unidad</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Precio Venta</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Factor Conversión</Table.Th>
                    <Table.Th>Atributos</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {presentacionesDelProducto.map((presentacion) => (
                    <Table.Tr key={presentacion.id_presentacion_producto}>
                      <Table.Td>
                        <Text>{presentacion.sku}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light">{presentacion.unidad_nombre}</Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right' }}>
                        <Text>${presentacion.precio_venta.toFixed(2)}</Text>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'center' }}>
                        <Text>{presentacion.factor_conversion}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" lineClamp={2}>
                          {formatAtributosForDisplay(presentacion.id_presentacion_producto)}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs" justify="center">
                          <Tooltip label="Editar presentación" position="bottom" withArrow>
                            <ActionIcon
                              variant="light"
                              color="orange"
                              onClick={() => handleEditarPresentacion(presentacion)}
                              size="sm"
                            >
                              <IconEdit size="1rem" />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Box>
          )}
        </Stack>
      </Paper>
    );
  };

  // Breadcrumbs items
  const breadcrumbsItems = [
    { title: 'Productos', href: '#' },
    ...(currentView === 'detail' && selectedProduct ? [{ title: selectedProduct.nombre_base }] : []),
  ];

  return (
    <Container size="xl">
      {/* CABECERA CON BREADCRUMBS CORREGIDO */}
      <Paper withBorder p="md" mb="md" shadow="xs" style={{ flexShrink: 0 }}>
        <Group justify="space-between" align="flex-start">
          <div>
            <Group>
              {currentView === 'detail' && (
                <ActionIcon
                  variant="subtle"
                  onClick={handleVolverALista}
                  size="lg"
                >
                  <IconArrowLeft size="1.2rem" />
                </ActionIcon>
              )}
              <Title order={3}>
                {currentView === 'list' ? 'Gestión de Productos' : selectedProduct?.nombre_base}
              </Title>
            </Group>
            <Text c="dimmed" size="sm" mt={4}>
              {currentView === 'list' 
                ? 'Administración de productos base y sus presentaciones' 
                : `Presentaciones de ${selectedProduct?.nombre_base}`
              }
            </Text>
            
            {/* BREADCRUMBS DEBAJO DE LA DESCRIPCIÓN */}
            <Breadcrumbs separator={<IconChevronRight size="1rem" />} mt="sm">
              {breadcrumbsItems.map((item, index) => (
                <Anchor
                  key={index}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    if (index === 0 && currentView === 'detail') {
                      handleVolverALista();
                    }
                  }}
                  c={index === breadcrumbsItems.length - 1 ? 'dimmed' : 'blue'}
                  style={{ 
                    cursor: index === breadcrumbsItems.length - 1 ? 'default' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {item.title}
                </Anchor>
              ))}
            </Breadcrumbs>
          </div>
          
          {currentView === 'list' ? (
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={() => {
                setEditingProduct(null);
                resetForm();
                openProductoModal();
              }}
              size="md"
            >
              Agregar Producto
            </Button>
          ) : (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleAgregarPresentacion}
              size="md"
            >
              Agregar Presentación
            </Button>
          )}
        </Group>
      </Paper>

      {/* CONTENIDO PRINCIPAL */}
      {currentView === 'list' ? <ProductosListView /> : <ProductoDetailView />}

      {/* Modal para Productos */}
      <Modal
        opened={productoModalOpened}
        onClose={closeProductoModal}
        title={
          <Title order={4}>
            {editingProduct ? "Editar producto" : "Crear nuevo producto"}
          </Title>
        }
        size="md"
        centered
      >
        <Stack>
          <TextInput
            label="Nombre del producto"
            value={nombreBase}
            onChange={(event) => setNombreBase(event.currentTarget.value)}
            placeholder="Ej: Bolígrafo, Cuaderno, Libreta..."
            required
            size="md"
          />
          <TextInput
            label="Descripción"
            value={descripcion}
            onChange={(event) => setDescripcion(event.currentTarget.value)}
            placeholder="Descripción del producto..."
            size="md"
          />
          <Group justify="flex-end" gap="xs">
            <Button variant="subtle" onClick={closeProductoModal} size="md">
              Cancelar
            </Button>
            <Button onClick={handleSaveProduct} size="md">
              {editingProduct ? "Actualizar" : "Crear"}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal para Presentaciones */}
      <Modal
        opened={presentacionModalOpened}
        onClose={closePresentacionModal}
        title={
          <Title order={4}>
            {editingPresentacion ? "Editar presentación" : "Crear nueva presentación"}
          </Title>
        }
        size="lg"
        centered
      >
        <Stack gap="md">
          <TextInput
            label="SKU"
            value={sku}
            onChange={(event) => setSku(event.currentTarget.value)}
            placeholder="Código único del producto"
            required
            size="md"
          />
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
          <Group grow>
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
            <NumberInput
              label={
                <LabelWithTooltip 
                  label="Factor de conversión"
                  tooltip="Número total de unidades que contiene este empaque o presentación"
                />
              }
              value={factorConversion}
              onChange={setFactorConversion}
              placeholder="1"
              min={1}
              step={1}
              required
              size="md"
              allowDecimal={false}
            />
          </Group>

          {/* Sección de Atributos */}
          <Paper withBorder p="md" bg="gray.0">
            <Title order={5} mb="md">Atributos de la Presentación</Title>
            <Stack gap="md">
              <Group align="flex-end" gap="xs">
                <Select
                  placeholder="Seleccionar atributo"
                  data={atributos
                    .filter(attr => 
                      // Filtrar atributos que NO estén ya seleccionados
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
                    // Valores predefinidos según el tipo de atributo
                    ...(atributoTemporal === '1' ? [ // Color
                      { value: 'Rojo', label: 'Rojo' },
                      { value: 'Azul', label: 'Azul' },
                      { value: 'Verde', label: 'Verde' },
                      { value: 'Negro', label: 'Negro' },
                      { value: 'Blanco', label: 'Blanco' },
                    ] : []),
                    ...(atributoTemporal === '2' ? [ // Tamaño
                      { value: 'Pequeño', label: 'Pequeño' },
                      { value: 'Mediano', label: 'Mediano' },
                      { value: 'Grande', label: 'Grande' },
                    ] : []),
                    ...(atributoTemporal === '3' ? [ // Material
                      { value: 'Plástico', label: 'Plástico' },
                      { value: 'Metal', label: 'Metal' },
                      { value: 'Madera', label: 'Madera' },
                      { value: 'Papel', label: 'Papel' },
                    ] : []),
                    ...(atributoTemporal === '4' ? [ // Marca
                      { value: 'BIC', label: 'BIC' },
                      { value: 'Pilot', label: 'Pilot' },
                      { value: 'Faber-Castell', label: 'Faber-Castell' },
                    ] : []),
                    ...(atributoTemporal === '5' ? [ // Modelo
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

              {/* Mensaje informativo */}
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
            <Button variant="subtle" onClick={closePresentacionModal} size="md">
              Cancelar
            </Button>
            <Button 
              onClick={handleSavePresentacion} 
              disabled={!sku || !unidadSeleccionada || !precioVenta || !factorConversion}
              size="md"
            >
              {editingPresentacion ? "Actualizar" : "Crear"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}