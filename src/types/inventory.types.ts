export interface Producto {
  id_producto: number;
  nombre_base: string;
  descripcion: string;
  marca?: string;
  existencia?: number;
}

export interface PresentacionProducto {
  id_presentacion_producto: number;
  sku: string;
  fk_producto: number;
  fk_unidad_medida: number;
  precio_venta: number;
  unidad_nombre?: string;
  producto_nombre?: string;
  stock_actual?: number;
  atributos?: AtributoProducto[];
}

export interface MovimientoStock {
  id_stock: number;
  fk_presentacion_producto: number;
  cantidad: number;
  fecha_movimiento: Date;
  fk_tipo_movimiento: number;
  tipo_nombre?: string;
  motivo?: string;
  realizado_por?: string;
}

export interface TipoMovimiento {
  id_tipo_movimiento: number;
  descripcion: string;
  es_entrada: boolean;
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

export interface UnidadMedida {
  id_unidad: number;
  nombre: string;
  unidad_base: boolean;
}

// Tipos para formularios
export interface ProductoFormValues {
  nombre_base: string;
  descripcion: string;
  marca: string;
  existencia: number;
  sku: string;
  fk_unidad_medida: string;
  precio_venta: number;
}

export interface MovimientoFormValues {
  fk_tipo_movimiento: string;
  cantidad: number;
  motivo: string;
}

export interface AtributoSeleccionado {
  id_atributo: number;
  valor: string;
}