// src/components/orders/OrderForm.tsx
import { useState, useEffect } from 'react';
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
  Alert,
  Tooltip,
  Loader,
  Center,
} from '@mantine/core';
import { 
  IconPlus, 
  IconSearch,
  IconEdit,    
  IconCheck,  
  IconInfoCircle,
  IconTrash,
  IconArrowLeft,
  IconListDetails,
  IconChevronRight,
  IconFileDownload,
  IconAlertCircle,
  IconTruckDelivery,
  IconEye,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';

import type {
  Cliente,
  ProductoPedido,
  PresentacionProducto,
  Producto,
  Atributo,
  AtributoProducto,
  EstadoPedido,
  PrioridadPedido,
  Pedido
} from '../../types/orders.types';

interface OrderFormProps {
  pedidoId?: number;
  pedidoExistente?: Pedido;
}

export default function OrderForm({ pedidoId, pedidoExistente }: OrderFormProps) {
  const navigate = useNavigate();
  const [productListModal, { open: openProductListModal, close: closeProductListModal }] = useDisclosure(false);
  const [newProductModal, { open: openNewProductModal, close: closeNewProductModal }] = useDisclosure(false);
  const [cancelAlert, { open: openCancelAlert, close: closeCancelAlert }] = useDisclosure(false);
  const [deliverAlert, { open: openDeliverAlert, close: closeDeliverAlert }] = useDisclosure(false);
  const [editProductModal, { open: openEditProductModal, close: closeEditProductModal }] = useDisclosure(false);
  const [saveAlert, { open: openSaveAlert, close: closeSaveAlert }] = useDisclosure(false);
  const [deleteProductAlert, { open: openDeleteProductAlert, close: closeDeleteProductAlert }] = useDisclosure(false);
  const [detailModalOpened, { open: openDetailModal, close: closeDetailModal }] = useDisclosure(false);
  const [selectedPresentacion, setSelectedPresentacion] = useState<PresentacionProducto | null>(null);
  
  // Estados del formulario de pedido
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string | null>(null);
  const [fechaPedido, setFechaPedido] = useState(new Date().toISOString().split('T')[0]);
  const [fechaEntregaEstimada, setFechaEntregaEstimada] = useState('');
  const [estadoPedido, setEstadoPedido] = useState<string | null>('1');
  const [prioridadPedido, setPrioridadPedido] = useState<string | null>(null);
  const [productosPedido, setProductosPedido] = useState<ProductoPedido[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<string | null>(null);
  const [cantidadProducto, setCantidadProducto] = useState<number>(0);
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [cantidadEditando, setCantidadEditando] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<string | null>(null);
  const [marcaFilter, setMarcaFilter] = useState<string | null>(null);
  const [filtrosAplicados, setFiltrosAplicados] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState<number | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [applyingFilters, setApplyingFilters] = useState(false);

  // Estados para nuevo producto
  const [atributosSeleccionados, setAtributosSeleccionados] = useState<{id_atributo: number, valor: string}[]>([]);
  const [atributoTemporal, setAtributoTemporal] = useState<string | null>(null);
  const [valorAtributoTemporal, setValorAtributoTemporal] = useState('');

  // Estados para modo edición
  const [modoEdicion, setModoEdicion] = useState(!!pedidoId);
  const [pedidoOriginal, setPedidoOriginal] = useState<Pedido | null>(pedidoExistente || null);
  const [cargando, setCargando] = useState(false);

  // Formularios con validaciones Mantine
  const pedidoForm = useForm({
    initialValues: {
      cliente: '',
      fechaEntrega: '',
      estado: '1',
      prioridad: '',
    },
    validate: {
      cliente: (value) => {
        if (!value) {
          return 'El cliente es requerido';
        }
        return null;
      },
      prioridad: (value) => {
        if (!value) {
          return 'La prioridad es requerida';
        }
        return null;
      },
      fechaEntrega: (value) => {
        if (!value) {
          return 'La fecha de entrega estimada es requerida';
        }
        return null;
      },
    },
  });

  const productoForm = useForm({
    initialValues: {
      producto: '',
      cantidad: 0,
    },
    validate: {
      producto: (value) => {
        if (!value) {
          return 'El producto es requerido';
        }
        return null;
      },
      cantidad: (value) => {
        if (value <= 0) {
          return 'La cantidad debe ser mayor a 0';
        }
        return null;
      },
    },
  });

  const editCantidadForm = useForm({
    initialValues: {
      cantidad: 0,
    },
    validate: {
      cantidad: (value) => {
        if (value <= 0) {
          return 'La cantidad debe ser mayor a 0';
        }
        return null;
      },
    },
  });

  const newProductForm = useForm({
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
        
        // Verificar si ya existe un SKU
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

  // Datos de ejemplo para pedidos
  const [clientes] = useState<Cliente[]>([
    { id_cliente: 1, nombre: 'Empresa ABC SA de CV', correo: 'compras@empresaabc.com', telefono: '555-2001', direccion: 'Av. Principal #123' },
    { id_cliente: 2, nombre: 'Escuela Primaria Federal', correo: 'direccion@escuelafederal.edu.mx', telefono: '555-2002', direccion: 'Calle Secundaria #456' },
    { id_cliente: 3, nombre: 'Oficinas Gubernamentales', correo: 'almacen@gobierno.local', telefono: '555-2003', direccion: 'Plaza Central #789' }
  ]);

  const [estadosPedido] = useState<EstadoPedido[]>([
    { id_estado_pedido: 1, descripcion: 'Pendiente', color: 'yellow' },
    { id_estado_pedido: 2, descripcion: 'Listo para entregar', color: 'blue' },
    { id_estado_pedido: 3, descripcion: 'Entregado', color: 'green' },
  ]);

  const [prioridadesPedido] = useState<PrioridadPedido[]>([
    { id_prioridad_pedido: 1, descripcion: 'Normal', color: 'blue' },
    { id_prioridad_pedido: 2, descripcion: 'Urgente', color: 'red' },
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
      nombre_base: 'Bolígrafo BIC Azul',
      descripcion: 'Bolígrafo de tinta azul, punta media, material plástico',
      marca: 'BIC',
      existencia: 45,
      atributos: [
        { id_atributo: 4, nombre: 'Marca', valor: 'BIC' },
        { id_atributo: 1, nombre: 'Color', valor: 'Azul' }
      ]
    },
    { 
      id_producto: 2, 
      nombre_base: 'Bolígrafo BIC Negro',
      descripcion: 'Bolígrafo de tinta negra, punta fina, material plástico',
      marca: 'BIC',
      existencia: 32,
      atributos: [
        { id_atributo: 4, nombre: 'Marca', valor: 'BIC' },
        { id_atributo: 1, nombre: 'Color', valor: 'Negro' }
      ]
    },
    { 
      id_producto: 3, 
      nombre_base: 'Cuaderno Profesional 100H',
      descripcion: 'Cuaderno de 100 hojas, pasta dura, rayado',
      marca: 'Norma',
      existencia: 15,
      atributos: [
        { id_atributo: 4, nombre: 'Marca', valor: 'Norma' },
        { id_atributo: 2, nombre: 'Tamaño', valor: 'A4' }
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
      producto_nombre: 'Bolígrafo BIC Azul',
      stock_actual: 45,
      atributos: [
        { id_atributo: 1, nombre: 'Color', valor: 'Azul' },
        { id_atributo: 3, nombre: 'Material', valor: 'Plástico' }
      ]
    },
    {
      id_presentacion_producto: 2,
      sku: 'BOL-BIC-NEGRO',
      fk_producto: 2,
      fk_unidad_medida: 1,
      factor_conversion: 1,
      precio_venta: 5.50,
      unidad_nombre: 'Pieza',
      producto_nombre: 'Bolígrafo BIC Negro',
      stock_actual: 32,
      atributos: [
        { id_atributo: 1, nombre: 'Color', valor: 'Negro' },
        { id_atributo: 3, nombre: 'Material', valor: 'Plástico' }
      ]
    },
    {
      id_presentacion_producto: 3,
      sku: 'CUAD-NORMA-A4',
      fk_producto: 3,
      fk_unidad_medida: 1,
      factor_conversion: 1,
      precio_venta: 45.00,
      unidad_nombre: 'Pieza',
      producto_nombre: 'Cuaderno Profesional 100H',
      stock_actual: 15,
      atributos: [
        { id_atributo: 4, nombre: 'Marca', valor: 'Norma' },
        { id_atributo: 2, nombre: 'Tamaño', valor: 'A4' }
      ]
    },
  ]);

  // Obtener marcas únicas para los filtros
  const marcasUnicas = [...new Set(productos.map(p => p.marca).filter(Boolean))] as string[];
  const marcasDisponibles = marcasUnicas.map(marca => ({
    value: marca,
    label: marca
  }));

  // AGREGAR useEffect para modo edición
  useEffect(() => {
    if (pedidoId && !pedidoExistente) {
      cargarPedidoExistente(pedidoId);
    } else if (pedidoExistente) {
      setPedidoOriginal(pedidoExistente);
      precargarDatosFormulario(pedidoExistente);
    }
  }, [pedidoId, pedidoExistente]);

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
        fecha_entrega_estimada: '2024-01-20',
        fk_estado_pedido: 1,
        estado: 'Pendiente',
        fk_prioridad_pedido: 1,
        prioridad: 'Normal',
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
          producto_nombre: 'Cuaderno Profesional 100H (CUAD-NORMA-A4)',
          sku: 'CUAD-NORMA-A4',
          unidad_medida: 'Pieza',
          precio_venta: 45.00
        }
      ];
      
      setProductosPedido(productosCargados);
      
    } catch (error) {
      console.error('Error cargando pedido:', error);
      notifications.show({
        title: 'Error',
        message: 'Error al cargar el pedido',
        color: 'red',
      });
    } finally {
      setCargando(false);
    }
  };

  const precargarDatosFormulario = (pedido: Pedido) => {
    setClienteSeleccionado(pedido.fk_cliente.toString());
    setFechaEntregaEstimada(pedido.fecha_entrega_estimada);
    setEstadoPedido(pedido.fk_estado_pedido.toString());
    setPrioridadPedido(pedido.fk_prioridad_pedido.toString());
    
    pedidoForm.setValues({
      cliente: pedido.fk_cliente.toString(),
      fechaEntrega: pedido.fecha_entrega_estimada,
      estado: pedido.fk_estado_pedido.toString(),
      prioridad: pedido.fk_prioridad_pedido.toString(),
    });
  };

  // Función para obtener estado del stock
  const getStockStatus = (stock: number): { color: string; label: string } => {
    if (stock === 0) return { color: 'red', label: 'Sin Stock' };
    if (stock < 10) return { color: 'orange', label: 'Bajo' };
    if (stock < 50) return { color: 'yellow', label: 'Medio' };
    return { color: 'green', label: 'Alto' };
  };

  const handleVerDetalles = (presentacion: PresentacionProducto) => {
    setSelectedPresentacion(presentacion);
    openDetailModal();
  };

  // AGREGAR funciones para atributos
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

  // Funciones para el pedido
  const calcularTotalPedido = () => {
    return productosPedido.reduce((total, producto) => {
      const precio = producto.precio_venta || 0;
      return total + (producto.cantidad * precio);
    }, 0);
  };

  const agregarProducto = () => {
    // Validar el formulario
    const validation = productoForm.validate();
    if (validation.hasErrors) {
      return;
    }

    if (!productoSeleccionado || cantidadProducto <= 0) {
      openSaveAlert();
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
    productoForm.reset();
  };

  const eliminarProducto = (index: number) => {
    setProductoAEliminar(index);
    openDeleteProductAlert();
  };

  const confirmarEliminarProducto = () => {
    if (productoAEliminar === null) return;
    
    const nuevosProductos = [...productosPedido];
    nuevosProductos.splice(productoAEliminar, 1);
    setProductosPedido(nuevosProductos);
    
    setProductoAEliminar(null);
    closeDeleteProductAlert();
  };

  // MODIFICADA: Función para abrir modal de edición
  const abrirModalEdicion = (index: number) => {
    setEditandoIndex(index);
    setCantidadEditando(productosPedido[index].cantidad);
    editCantidadForm.setValues({ cantidad: productosPedido[index].cantidad });
    openEditProductModal();
  };

  // MODIFICADA: Función para guardar edición desde modal
  const guardarEdicionModal = (values: { cantidad: number }) => {
    // Validar el formulario
    const validation = editCantidadForm.validate();
    if (validation.hasErrors) {
      return;
    }

    if (editandoIndex === null || values.cantidad <= 0) {
      notifications.show({
        title: 'Error',
        message: 'La cantidad debe ser mayor a 0',
        color: 'red',
      });
      return;
    }

    const nuevosProductos = [...productosPedido];
    nuevosProductos[editandoIndex] = {
      ...nuevosProductos[editandoIndex],
      cantidad: values.cantidad,
    };

    setProductosPedido(nuevosProductos);
    setEditandoIndex(null);
    setCantidadEditando(0);
    closeEditProductModal();
  };

  // MODIFICADA: Función para verificar si se está cambiando a estado "Entregado"
  const verificarCambioAEntregado = (): boolean => {
    const estadoAnterior = pedidoOriginal?.fk_estado_pedido || 1;
    const estadoNuevo = parseInt(estadoPedido || '1');
    
    // Si el estado anterior no era "Entregado" y el nuevo estado es "Entregado"
    return estadoAnterior !== 3 && estadoNuevo === 3;
  };

  // MODIFICADA: handleRegistrarPedido para soportar confirmación de entrega
  const handleRegistrarPedido = () => {
    // Validar el formulario principal
    const validation = pedidoForm.validate();
    if (validation.hasErrors) {
      return;
    }

    if (productosPedido.length === 0) {
      notifications.show({
        title: 'Error',
        message: 'Debes agregar al menos un producto al pedido',
        color: 'red',
      });
      return;
    }

    // Si se está cambiando a estado "Entregado", mostrar confirmación
    if (modoEdicion && verificarCambioAEntregado()) {
      openDeliverAlert();
      return;
    }

    // Si no hay cambio a entregado, proceder normalmente
    if (modoEdicion) {
      handleActualizarPedido();
    } else {
      handleCrearNuevoPedido();
    }

    navigate('/dashboard/pedidos');
  };

  // AGREGAR funciones para crear y actualizar
  const handleCrearNuevoPedido = () => {
    // Aquí iría la lógica para guardar el pedido en la base de datos
    notifications.show({
      title: 'Pedido registrado',
      message: 'El pedido se ha registrado exitosamente',
      color: 'green',
    });
    navigate('/dashboard/pedidos');
  };

  const handleActualizarPedido = () => {
    const id = pedidoId || 0;
    
    if (!id) return;

    // Aquí iría la lógica para actualizar el pedido en la base de datos
    notifications.show({
      title: 'Pedido actualizado',
      message: 'Los cambios se han guardado exitosamente',
      color: 'green',
    });
    
    // SOLO navegar a la página anterior si el estado es "Entregado"
    const estadoNuevo = parseInt(estadoPedido || '1');
    if (estadoNuevo === 3) {
      navigate('/dashboard/pedidos');
    }
  };

  // MODIFICADA: Función para entregar pedido (ahora se llama desde la confirmación)
  const handleEntregarPedido = () => {
    const id = pedidoId || 0;
    
    if (!id) return;
    
    // Aquí iría la lógica para marcar el pedido como entregado
    notifications.show({
      title: 'Pedido entregado',
      message: 'El pedido ha sido marcado como entregado',
      color: 'green',
    });
    closeDeliverAlert();
    navigate('/dashboard/pedidos');
  };

  // MODIFICADA: Función para cancelar - solo navega hacia atrás
  const handleCancelar = () => {
    navigate('/dashboard/pedidos');
  };

  // MODIFICAR resetNewProductForm para incluir atributos
  const resetNewProductForm = () => {
    newProductForm.reset();
    setAtributosSeleccionados([]);
    setAtributoTemporal(null);
    setValorAtributoTemporal('');
  };

  // Función para filtrar presentaciones CON LOADER
  const [filteredPresentaciones, setFilteredPresentaciones] = useState<PresentacionProducto[]>(presentaciones);

  const aplicarFiltros = async () => {
    // Si todos los filtros están vacíos, no hace nada
    if (!searchTerm.trim() && !stockFilter && !marcaFilter) {
      return;
    }

    setApplyingFilters(true);
    // Simular carga
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const resultados = presentaciones.filter(pres => {
      const searchLower = searchTerm.toLowerCase();
      const productoBase = productos.find(p => p.id_producto === pres.fk_producto);
      
      const matchesSearch = searchTerm === '' || 
        pres.sku.toLowerCase().includes(searchLower) ||
        pres.producto_nombre?.toLowerCase().includes(searchLower) ||
        productoBase?.nombre_base.toLowerCase().includes(searchLower) ||
        productoBase?.descripcion.toLowerCase().includes(searchLower);
      
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
    
    setFilteredPresentaciones(resultados);
    setApplyingFilters(false);
  };

  // Función para limpiar filtros CON LOADER
  const limpiarFiltros = async () => {
    setSearchTerm('');
    setStockFilter(null);
    setMarcaFilter(null);
    setApplyingFilters(true);
    
    // Simular carga
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setFilteredPresentaciones(presentaciones);
    setApplyingFilters(false);
  };

  // MODIFICAR handleSaveNewProduct para eliminar factor_conversion
  const handleSaveNewProduct = (values: typeof newProductForm.values) => {
    // Validación manual adicional
    const validation = newProductForm.validate();
    if (validation.hasErrors) {
      return;
    }

    // Convertir atributosSeleccionados al formato correcto
    const atributosCompletos: AtributoProducto[] = atributosSeleccionados.map(attr => {
      const atributoInfo = atributos.find(a => a.id_atributo === attr.id_atributo);
      return {
        id_atributo: attr.id_atributo,
        nombre: atributoInfo?.nombre || 'Atributo',
        valor: attr.valor
      };
    });

    // Crear nuevo producto base
    const nuevoProductoId = Math.max(...productos.map(p => p.id_producto), 0) + 1;
    const nuevoProducto: Producto = {
      id_producto: nuevoProductoId,
      nombre_base: values.nombre_base.trim(),
      descripcion: values.descripcion.trim(),
      marca: values.marca || undefined,
      existencia: Number(values.existencia),
      atributos: atributosCompletos
    };

    // Crear nueva presentación
    const nuevaPresentacionId = Math.max(...presentaciones.map(p => p.id_presentacion_producto), 0) + 1;
    const nuevaPresentacion: PresentacionProducto = {
      id_presentacion_producto: nuevaPresentacionId,
      sku: values.sku.trim().toUpperCase(),
      fk_producto: nuevoProductoId,
      fk_unidad_medida: parseInt(values.unidad_medida),
      precio_venta: Number(values.precio_venta),
      factor_conversion: 1,
      unidad_nombre: unidades.find(u => u.id_unidad === parseInt(values.unidad_medida))?.nombre,
      producto_nombre: values.nombre_base.trim(),
      stock_actual: Number(values.existencia),
      atributos: atributosCompletos
    };

    // Actualizar estados
    setProductos([nuevoProducto, ...productos]);
    setPresentaciones([nuevaPresentacion, ...presentaciones]);

    // Seleccionar automáticamente el nuevo producto
    setProductoSeleccionado(nuevaPresentacionId.toString());

    // Limpiar formulario y cerrar modal
    resetNewProductForm();
    closeNewProductModal();
    
    notifications.show({
      title: 'Producto creado',
      message: 'El producto se ha creado exitosamente. Ahora puedes agregarlo a tu pedido.',
      color: 'green',
    });
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
          <Group justify="space-between" align="center">
            <div>
              <Group>
                <ActionIcon
                  variant="subtle"
                  onClick={() => navigate('/dashboard/pedidos')}
                  size="lg"
                >
                  <IconArrowLeft size="1.2rem" />
                </ActionIcon>
                <Title order={3}>
                  {modoEdicion 
                    ? `Editar Pedido #${pedidoOriginal?.folio || `PED-${pedidoId}`}`
                    : tituloPagina
                  }
                </Title>
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
                onChange={(value) => {
                  setClienteSeleccionado(value);
                  pedidoForm.setFieldValue('cliente', value || '');
                }}
                size="md"
                withAsterisk
                error={pedidoForm.errors.cliente}
                errorProps={{ style: { marginTop: '4px' } }}
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
                disabled
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Fecha estimada de entrega"
                type="date"
                value={fechaEntregaEstimada}
                onChange={(e) => {
                  setFechaEntregaEstimada(e.target.value);
                  pedidoForm.setFieldValue('fechaEntrega', e.target.value);
                }}
                size="md"
                withAsterisk
                error={pedidoForm.errors.fechaEntrega}
                errorProps={{ style: { marginTop: '4px' } }}
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
                onChange={(value) => {
                  setEstadoPedido(value);
                  pedidoForm.setFieldValue('estado', value || '');
                }}
                size="md"
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
                onChange={(value) => {
                  setPrioridadPedido(value);
                  pedidoForm.setFieldValue('prioridad', value || '');
                }}
                size="md"
                withAsterisk
                error={pedidoForm.errors.prioridad}
                errorProps={{ style: { marginTop: '4px' } }}
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
              <Grid.Col span={{ base: 12, md: 5 }}>
                <Select
                  label="Producto"
                  placeholder="Escribe para buscar producto..."
                  data={presentaciones.map(prod => ({
                    value: prod.id_presentacion_producto.toString(),
                    label: `${prod.producto_nombre} (${prod.sku}) - Stock: ${prod.stock_actual}`
                  }))}
                  value={productoSeleccionado}
                  onChange={(value) => {
                    setProductoSeleccionado(value);
                    productoForm.setFieldValue('producto', value || '');
                  }}
                  searchable
                  clearable
                  nothingFoundMessage="No se encontraron productos..."
                  size="md"
                  withAsterisk
                  error={undefined}
                  disabled={cargando}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <NumberInput
                  label="Cantidad"
                  placeholder="0"
                  value={cantidadProducto}
                  onChange={(value) => {
                    setCantidadProducto(Number(value));
                    productoForm.setFieldValue('cantidad', Number(value));
                  }}
                  min={1}
                  size="md"
                  withAsterisk
                  error={undefined}
                  disabled={cargando}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 3 }}>
                <Box style={{ display: 'flex', height: '100%', alignItems: 'flex-end' }}>
                  <Button 
                    onClick={agregarProducto} 
                    disabled={cargando}
                    fullWidth
                    size="md"
                  >
                    Agregar
                  </Button>
                </Box>
              </Grid.Col>
            </Grid>
            
            {/* ERRORES FUERA DEL GRID */}
            {(productoForm.errors.producto || productoForm.errors.cantidad) && (
              <Box mt="xs">
                {productoForm.errors.producto && (
                  <Text c="red" size="sm">
                    {productoForm.errors.producto}
                  </Text>
                )}
                {productoForm.errors.cantidad && (
                  <Text c="red" size="sm">
                    {productoForm.errors.cantidad}
                  </Text>
                )}
              </Box>
            )}
            
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

          {/* Lista de Productos Agregados al Pedido - CONVERTIDA A TABLA */}
          {productosPedido.length > 0 && (
            <Paper withBorder p="md">
              <Text fw={600} mb="md">Productos en el Pedido</Text>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>SKU</Table.Th>
                    <Table.Th>Producto</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Cantidad</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Unidad</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Precio Unitario</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Subtotal</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Acciones</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {productosPedido.map((producto, index) => (
                    <Table.Tr key={index}>
                      <Table.Td>
                        <Text>{producto.sku}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text>{producto.producto_nombre}</Text>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'center' }}>
                        <Text>{producto.cantidad}</Text>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'center' }}>
                        <Text>{producto.unidad_medida}</Text>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right' }}>
                        <Text>${producto.precio_venta?.toFixed(2)}</Text>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'right' }}>
                        <Text>${((producto.precio_venta || 0) * producto.cantidad).toFixed(2)}</Text>
                      </Table.Td>
                      <Table.Td style={{ textAlign: 'center' }}>
                        <Group gap="xs" justify="center">
                          <Tooltip label="Editar cantidad">
                            <ActionIcon 
                              color="orange" 
                              variant="light"
                              onClick={() => abrirModalEdicion(index)}
                              disabled={cargando}
                            >
                              <IconEdit size="1rem" />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Eliminar producto">
                            <ActionIcon 
                              color="red" 
                              variant="light"
                              onClick={() => eliminarProducto(index)}
                              disabled={cargando}
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

        {/* Botones de Acción - MODIFICADO: Se quitó el botón "Entregar" */}
        <Group justify="flex-end" gap="xs">
          <Button 
            variant="subtle" 
            onClick={handleCancelar}
            size="md"
            disabled={cargando}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleRegistrarPedido}
            loading={cargando}
            size="md"
          >
            {textoBoton}
          </Button>
        </Group>
      </Stack>

      {/* Modal de Lista Completa de Productos - ACTUALIZADO CON LOADER */}
      <Modal
        opened={productListModal}
        onClose={closeProductListModal}
        title={<Title order={4}>Lista Completa de Productos</Title>}
        size="100%"
        centered
        closeOnClickOutside={false}
        >
        <Stack gap="md">
            {/* Barra de búsqueda y filtros mejorados */}
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
                    disabled={cargando}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        aplicarFiltros();
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
                    disabled={cargando}
                  />
                  
                  <Select
                    placeholder="Marca"
                    data={marcasDisponibles}
                    value={marcaFilter}
                    onChange={setMarcaFilter}
                    clearable
                    style={{ flex: 1 }}
                    size="md"
                    disabled={cargando}
                  />
                  
                  <Button 
                    variant="subtle" 
                    onClick={limpiarFiltros}
                    size="md"
                    disabled={cargando || applyingFilters}
                  >
                    Limpiar
                  </Button>
                  
                  <Button 
                    onClick={aplicarFiltros}
                    size="md"
                    disabled={cargando || applyingFilters}
                  >
                    Buscar
                  </Button>
                </Group>
              </Stack>
            </Paper>

            {/* Botón para agregar nuevo producto */}
            <Group justify="flex-end">
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

            {/* Tabla de productos CON LOADER */}
            <Paper withBorder style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
              <Box style={{ flexGrow: 1, overflowY: 'auto' }}>
                {applyingFilters ? (
                  <Center style={{ height: '50%' }}>
                    <Stack align="center" gap="md">
                      <Loader size="lg" />
                      <Text c="dimmed">Buscando productos...</Text>
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
                        <Table.Th style={{ textAlign: 'center' }}>Marca</Table.Th>
                        <Table.Th style={{ textAlign: 'center' }}>Acciones</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {filteredPresentaciones.length === 0 ? (
                        <Table.Tr>
                          <Table.Td colSpan={7} style={{ textAlign: 'center' }}>
                            <Text c="dimmed" py="xl">
                              {searchTerm || stockFilter || marcaFilter
                                ? "No se encontraron productos con los filtros aplicados" 
                                : "No hay productos registrados"}
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
                                {producto?.marca ? (
                                  <Text size="sm">{producto.marca}</Text>
                                ) : (
                                  <Text size="sm" c="dimmed">Sin marca</Text>
                                )}
                              </Table.Td>
                              <Table.Td style={{ textAlign: 'center' }}>
                                <Group gap="xs" justify="center">
                                  <Tooltip label="Ver detalles" position="bottom" withArrow>
                                    <ActionIcon
                                      variant="light"
                                      color="blue"
                                      onClick={() => handleVerDetalles(presentacion)}
                                      size="sm"
                                      disabled={cargando}
                                    >
                                      <IconEye size="1rem" />
                                    </ActionIcon>
                                  </Tooltip>
                                  <Button
                                    size="sm"
                                    variant="light" 
                                    onClick={() => {
                                      setProductoSeleccionado(presentacion.id_presentacion_producto.toString());
                                      productoForm.setFieldValue('producto', presentacion.id_presentacion_producto.toString());
                                      closeProductListModal();
                                    }}
                                    disabled={cargando}
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
              </Box>
            </Paper>
        </Stack>
      </Modal>

      {/* Modal de Crear Nuevo Producto - SIN FACTOR DE CONVERSIÓN */}
      <Modal
        opened={newProductModal}
        onClose={() => {
          closeNewProductModal();
          resetNewProductForm();
        }}
        title={
          <Title order={4}>
            Crear Nuevo Producto
          </Title>
        }
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
                  disabled={cargando}
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
                  disabled={cargando}
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
                  placeholder="Código único del producto"
                  size="md"
                  withAsterisk
                  {...newProductForm.getInputProps('sku')}
                  errorProps={{ style: { marginTop: '4px' } }}
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
                  size="md"
                  withAsterisk
                  {...newProductForm.getInputProps('unidad_medida')}
                  errorProps={{ style: { marginTop: '4px' } }}
                  disabled={cargando}
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
                  disabled={cargando}
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
                  disabled={cargando}
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
                    disabled={cargando}
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
                    disabled={!atributoTemporal || cargando}
                    searchable
                    clearable
                  />
                  <Button 
                    onClick={handleAddAtributoTemporal}
                    disabled={!atributoTemporal || !valorAtributoTemporal || cargando}
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
                            disabled={cargando}
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
                disabled={cargando}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                size="md"
                disabled={cargando}
              >
                Crear Producto
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* NUEVO: Modal para editar cantidad de producto - CON VALIDACIONES */}
      <Modal
        opened={editProductModal}
        onClose={closeEditProductModal}
        title={<Title order={4}>Editar Cantidad del Producto</Title>}
        size="sm"
        centered
        closeOnClickOutside={false}
      >
        <form onSubmit={editCantidadForm.onSubmit(guardarEdicionModal)}>
          <Stack gap="md">
            {editandoIndex !== null && (
              <>
                <Text>
                  <Text span fw={600}>Editando:</Text> {productosPedido[editandoIndex]?.producto_nombre}
                </Text>
                <NumberInput
                  label="Nueva cantidad"
                  min={0}
                  size="md"
                  withAsterisk
                  {...editCantidadForm.getInputProps('cantidad')}
                  errorProps={{ style: { marginTop: '4px' } }}
                />
                <Group justify="flex-end">
                  <Button variant="subtle" onClick={closeEditProductModal}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Guardar Cambios
                  </Button>
                </Group>
              </>
            )}
          </Stack>
        </form>
      </Modal>

      {/* Modal de Alerta para Validaciones */}
      <Modal
        opened={saveAlert}
        onClose={closeSaveAlert}
        title={<Title order={4}>Información Incompleta</Title>}
        size="md"
        centered
      >
        <Stack gap="md">
          <Alert icon={<IconAlertCircle size="1rem" />} title="Faltan datos requeridos" color="blue">
            Para {modoEdicion ? 'actualizar' : 'registrar'} el pedido necesitas seleccionar un cliente, 
            una prioridad y agregar al menos un producto.
          </Alert>
          <Group justify="flex-end">
            <Button onClick={closeSaveAlert}>
              Entendido
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal de Alerta para Entregar Pedido - MANTENIDO pero ahora se activa automáticamente */}
      <Modal
        opened={deliverAlert}
        onClose={closeDeliverAlert}
        title={<Title order={4}>Marcar como Entregado</Title>}
        size="md"
        centered
      >
        <Stack gap="md">
          <Alert title="¿Confirmar entrega?" color="green">
            Esta acción marcará el pedido como entregado. Una vez entregado, no podrás editarlo nuevamente.
            ¿Deseas continuar?
          </Alert>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeDeliverAlert}>
              Cancelar
            </Button>
            <Button color="green" onClick={handleEntregarPedido}>
              Sí, Entregar Pedido
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal de Confirmación para Eliminar Producto */}
      <Modal
        opened={deleteProductAlert}
        onClose={closeDeleteProductAlert}
        title={<Title order={4}>Eliminar Producto</Title>}
        size="md"
        centered
      >
        <Stack gap="md">
          <Alert 
            icon={<IconAlertCircle size="1rem" />} 
            title="¿Estás seguro de eliminar este producto?" 
            color="orange"
          >
            Esta acción eliminará el producto del pedido.
          </Alert>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={closeDeleteProductAlert}>
              Cancelar
            </Button>
            <Button color="red" onClick={confirmarEliminarProducto}>
              Sí, Eliminar
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* NUEVO: Modal de Detalles del Producto - REPLICADO DESDE NEWPURCHASE */}
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
                <Group justify="space-between">
                  <Text fw={500}>Factor de conversión:</Text>
                  <Text>{selectedPresentacion.factor_conversion}</Text>
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