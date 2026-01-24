// types/sales.types.ts
export interface EstadoVenta {
  id_estado_venta: number;
  descripcion: string;
}

export interface DetalleVenta {
  id_detalle_venta: number;
  fk_venta: number;
  fk_presentacion_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto_nombre?: string;
  sku?: string;
  unidad_medida?: string;
  // Nuevos campos para devolución
  devolver?: boolean;
  cantidadDevolver?: number;
}

export interface MetodoPago {
  id_metodo_pago: number;
  descripcion: string;
}

export interface Venta {
  id_venta: number;
  folio_venta: string;
  fk_sesion_caja: number;
  fk_usuario: number;
  fk_metodo_pago: number;
  fk_cliente: number;
  fk_pedido: number | null;
  fk_estado_venta: number;
  fecha_venta: string;
  total: number;
  created_at: string;
  updated_at: string;
  
  // Campos para mostrar
  estado_venta_nombre?: string;
  metodo_pago_nombre?: string;
  usuario_nombre?: string;
  cliente_nombre?: string;
  sesion_caja_id?: string;
  detalle_venta?: DetalleVenta[];
}

export interface SalesFilterParams {
  searchTerm: string;
  paymentFilter: string | null;
  statusFilter: string | null;
  dateFilter: string | null;
}