// src/types/orders.types.ts
export interface Cliente {
  id_cliente: number;
  nombre: string;
  correo: string;
  telefono?: string;
  direccion?: string;
}

export interface ProductoPedido {
  id_pedido_producto?: number;
  fk_presentacion_producto: number;
  cantidad: number;
  producto_nombre?: string;
  sku?: string;
  unidad_medida?: string;
  precio_venta?: number;
  subtotal?: number; // AGREGAR esta propiedad
}

export interface PresentacionProducto {
  id_presentacion_producto: number;
  sku: string;
  fk_producto: number;
  fk_unidad_medida: number;
  factor_conversion: number;
  precio_venta: number;
  unidad_nombre?: string;
  stock_actual?: number;
  producto_nombre?: string;
  atributos?: AtributoProducto[];
}

export interface Producto {
  id_producto: number;
  nombre_base: string;
  descripcion: string;
  marca?: string;
  existencia?: number;
  atributos?: AtributoProducto[];
}

export interface Atributo {
  id_atributo: number;
  nombre: string;
}

export interface AtributoProducto {
  id_atributo: number;
  nombre: string;
  valor: string;
}

export interface EstadoPedido {
  id_estado_pedido: number;
  descripcion: string;
  color: string;
}

export interface PrioridadPedido {
  id_prioridad_pedido: number;
  descripcion: string;
  color: string;
}

export interface Pedido {
  id_pedido: number;
  folio: string;
  fk_cliente: number;
  cliente_nombre: string;
  fecha_pedido: string;
  fecha_entrega_estimada: string;
  fk_estado_pedido: number;
  estado: string;
  fk_prioridad_pedido: number;
  prioridad: string;
  total: number;
  productos_count: number;
  created_at: string;
}

// AGREGAR interfaz específica para detalles del pedido
export interface DetallePedido {
  id_pedido_producto: number;
  fk_presentacion_producto: number;
  producto_nombre: string;
  sku: string;
  cantidad: number;
  precio_venta: number;
  subtotal: number;
}