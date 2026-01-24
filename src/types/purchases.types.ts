// src/types/purchases.types.ts
export interface Proveedor {
  id_proveedor: number;
  nombre: string;
  contacto: string;
  telefono?: string;
  correo?: string;
}

export interface ProductoCompra {
  id_compra_producto?: number;
  fk_presentacion_producto: number;
  demanda: number;
  cantidad?: number;
  costo_unitario?: number;
  subtotal?: number;
  producto_nombre?: string;
  sku?: string;
  unidad_medida?: string;
  cantidad_recibida?: number;
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

export interface Compra {
  id_compra: number;
  fk_proveedor: number;
  fk_usuario: number;
  fecha_compra: string;
  fecha_validado?: string;
  costo_total?: number;
  estado: 'pendiente' | 'validado';
  created_at: string;
  updated_at: string;
  proveedor_nombre?: string;
  usuario_nombre?: string;
  productos?: ProductoCompra[];
}

export interface PurchaseFormValues {
  proveedor?: string;
  fecha?: string;
  producto?: string;
  demanda?: number;
}

export interface NewProductFormValues {
  nombre_base: string;
  descripcion: string;
  sku: string;
  unidad_medida: string;
  precio_venta: number;
  marca: string;
  existencia: number;
}