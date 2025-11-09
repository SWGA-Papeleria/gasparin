import { useState, useMemo } from 'react';

// ------------------------------------------------------------
// TIPOS BASADOS EN TU DIAGRAMA ER
// ------------------------------------------------------------
export interface Categoria {
  id_categoria: number;
  nombre: string;
}

export interface Marca {
  id_marca: number;
  nombre: string;
}

export interface UnidadMedida {
  id_unidad: number;
  nombre: string;
}

export interface Producto {
  id_producto: number;
  nombre_base: string;
  descripcion: string;
  fk_categoria: number;
  fk_marca: number;
  categoria?: Categoria;
  marca?: Marca;
}

export interface PresentacionProducto {
  id_presentacion_producto: number;
  sku: string;
  fk_producto: number;
  fk_unidad_medida: number;
  precio_venta: number;
  producto?: Producto;
  unidad_medida?: UnidadMedida;
  stock_actual?: number;
}

export interface Stock {
  id_stock: number;
  fk_presentacion_producto: number;
  cantidad: number;
  fecha_movimiento: string;
  fk_tipo_movimiento: number;
  presentacion_producto?: PresentacionProducto;
}

export interface TipoMovimiento {
  id_tipo_movimiento: number;
  descripcion: string;
}

// ------------------------------------------------------------
// DATOS DE PRUEBA (TEMPORAL)
// ------------------------------------------------------------
const CATEGORIAS_MOCK: Categoria[] = [
  { id_categoria: 1, nombre: 'Material Escolar' },
  { id_categoria: 2, nombre: 'Papelería' },
  { id_categoria: 3, nombre: 'Oficina' },
  { id_categoria: 4, nombre: 'Arte' },
];

const MARCAS_MOCK: Marca[] = [
  { id_marca: 1, nombre: 'Faber-Castell' },
  { id_marca: 2, nombre: 'Bic' },
  { id_marca: 3, nombre: 'Pilot' },
  { id_marca: 4, nombre: 'Staedtler' },
];

const UNIDADES_MOCK: UnidadMedida[] = [
  { id_unidad: 1, nombre: 'Unidad' },
  { id_unidad: 2, nombre: 'Paquete' },
  { id_unidad: 3, nombre: 'Caja' },
  { id_unidad: 4, nombre: 'Docena' },
];

const TIPOS_MOVIMIENTO_MOCK: TipoMovimiento[] = [
  { id_tipo_movimiento: 1, descripcion: 'Entrada por Compra' },
  { id_tipo_movimiento: 2, descripcion: 'Salida por Venta' },
  { id_tipo_movimiento: 3, descripcion: 'Ajuste de Inventario' },
  { id_tipo_movimiento: 4, descripcion: 'Devolución' },
];

const PRODUCTOS_MOCK: Producto[] = [
  {
    id_producto: 1,
    nombre_base: 'Lápiz Grafito',
    descripcion: 'Lápiz de grafito profesional',
    fk_categoria: 1,
    fk_marca: 1,
  },
  {
    id_producto: 2,
    nombre_base: 'Cuaderno Profesional',
    descripcion: 'Cuaderno de 100 hojas rayadas',
    fk_categoria: 1,
    fk_marca: 2,
  },
  {
    id_producto: 3,
    nombre_base: 'Pluma Azul',
    descripcion: 'Pluma de tinta azul',
    fk_categoria: 2,
    fk_marca: 3,
  },
];

const PRESENTACIONES_MOCK: PresentacionProducto[] = [
  {
    id_presentacion_producto: 1,
    sku: 'LPZ-GRF-001',
    fk_producto: 1,
    fk_unidad_medida: 1,
    precio_venta: 5.00,
  },
  {
    id_presentacion_producto: 2,
    sku: 'CUA-PRO-100',
    fk_producto: 2,
    fk_unidad_medida: 1,
    precio_venta: 35.50,
  },
  {
    id_presentacion_producto: 3,
    sku: 'PLM-AZL-001',
    fk_producto: 3,
    fk_unidad_medida: 1,
    precio_venta: 8.00,
  },
];

