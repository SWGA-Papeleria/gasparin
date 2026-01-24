import type {
  Producto,
  PresentacionProducto,
  MovimientoStock,
  TipoMovimiento,
  Atributo,
  UnidadMedida,
  AtributoProducto
} from '../types/inventory.types';

// Datos de ejemplo (simulados) - en el futuro vendrán de API real
const productosEjemplo: Producto[] = [
  {
    id_producto: 1,
    nombre_base: 'Bolígrafo BIC Azul',
    descripcion: 'Bolígrafo de tinta azul, punta media, material plástico',
    marca: 'BIC',
    existencia: 45
  },
  {
    id_producto: 2,
    nombre_base: 'Bolígrafo BIC Negro',
    descripcion: 'Bolígrafo de tinta negra, punta fina, material plástico',
    marca: 'BIC',
    existencia: 32
  },
  {
    id_producto: 3,
    nombre_base: 'Cuaderno Profesional 100H',
    descripcion: 'Cuaderno de 100 hojas, pasta dura, rayado',
    marca: 'Norma',
    existencia: 15
  },
  {
    id_producto: 4,
    nombre_base: 'Resma Papel A4 500h',
    descripcion: 'Resma de papel bond A4, 75 gr, 500 hojas',
    marca: 'HP',
    existencia: 8
  },
];

const presentacionesEjemplo: PresentacionProducto[] = [
  {
    id_presentacion_producto: 1,
    sku: 'BOL-BIC-AZUL',
    fk_producto: 1,
    fk_unidad_medida: 1,
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
    precio_venta: 5.50,
    unidad_nombre: 'Pieza',
    producto_nombre: 'Bolígrafo BIC Negro',
    stock_actual: 32
  },
  {
    id_presentacion_producto: 3,
    sku: 'CUA-PROF-100H',
    fk_producto: 3,
    fk_unidad_medida: 1,
    precio_venta: 25.00,
    unidad_nombre: 'Pieza',
    producto_nombre: 'Cuaderno Profesional 100H',
    stock_actual: 15
  },
  {
    id_presentacion_producto: 4,
    sku: 'RESMA-A4-500',
    fk_producto: 4,
    fk_unidad_medida: 3,
    precio_venta: 45.00,
    unidad_nombre: 'Caja',
    producto_nombre: 'Resma Papel A4 500h',
    stock_actual: 8
  },
];

const movimientosEjemplo: MovimientoStock[] = [
  {
    id_stock: 1,
    fk_presentacion_producto: 1,
    cantidad: 100,
    fecha_movimiento: new Date('2024-01-15'),
    fk_tipo_movimiento: 1,
    tipo_nombre: 'Ajuste de Inventario',
    motivo: 'Ajuste inicial de stock',
    realizado_por: 'Ana García'
  },
  {
    id_stock: 2,
    fk_presentacion_producto: 1,
    cantidad: -5,
    fecha_movimiento: new Date('2024-01-16'),
    fk_tipo_movimiento: 2,
    tipo_nombre: 'Merma/Pérdida',
    motivo: 'Productos dañados en almacén',
    realizado_por: 'Carlos López'
  },
  {
    id_stock: 3,
    fk_presentacion_producto: 2,
    cantidad: 50,
    fecha_movimiento: new Date('2024-01-10'),
    fk_tipo_movimiento: 1,
    tipo_nombre: 'Ajuste de Inventario',
    motivo: 'Corrección por diferencia en conteo',
    realizado_por: 'María Rodríguez'
  },
  {
    id_stock: 4,
    fk_presentacion_producto: 3,
    cantidad: -2,
    fecha_movimiento: new Date('2024-01-12'),
    fk_tipo_movimiento: 4,
    tipo_nombre: 'Uso Interno',
    motivo: 'Uso en oficina',
    realizado_por: 'Juan Pérez'
  },
];

const tiposMovimientoEjemplo: TipoMovimiento[] = [
  { id_tipo_movimiento: 1, descripcion: 'Ajuste de Inventario', es_entrada: true },
  { id_tipo_movimiento: 2, descripcion: 'Merma/Pérdida', es_entrada: false },
  { id_tipo_movimiento: 3, descripcion: 'Devolución de Cliente', es_entrada: true },
  { id_tipo_movimiento: 4, descripcion: 'Uso Interno', es_entrada: false },
  { id_tipo_movimiento: 5, descripcion: 'Donación/Regalo', es_entrada: false },
  { id_tipo_movimiento: 6, descripcion: 'Ajuste por Diferencia', es_entrada: true },
  { id_tipo_movimiento: 7, descripcion: 'Ajuste por Diferencia', es_entrada: false },
];

const unidadesMedidaEjemplo: UnidadMedida[] = [
  { id_unidad: 1, nombre: 'Pieza', unidad_base: true },
  { id_unidad: 2, nombre: 'Paquete', unidad_base: false },
  { id_unidad: 3, nombre: 'Caja', unidad_base: false },
  { id_unidad: 4, nombre: 'Metro', unidad_base: true },
  { id_unidad: 5, nombre: 'Litro', unidad_base: true },
];

