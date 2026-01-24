// services/sales.service.ts
import type { Venta, EstadoVenta, MetodoPago } from '../types/sales.types';

// Datos de ejemplo - en un caso real, aquí irían las llamadas API
const estadosVenta: EstadoVenta[] = [
  { id_estado_venta: 1, descripcion: 'finalizada' },
  { id_estado_venta: 2, descripcion: 'cancelada' },
  { id_estado_venta: 3, descripcion: 'devolucion' }
];

const metodosPago: MetodoPago[] = [
  { id_metodo_pago: 1, descripcion: 'Efectivo' },
  { id_metodo_pago: 2, descripcion: 'Tarjeta' },
  { id_metodo_pago: 3, descripcion: 'Transferencia' }
];

const ventasData: Venta[] = [
  {
    id_venta: 1,
    folio_venta: 'F-001',
    fk_sesion_caja: 1,
    fk_usuario: 1,
    fk_metodo_pago: 1,
    fk_cliente: 1,
    fk_pedido: null,
    fk_estado_venta: 1,
    fecha_venta: '2024-01-15 10:30:00',
    total: 1250.75,
    created_at: '2024-01-15',
    updated_at: '2024-01-15',
    estado_venta_nombre: 'finalizada',
    metodo_pago_nombre: 'Efectivo',
    usuario_nombre: 'Ana García',
    cliente_nombre: 'Juan Pérez',
    sesion_caja_id: 'SC-001',
    detalle_venta: [
      {
        id_detalle_venta: 1,
        fk_venta: 1,
        fk_presentacion_producto: 1,
        cantidad: 2,
        precio_unitario: 25.00,
        subtotal: 50.00,
        producto_nombre: 'Cuaderno Profesional',
        sku: 'CUA-PROF-100H',
        unidad_medida: 'Pieza'
      },
      {
        id_detalle_venta: 2,
        fk_venta: 1,
        fk_presentacion_producto: 2,
        cantidad: 5,
        precio_unitario: 5.50,
        subtotal: 27.50,
        producto_nombre: 'Bolígrafo BIC Azul',
        sku: 'BOL-BIC-AZUL',
        unidad_medida: 'Pieza'
      }
    ]
  },
  {
    id_venta: 2,
    folio_venta: 'F-002',
    fk_sesion_caja: 1,
    fk_usuario: 2,
    fk_metodo_pago: 2,
    fk_cliente: 2,
    fk_pedido: null,
    fk_estado_venta: 1,
    fecha_venta: '2024-01-15 14:20:00',
    total: 890.50,
    created_at: '2024-01-15',
    updated_at: '2024-01-15',
    estado_venta_nombre: 'finalizada',
    metodo_pago_nombre: 'Tarjeta',
    usuario_nombre: 'Carlos López',
    cliente_nombre: 'María García',
    sesion_caja_id: 'SC-001',
    detalle_venta: [
      {
        id_detalle_venta: 3,
        fk_venta: 2,
        fk_presentacion_producto: 3,
        cantidad: 1,
        precio_unitario: 45.00,
        subtotal: 45.00,
        producto_nombre: 'Resma Papel A4',
        sku: 'RESMA-A4-500',
        unidad_medida: 'Caja'
      }
    ]
  }
];

export const salesService = {
  getEstadosVenta: async (): Promise<EstadoVenta[]> => {
    // Simular llamada API
    return new Promise((resolve) => {
      setTimeout(() => resolve(estadosVenta), 100);
    });
  },

  getMetodosPago: async (): Promise<MetodoPago[]> => {
    // Simular llamada API
    return new Promise((resolve) => {
      setTimeout(() => resolve(metodosPago), 100);
    });
  },

  getVentas: async (): Promise<Venta[]> => {
    // Simular llamada API
    return new Promise((resolve) => {
      setTimeout(() => resolve(ventasData), 300);
    });
  },

  updateVenta: async (venta: Venta): Promise<Venta> => {
    // Simular llamada API para actualizar
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedVenta = { ...venta, updated_at: new Date().toISOString() };
        resolve(updatedVenta);
      }, 200);
    });
  }
};