const STOCK_MOCK: Stock[] = [
  {
    id_stock: 1,
    fk_presentacion_producto: 1,
    cantidad: 150,
    fecha_movimiento: '2024-01-15',
    fk_tipo_movimiento: 1,
  },
  {
    id_stock: 2,
    fk_presentacion_producto: 2,
    cantidad: 75,
    fecha_movimiento: '2024-01-15',
    fk_tipo_movimiento: 1,
  },
  {
    id_stock: 3,
    fk_presentacion_producto: 3,
    cantidad: 200,
    fecha_movimiento: '2024-01-15',
    fk_tipo_movimiento: 1,
  },
];

// ------------------------------------------------------------
// HOOK PRINCIPAL
// ------------------------------------------------------------
export const useProducts = () => {
  const [productos, setProductos] = useState<Producto[]>(PRODUCTOS_MOCK);
  const [presentaciones, setPresentaciones] = useState<PresentacionProducto[]>(PRESENTACIONES_MOCK);
  const [stock, setStock] = useState<Stock[]>(STOCK_MOCK);
  const [categorias] = useState<Categoria[]>(CATEGORIAS_MOCK);
  const [marcas] = useState<Marca[]>(MARCAS_MOCK);
  const [unidades] = useState<UnidadMedida[]>(UNIDADES_MOCK);
  const [tiposMovimiento] = useState<TipoMovimiento[]>(TIPOS_MOVIMIENTO_MOCK);

  // Combinar datos para la vista
  const inventarioCompleto = useMemo(() => {
    return presentaciones.map(presentacion => {
      const producto = productos.find(p => p.id_producto === presentacion.fk_producto);
      const unidad = unidades.find(u => u.id_unidad === presentacion.fk_unidad_medida);
      const stockProducto = stock.filter(s => s.fk_presentacion_producto === presentacion.id_presentacion_producto);
      const stockActual = stockProducto.reduce((total, mov) => total + mov.cantidad, 0);

      return {
        ...presentacion,
        producto,
        unidad_medida: unidad,
        stock_actual: stockActual,
        movimientos: stockProducto,
      };
    });
  }, [presentaciones, productos, unidades, stock]);

  // ------------------------------------------------------------
  // ACCIONES
  // ------------------------------------------------------------
  const agregarProducto = (nuevoProducto: Omit<Producto, 'id_producto'>) => {
    const id = Math.max(...productos.map(p => p.id_producto)) + 1;
    const producto: Producto = {
      ...nuevoProducto,
      id_producto: id,
    };
    setProductos(prev => [...prev, producto]);
    return id;
  };

  const agregarPresentacion = (nuevaPresentacion: Omit<PresentacionProducto, 'id_presentacion_producto'>) => {
    const id = Math.max(...presentaciones.map(p => p.id_presentacion_producto)) + 1;
    const presentacion: PresentacionProducto = {
      ...nuevaPresentacion,
      id_presentacion_producto: id,
    };
    setPresentaciones(prev => [...prev, presentacion]);
    return id;
  };

  const agregarMovimientoStock = (nuevoMovimiento: Omit<Stock, 'id_stock'>) => {
    const id = Math.max(...stock.map(s => s.id_stock)) + 1;
    const movimiento: Stock = {
      ...nuevoMovimiento,
      id_stock: id,
    };
    setStock(prev => [...prev, movimiento]);
  };

  const actualizarPrecio = (idPresentacion: number, nuevoPrecio: number) => {
    setPresentaciones(prev => 
      prev.map(p => 
        p.id_presentacion_producto === idPresentacion 
          ? { ...p, precio_venta: nuevoPrecio } 
          : p
      )
    );
  };

  // ------------------------------------------------------------
  // RETORNO DEL HOOK
  // ------------------------------------------------------------
  return {
    // Datos
    inventarioCompleto,
    productos,
    presentaciones,
    stock,
    categorias,
    marcas,
    unidades,
    tiposMovimiento,
    
    // Acciones
    agregarProducto,
    agregarPresentacion,
    agregarMovimientoStock,
    actualizarPrecio,
    
    // Setters
    setProductos,
    setPresentaciones,
    setStock,
  };
};