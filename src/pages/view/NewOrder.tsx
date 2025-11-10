// src/pages/view/NewOrder.tsx
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

// Interfaces para Pedidos
interface Cliente {
  id_cliente: number;
  nombre: string;
  correo: string;
  telefono?: string;
  direccion?: string;
}

interface ProductoPedido {
  id_pedido_producto?: number;
  fk_presentacion_producto: number;
  cantidad: number;
  producto_nombre?: string;
  sku?: string;
  unidad_medida?: string;
  precio_venta?: number;
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

interface EstadoPedido {
  id_estado_pedido: number;
  descripcion: string;
}

interface PrioridadPedido {
  id_prioridad_pedido: number;
  descripcion: string;
}

// AGREGAR interfaz Pedido
interface Pedido {
  id_pedido: number;
  folio: string;
  fk_cliente: number;
  cliente_nombre: string;
  fecha_pedido: string;
  fk_estado_pedido: number;
  estado: string;
  fk_prioridad_pedido: number;
  prioridad: string;
  total: number;
  productos_count: number;
  created_at: string;
}

// AGREGAR props interface
interface NewOrderProps {
  pedidoId?: number;
  pedidoExistente?: Pedido;
}

export default function NewOrder({ pedidoId, pedidoExistente }: NewOrderProps) {
  const navigate = useNavigate();
  const params = useParams();
  const [productListModal, { open: openProductListModal, close: closeProductListModal }] = useDisclosure(false);
  const [newProductModal, { open: openNewProductModal, close: closeNewProductModal }] = useDisclosure(false);
  
  // Estados del formulario de pedido
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);
  const [fechaPedido, setFechaPedido] = useState(new Date().toISOString().split('T')[0]);
  const [estadoPedido, setEstadoPedido] = useState<string | null>(null);
  const [prioridadPedido, setPrioridadPedido] = useState<string | null>(null);
  const [productosPedido, setProductosPedido] = useState<ProductoPedido[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<string | null>(null);
  const [cantidadProducto, setCantidadProducto] = useState<number>(0);
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [cantidadEditando, setCantidadEditando] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<string | null>(null);

  // Estados para nuevo producto
  const [nombreBase, setNombreBase] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [sku, setSku] = useState('');
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<string | null>(null);
  const [precioVenta, setPrecioVenta] = useState<number | string>(0);
  const [factorConversion, setFactorConversion] = useState<number | string>(1);

  // AGREGAR estados para modo edición
  const [modoEdicion, setModoEdicion] = useState(!!pedidoId || !!params.id);
  const [pedidoOriginal, setPedidoOriginal] = useState<Pedido | null>(pedidoExistente || null);
  const [cargando, setCargando] = useState(false);

  // Datos de ejemplo para pedidos
  const [clientes] = useState<Cliente[]>([
    { id_cliente: 1, nombre: 'Empresa ABC SA de CV', correo: 'compras@empresaabc.com', telefono: '555-2001', direccion: 'Av. Principal #123' },
    { id_cliente: 2, nombre: 'Escuela Primaria Federal', correo: 'direccion@escuelafederal.edu.mx', telefono: '555-2002', direccion: 'Calle Secundaria #456' },
    { id_cliente: 3, nombre: 'Oficinas Gubernamentales', correo: 'almacen@gobierno.local', telefono: '555-2003', direccion: 'Plaza Central #789' }
  ]);

  const [estadosPedido] = useState<EstadoPedido[]>([
    { id_estado_pedido: 1, descripcion: 'Pendiente' },
    { id_estado_pedido: 2, descripcion: 'En Proceso' },
    { id_estado_pedido: 3, descripcion: 'Completado' },
    { id_estado_pedido: 4, descripcion: 'Cancelado' },
  ]);

  const [prioridadesPedido] = useState<PrioridadPedido[]>([
    { id_prioridad_pedido: 1, descripcion: 'Baja' },
    { id_prioridad_pedido: 2, descripcion: 'Media' },
    { id_prioridad_pedido: 3, descripcion: 'Alta' },
    { id_prioridad_pedido: 4, descripcion: 'Urgente' },
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
    {
      id_presentacion_producto: 3,
      sku: 'CUAD-NORMA-A4',
      fk_producto: 2,
      fk_unidad_medida: 1,
      factor_conversion: 1,
      precio_venta: 45.00,
      unidad_nombre: 'Pieza',
      producto_nombre: 'Cuaderno',
      stock_actual: 15
    },
  ]);

  // AGREGAR useEffect para modo edición
  useEffect(() => {
    const idPedido = pedidoId || (params.id ? parseInt(params.id) : undefined);
    
    if (idPedido && !pedidoExistente) {
      cargarPedidoExistente(idPedido);
    } else if (pedidoExistente) {
      setPedidoOriginal(pedidoExistente);
      precargarDatosFormulario(pedidoExistente);
    }
  }, [pedidoId, params.id, pedidoExistente]);

  // AGREGAR función para cargar pedido existente
  const cargarPedidoExistente = async (id: number) => {
    setCargando(true);
    try {
      // Simulación - reemplazar con API real
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const pedidoCargado: Pedido = {
        id_pedido: id,
        folio: `PED-2024-00${id}`,
        fk_cliente: 1,
        cliente_nombre: 'Empresa ABC SA de CV',
        fecha_pedido: '2024-01-15',
        fk_estado_pedido: 1,
        estado: 'Pendiente',
        fk_prioridad_pedido: 3,
        prioridad: 'Alta',
        total: 2450.00,
        productos_count: 2,
        created_at: '2024-01-15T10:30:00'
      };
      
      setPedidoOriginal(pedidoCargado);
      precargarDatosFormulario(pedidoCargado);
      
      // Cargar productos del pedido
      const productosCargados: ProductoPedido[] = [
        {
          id_pedido_producto: 1,
          fk_presentacion_producto: 1,
          cantidad: 100,
          producto_nombre: 'Bolígrafo BIC Azul (BOL-BIC-AZUL)',
          sku: 'BOL-BIC-AZUL',
          unidad_medida: 'Pieza',
          precio_venta: 5.50
        },
        {
          id_pedido_producto: 2,
          fk_presentacion_producto: 3,
          cantidad: 50,
          producto_nombre: 'Cuaderno Norma A4 (CUAD-NORMA-A4)',
          sku: 'CUAD-NORMA-A4',
          unidad_medida: 'Pieza',
          precio_venta: 45.00
        }
      ];
      
      setProductosPedido(productosCargados);
      
    } catch (error) {
      console.error('Error cargando pedido:', error);
      alert('Error al cargar el pedido');
    } finally {
      setCargando(false);
    }
  };

  const precargarDatosFormulario = (pedido: Pedido) => {
    setClienteSeleccionado(pedido.fk_cliente.toString());
    setFechaPedido(pedido.fecha_pedido);
    setEstadoPedido(pedido.fk_estado_pedido.toString());
    setPrioridadPedido(pedido.fk_prioridad_pedido.toString());
  };

  // Función para obtener estado del stock
  const getStockStatus = (stock: number): { color: string; label: string } => {
    if (stock === 0) return { color: 'red', label: 'Sin Stock' };
    if (stock < 10) return { color: 'orange', label: 'Bajo' };
    if (stock < 50) return { color: 'yellow', label: 'Medio' };
    return { color: 'green', label: 'Alto' };
  };

  // Funciones para el pedido
  const calcularTotalPedido = () => {
    return productosPedido.reduce((total, producto) => {
      const precio = producto.precio_venta || 0;
      return total + (producto.cantidad * precio);
    }, 0);
  };

  const agregarProducto = () => {
    if (!productoSeleccionado || cantidadProducto <= 0) {
      alert('Por favor seleccione un producto y especifique la cantidad');
      return;
    }

    const producto = presentaciones.find(p => p.id_presentacion_producto === Number(productoSeleccionado));
    if (!producto) return;

    const productoExistenteIndex = productosPedido.findIndex(
      p => p.fk_presentacion_producto === Number(productoSeleccionado)
    );

    if (productoExistenteIndex !== -1) {
      const nuevosProductos = [...productosPedido];
      nuevosProductos[productoExistenteIndex] = {
        ...nuevosProductos[productoExistenteIndex],
        cantidad: cantidadProducto,
      };
      setProductosPedido(nuevosProductos);
    } else {
      const nuevoProducto: ProductoPedido = {
        fk_presentacion_producto: Number(productoSeleccionado),
        cantidad: cantidadProducto,
        producto_nombre: `${producto.producto_nombre} (${producto.sku})`,
        sku: producto.sku,
        unidad_medida: producto.unidad_nombre,
        precio_venta: producto.precio_venta
      };

      setProductosPedido([...productosPedido, nuevoProducto]);
    }
    
    setProductoSeleccionado(null);
    setCantidadProducto(0);
  };

  const eliminarProducto = (index: number) => {
    const nuevosProductos = [...productosPedido];
    nuevosProductos.splice(index, 1);
    setProductosPedido(nuevosProductos);
  };

  const iniciarEdicion = (index: number) => {
    setEditandoIndex(index);
    setCantidadEditando(productosPedido[index].cantidad);
  };

  const cancelarEdicion = () => {
    setEditandoIndex(null);
    setCantidadEditando(0);
  };

  const guardarEdicion = (index: number) => {
    if (cantidadEditando <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    const nuevosProductos = [...productosPedido];
    nuevosProductos[index] = {
      ...nuevosProductos[index],
      cantidad: cantidadEditando,
    };

    setProductosPedido(nuevosProductos);
    cancelarEdicion();
  };

  // MODIFICAR handleRegistrarPedido para soportar edición
  const handleRegistrarPedido = () => {
    if (!clienteSeleccionado || !estadoPedido || !prioridadPedido || productosPedido.length === 0) {
      alert('Por favor complete todos los campos obligatorios y agregue al menos un producto');
      return;
    }

    if (modoEdicion) {
      handleActualizarPedido();
    } else {
      handleCrearNuevoPedido();
    }
  };

  // AGREGAR funciones para crear y actualizar
  const handleCrearNuevoPedido = () => {
    // Aquí iría la lógica para guardar el pedido en la base de datos
    alert('Pedido registrado exitosamente');
    navigate('..');
  };

  const handleActualizarPedido = () => {
    const id = pedidoId || (params.id ? parseInt(params.id) : 0);
    
    if (!id) return;
    
    // Aquí iría la lógica para actualizar el pedido en la base de datos
    alert('Pedido actualizado exitosamente');
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

  // Función para filtrar presentaciones
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
    
    alert('Producto creado exitosamente. Ahora puedes agregarlo a tu pedido.');
  };

  // AGREGAR variables para textos dinámicos
  const tituloPagina = modoEdicion ? 'Editar Pedido' : 'Registrar Nuevo Pedido';
  const textoBoton = modoEdicion ? 'Actualizar Pedido' : 'Registrar Pedido';
  const descripcionPagina = modoEdicion 
    ? 'Modifique la información del pedido del cliente' 
    : 'Complete la información del pedido del cliente';

  return (
    <Container size="xl">
      <Stack gap="md">
        {/* Header - MODIFICADO para modo edición */}
        <Paper withBorder p="md" shadow="xs" style={{ flexShrink: 0 }}>
          <Group justify="space-between" align="flex-start">
            <div>
              <Group>
                <ActionIcon
                  variant="subtle"
                  onClick={() => navigate('/dashboard/pedidos')}
                  size="lg"
                >
                  <IconArrowLeft size="1.2rem" />
                </ActionIcon>
                <Title order={3}>{tituloPagina}</Title>
                {modoEdicion && (
                  <Badge color="blue" variant="light">
                    Editando: {pedidoOriginal?.folio || `PED-${params.id}`}
                  </Badge>
                )}
              </Group>
              <Text c="dimmed" size="sm" mt={4}>
                {descripcionPagina}
              </Text>
              
              <Breadcrumbs separator={<IconChevronRight size="1rem" />} mt="sm">
                <Anchor
                  href="/dashboard/pedidos"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/dashboard/pedidos');
                  }}
                  c="blue"
                  style={{ cursor: 'pointer', fontSize: '14px' }}
                >
                  Pedidos
                </Anchor>
                <Anchor
                  href="#"
                  c="dimmed"
                  style={{ fontSize: '14px' }}
                  onClick={(e) => e.preventDefault()}
                >
                  {modoEdicion ? 'Editar Pedido' : 'Nuevo Pedido'}
                </Anchor>
              </Breadcrumbs>
            </div>
            
            {/* AGREGAR indicador de carga */}
            {cargando && (
              <Badge color="yellow" variant="light">
                Cargando...
              </Badge>
            )}
          </Group>
        </Paper>

        {/* Información General del Pedido */}
        <Paper withBorder p="md" shadow="xs">
          <Title order={4} mb="md">Información del Pedido</Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Cliente"
                placeholder="Selecciona un cliente"
                data={clientes.map(cliente => ({
                  value: cliente.id_cliente.toString(),
                  label: cliente.nombre
                }))}
                value={clienteSeleccionado}
                onChange={setClienteSeleccionado}
                required
                size="md"
                disabled={cargando}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Fecha del Pedido"
                type="date"
                value={fechaPedido}
                onChange={(e) => setFechaPedido(e.target.value)}
                size="md"
                disabled={cargando}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Estado del Pedido"
                placeholder="Selecciona un estado"
                data={estadosPedido.map(estado => ({
                  value: estado.id_estado_pedido.toString(),
                  label: estado.descripcion
                }))}
                value={estadoPedido}
                onChange={setEstadoPedido}
                required
                size="md"
                disabled={cargando}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Prioridad"
                placeholder="Selecciona una prioridad"
                data={prioridadesPedido.map(prioridad => ({
                  value: prioridad.id_prioridad_pedido.toString(),
                  label: prioridad.descripcion
                }))}
                value={prioridadPedido}
                onChange={setPrioridadPedido}
                required
                size="md"
                disabled={cargando}
              />
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Agregar Productos al Pedido */}
        <Paper withBorder p="md" shadow="xs">
          <Title order={4} mb="md">Productos del Pedido</Title>
          
