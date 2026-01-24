// src/services/purchases.service.ts
import type {
  Proveedor,
  ProductoCompra,
  PresentacionProducto,
  Producto,
  Compra
} from '../types/purchases.types';

// Datos de ejemplo - En producción esto vendría de una API
const proveedoresEjemplo: Proveedor[] = [
  { id_proveedor: 1, nombre: 'Distribuidora Papelera SA', contacto: 'Juan Rodríguez', telefono: '555-1001', correo: 'juan@distpapel.com' },
  { id_proveedor: 2, nombre: 'Suministros Oficina MX', contacto: 'María Sánchez', telefono: '555-1002', correo: 'maria@suministros.com' },
  { id_proveedor: 3, nombre: 'Materiales Escolares Premium', contacto: 'Carlos Mendoza', telefono: '555-1003', correo: 'carlos@materiales.com' }
];

const productosEjemplo: Producto[] = [
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
];

const presentacionesEjemplo: PresentacionProducto[] = [
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
];

const comprasEjemplo: Compra[] = [
  {
    id_compra: 1,
    fk_proveedor: 1,
    fk_usuario: 1,
    fecha_compra: '2024-01-10',
    fecha_validado: '2024-01-12',
    costo_total: 1250.00,
    estado: 'validado',
    created_at: '2024-01-10',
    updated_at: '2024-01-12',
    proveedor_nombre: 'Distribuidora Papelera SA',
    usuario_nombre: 'Ana García',
    productos: [
      {
        id_compra_producto: 1,
        fk_presentacion_producto: 1,
        demanda: 50,
        cantidad_recibida: 50,
        costo_unitario: 18.00,
        subtotal: 900.00,
        producto_nombre: 'Bolígrafo BIC Azul',
        sku: 'BOL-BIC-AZUL',
        unidad_medida: 'Pieza'
      },
      {
        id_compra_producto: 2,
        fk_presentacion_producto: 3,
        demanda: 10,
        cantidad_recibida: 10,
        costo_unitario: 35.00,
        subtotal: 350.00,
        producto_nombre: 'Cuaderno Profesional',
        sku: 'CUA-PROF-100H',
        unidad_medida: 'Pieza'
      }
    ]
  },
  {
    id_compra: 2,
    fk_proveedor: 2,
    fk_usuario: 2,
    fecha_compra: '2024-01-12',
    estado: 'pendiente',
    created_at: '2024-01-12',
    updated_at: '2024-01-12',
    proveedor_nombre: 'Suministros Oficina MX',
    usuario_nombre: 'Carlos López',
    productos: [
      {
        id_compra_producto: 3,
        fk_presentacion_producto: 2,
        demanda: 80,
        producto_nombre: 'Bolígrafo BIC Negro',
        sku: 'BOL-BIC-NEGRO',
        unidad_medida: 'Pieza'
      },
      {
        id_compra_producto: 4,
        fk_presentacion_producto: 4,
        demanda: 5,
        producto_nombre: 'Resma Papel A4',
        sku: 'RESMA-A4-500',
        unidad_medida: 'Caja'
      }
    ]
  }
];

export const purchasesService = {
  // Proveedores
  getProveedores: async (): Promise<Proveedor[]> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(proveedoresEjemplo), 500);
    });
  },

  // Productos y presentaciones
  getProductos: async (): Promise<Producto[]> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(productosEjemplo), 500);
    });
  },

  getPresentaciones: async (): Promise<PresentacionProducto[]> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(presentacionesEjemplo), 500);
    });
  },

  // Compras
  getCompras: async (): Promise<Compra[]> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(comprasEjemplo), 800);
    });
  },

  getCompraById: async (id: number): Promise<Compra | null> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const compra = comprasEjemplo.find(c => c.id_compra === id);
        resolve(compra || null);
      }, 500);
    });
  },

  saveCompra: async (compra: Partial<Compra>): Promise<Compra> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newId = Math.max(...comprasEjemplo.map(c => c.id_compra), 0) + 1;
        const newCompra: Compra = {
          ...compra,
          id_compra: newId,
          fk_usuario: 1,
          estado: 'pendiente',
          created_at: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString().split('T')[0],
          usuario_nombre: 'Usuario Actual'
        } as Compra;
        
        resolve(newCompra);
      }, 800);
    });
  },

  updateCompra: async (id: number, compra: Partial<Compra>): Promise<Compra> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const existing = comprasEjemplo.find(c => c.id_compra === id);
        const updated: Compra = {
          ...existing,
          ...compra,
          updated_at: new Date().toISOString().split('T')[0],
        } as Compra;
        
        resolve(updated);
      }, 800);
    });
  },

  deleteCompra: async (id: number): Promise<boolean> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  },

  validateCompra: async (id: number, productosValidacion: ProductoCompra[]): Promise<Compra> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const compra = comprasEjemplo.find(c => c.id_compra === id);
        const total = productosValidacion.reduce((sum, p) => sum + (p.subtotal || 0), 0);
        
        const updated: Compra = {
          ...compra,
          estado: 'validado',
          fecha_validado: new Date().toISOString().split('T')[0],
          costo_total: total,
          productos: productosValidacion,
          updated_at: new Date().toISOString().split('T')[0],
        } as Compra;
        
        resolve(updated);
      }, 800);
    });
  }
};