const atributosEjemplo: Atributo[] = [
  { id_atributo: 1, nombre: 'Color' },
  { id_atributo: 2, nombre: 'Tamaño' },
  { id_atributo: 3, nombre: 'Material' },
  { id_atributo: 4, nombre: 'Marca' },
  { id_atributo: 5, nombre: 'Modelo' },
];

// Servicio para futura implementación de API REST
export const inventoryService = {
  // Productos
  getProductos: async (): Promise<Producto[]> => {
    // TODO: Reemplazar con fetch('/api/productos')
    // Simulando delay de red
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...productosEjemplo];
  },

  createProducto: async (producto: Omit<Producto, 'id_producto'>): Promise<Producto> => {
    // TODO: Reemplazar con POST
    const nuevoId = Math.max(...productosEjemplo.map(p => p.id_producto), 0) + 1;
    const nuevoProducto = { ...producto, id_producto: nuevoId };
    productosEjemplo.push(nuevoProducto);
    return nuevoProducto;
  },

  updateProducto: async (id: number, producto: Partial<Producto>): Promise<Producto> => {
    // TODO: Reemplazar con PUT
    const index = productosEjemplo.findIndex(p => p.id_producto === id);
    if (index === -1) throw new Error('Producto no encontrado');
    
    const productoActualizado = { ...productosEjemplo[index], ...producto };
    productosEjemplo[index] = productoActualizado;
    return productoActualizado;
  },

  deleteProducto: async (id: number): Promise<void> => {
    // TODO: Reemplazar con DELETE
    const index = productosEjemplo.findIndex(p => p.id_producto === id);
    if (index !== -1) {
      productosEjemplo.splice(index, 1);
    }
  },

  // Presentaciones
  getPresentaciones: async (): Promise<PresentacionProducto[]> => {
    // TODO: Reemplazar con fetch('/api/presentaciones')
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...presentacionesEjemplo];
  },

  createPresentacion: async (
    presentacion: Omit<PresentacionProducto, 'id_presentacion_producto'>
  ): Promise<PresentacionProducto> => {
    // TODO: Reemplazar con POST
    const nuevoId = Math.max(...presentacionesEjemplo.map(p => p.id_presentacion_producto), 0) + 1;
    const nuevaPresentacion = { ...presentacion, id_presentacion_producto: nuevoId };
    presentacionesEjemplo.push(nuevaPresentacion);
    return nuevaPresentacion;
  },

  updatePresentacion: async (
    id: number, 
    presentacion: Partial<PresentacionProducto>
  ): Promise<PresentacionProducto> => {
    // TODO: Reemplazar con PUT
    const index = presentacionesEjemplo.findIndex(p => p.id_presentacion_producto === id);
    if (index === -1) throw new Error('Presentación no encontrada');
    
    const presentacionActualizada = { ...presentacionesEjemplo[index], ...presentacion };
    presentacionesEjemplo[index] = presentacionActualizada;
    return presentacionActualizada;
  },

  deletePresentacion: async (id: number): Promise<void> => {
    // TODO: Reemplazar con DELETE
    const index = presentacionesEjemplo.findIndex(p => p.id_presentacion_producto === id);
    if (index !== -1) {
      presentacionesEjemplo.splice(index, 1);
    }
  },

  // Movimientos
  getMovimientos: async (): Promise<MovimientoStock[]> => {
    // TODO: Reemplazar con fetch('/api/movimientos')
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...movimientosEjemplo];
  },

  createMovimiento: async (movimiento: Omit<MovimientoStock, 'id_stock'>): Promise<MovimientoStock> => {
    // TODO: Reemplazar con POST
    const nuevoId = Math.max(...movimientosEjemplo.map(m => m.id_stock), 0) + 1;
    const nuevoMovimiento = { ...movimiento, id_stock: nuevoId };
    movimientosEjemplo.push(nuevoMovimiento);
    return nuevoMovimiento;
  },

  // Catálogos
  getTiposMovimiento: async (): Promise<TipoMovimiento[]> => {
    // TODO: Reemplazar con fetch('/api/tipos-movimiento')
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...tiposMovimientoEjemplo];
  },

  getUnidadesMedida: async (): Promise<UnidadMedida[]> => {
    // TODO: Reemplazar con fetch('/api/unidades-medida')
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...unidadesMedidaEjemplo];
  },

  getAtributos: async (): Promise<Atributo[]> => {
    // TODO: Reemplazar con fetch('/api/atributos')
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...atributosEjemplo];
  },

  // Funciones auxiliares
  getMovimientosByPresentacion: async (presentacionId: number): Promise<MovimientoStock[]> => {
    const movimientos = await inventoryService.getMovimientos();
    return movimientos
      .filter(mov => mov.fk_presentacion_producto === presentacionId)
      .sort((a, b) => new Date(b.fecha_movimiento).getTime() - new Date(a.fecha_movimiento).getTime());
  },

  getProductoById: async (id: number): Promise<Producto | undefined> => {
    const productos = await inventoryService.getProductos();
    return productos.find(p => p.id_producto === id);
  }
};