          {/* Selección de Productos */}
          <Paper withBorder p="md" mb="md">
            <Text fw={600} mb="md">Seleccionar Producto</Text>
            <Grid align="flex-end">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="Producto"
                  placeholder="Escribe para buscar producto..."
                  data={presentaciones.map(prod => ({
                    value: prod.id_presentacion_producto.toString(),
                    label: `${prod.producto_nombre} (${prod.sku}) - Stock: ${prod.stock_actual} - $${prod.precio_venta}`
                  }))}
                  value={productoSeleccionado}
                  onChange={setProductoSeleccionado}
                  searchable
                  clearable
                  nothingFoundMessage="No se encontraron productos..."
                  size="md"
                  disabled={cargando}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <NumberInput
                  label="Cantidad"
                  placeholder="0"
                  value={cantidadProducto}
                  onChange={(value) => setCantidadProducto(Number(value))}
                  min={1}
                  size="md"
                  disabled={cargando}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 2 }}>
                <Box style={{ display: 'flex', height: '100%', alignItems: 'flex-end' }}>
                  <Button 
                    onClick={agregarProducto} 
                    disabled={!productoSeleccionado || !cantidadProducto || cargando}
                    fullWidth
                    size="md"
                  >
                    Agregar
                  </Button>
                </Box>
              </Grid.Col>
            </Grid>
            
            <Group mt="md">
              <Button 
                variant="light" 
                leftSection={<IconListDetails size="1rem" />}
                onClick={openProductListModal}
                size="sm"
                disabled={cargando}
              >
                Ver Lista Completa de Productos
              </Button>
            </Group>
          </Paper>

          {/* Lista de Productos Agregados al Pedido */}
          {productosPedido.length > 0 && (
            <Paper withBorder p="md">
              <Text fw={600} mb="md">Productos en el Pedido</Text>
              <Stack gap="sm">
                {productosPedido.map((producto, index) => (
                  <Group key={index} justify="space-between" p="sm" bg="gray.0">
                    <Box style={{ flex: 2 }}>
                      <Text fw={500}>{producto.producto_nombre}</Text>
                      <Text size="sm" c="dimmed">SKU: {producto.sku}</Text>
                      <Text size="sm" c="blue">Precio: ${producto.precio_venta?.toFixed(2)}</Text>
                    </Box>
                    
                    {editandoIndex === index ? (
                      // Modo edición
                      <>
                        <NumberInput
                          value={cantidadEditando}
                          onChange={(value) => setCantidadEditando(Number(value))}
                          min={1}
                          size="sm"
                          style={{ width: '100px' }}
                          disabled={cargando}
                        />
                        <Text>{producto.unidad_medida}</Text>
                        <Text fw={600}>
                          ${((producto.precio_venta || 0) * cantidadEditando).toFixed(2)}
                        </Text>
                        <Group gap="xs">
                          <ActionIcon 
                            color="green" 
                            variant="subtle"
                            onClick={() => guardarEdicion(index)}
                            disabled={cargando}
                          >
                            <IconCheck size="1rem" />
                          </ActionIcon>
                          <ActionIcon 
                            color="gray" 
                            variant="subtle"
                            onClick={cancelarEdicion}
                            disabled={cargando}
                          >
                            <IconX size="1rem" />
                          </ActionIcon>
                        </Group>
                      </>
                    ) : (
                      // Modo visualización
                      <>
                        <Text>{producto.cantidad} {producto.unidad_medida}</Text>
                        <Text fw={600}>${((producto.precio_venta || 0) * producto.cantidad).toFixed(2)}</Text>
                        <Group gap="xs">
                          <ActionIcon 
                            color="blue" 
                            variant="subtle"
                            onClick={() => iniciarEdicion(index)}
                            disabled={cargando}
                          >
                            <IconEdit size="1rem" />
                          </ActionIcon>
                          <ActionIcon 
                            color="red" 
                            variant="subtle"
                            onClick={() => eliminarProducto(index)}
                            disabled={cargando}
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
                  <Text fw={700} size="lg">Total del Pedido:</Text>
                  <Text fw={700} size="xl">${calcularTotalPedido().toFixed(2)}</Text>
                </Group>
              </Paper>
            </Paper>
          )}
        </Paper>

        {/* Botones de Acción - MODIFICADO para modo edición */}
        <Group justify="flex-end" gap="xs">
          <Button 
            variant="subtle" 
            onClick={() => navigate('/dashboard/pedidos')}
            size="md"
            disabled={cargando}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleRegistrarPedido} 
            disabled={!clienteSeleccionado || !estadoPedido || !prioridadPedido || productosPedido.length === 0 || cargando}
            loading={cargando}
            size="md"
          >
            {textoBoton}
          </Button>
        </Group>
      </Stack>

      {/* Modal de Lista Completa de Productos */}
      <Modal
        opened={productListModal}
        onClose={closeProductListModal}
        title={<Title order={4}>Lista Completa de Productos</Title>}
        size="90%"
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
              disabled={cargando}
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
              disabled={cargando}
            />
            
            <Button 
              variant="subtle" 
              onClick={() => {
                setSearchTerm('');
                setStockFilter(null);
              }}
              size="md"
              disabled={cargando}
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
              disabled={cargando}
            >
              Agregar Producto
            </Button>
          </Group>

          {/* Tabla de productos */}
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
                        <Text>{producto.stock_actual}</Text>
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
                          disabled={cargando}
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
                disabled={cargando}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Descripción"
                value={descripcion}
                onChange={(event) => setDescripcion(event.currentTarget.value)}
                placeholder="Descripción del producto..."
                size="md"
                disabled={cargando}
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
                disabled={cargando}
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
                disabled={cargando}
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
                disabled={cargando}
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
                disabled={cargando}
              />
            </Grid.Col>
          </Grid>

          <Group justify="flex-end" gap="xs">
            <Button variant="subtle" onClick={closeNewProductModal} size="md" disabled={cargando}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveNewProduct}
              disabled={!nombreBase || !sku || !unidadSeleccionada || !precioVenta || cargando}
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