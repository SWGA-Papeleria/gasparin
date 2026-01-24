import { useState, useEffect, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { inventoryService } from '../services/inventory.service';
import type {
  Producto,
  PresentacionProducto,
  MovimientoStock,
  TipoMovimiento,
  Atributo,
  UnidadMedida,
  AtributoProducto,
  ProductoFormValues,
  MovimientoFormValues,
  AtributoSeleccionado
} from '../types/inventory.types';

export const useInventory = () => {
  // Estados principales
  const [productos, setProductos] = useState<Producto[]>([]);
  const [presentaciones, setPresentaciones] = useState<PresentacionProducto[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para UI
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);
  const [selectedPresentacion, setSelectedPresentacion] = useState<PresentacionProducto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [marcaFilter, setMarcaFilter] = useState<string | null>(null);
  const [stockFilter, setStockFilter] = useState<string | null>(null);
  const [filtrosAplicados, setFiltrosAplicados] = useState(false);

  // Datos de catálogo
  const [tiposMovimiento, setTiposMovimiento] = useState<TipoMovimiento[]>([]);
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);
  const [atributos, setAtributos] = useState<Atributo[]>([]);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      setIsLoading(true);
      try {
        const [
          productosData,
          presentacionesData,
          movimientosData,
          tiposData,
          unidadesData,
          atributosData
        ] = await Promise.all([
          inventoryService.getProductos(),
          inventoryService.getPresentaciones(),
          inventoryService.getMovimientos(),
          inventoryService.getTiposMovimiento(),
          inventoryService.getUnidadesMedida(),
          inventoryService.getAtributos()
        ]);

        setProductos(productosData);
        setPresentaciones(presentacionesData);
        setMovimientos(movimientosData);
        setTiposMovimiento(tiposData);
        setUnidades(unidadesData);
        setAtributos(atributosData);
      } catch (error) {
        console.error('Error cargando datos:', error);
        notifications.show({
          title: 'Error',
          message: 'No se pudieron cargar los datos del inventario',
          color: 'red',
        });
      } finally {
        setIsLoading(false);
      }
    };

    cargarDatos();
  }, []);

  // Funciones de negocio
  const handleSaveProduct = useCallback((
    values: ProductoFormValues, 
    atributosSeleccionados: AtributoSeleccionado[], 
    selectedProducto: Producto | null, 
    selectedPresentacion: PresentacionProducto | null
  ) => {
    try {
      // Convertir atributos al formato correcto
      const atributosCompletos: AtributoProducto[] = atributosSeleccionados.map(attr => {
        const atributoInfo = atributos.find(a => a.id_atributo === attr.id_atributo);
        return {
          id_atributo: attr.id_atributo,
          nombre: atributoInfo?.nombre || 'Atributo',
          valor: attr.valor
        };
      });

      if (selectedProducto && selectedPresentacion) {
        // Modo edición
        const productosActualizados = productos.map(product => 
          product.id_producto === selectedProducto.id_producto 
            ? { 
                ...product, 
                nombre_base: values.nombre_base.trim(), 
                descripcion: values.descripcion.trim(),
                marca: values.marca || undefined,
                existencia: Number(values.existencia)
              }
            : product
        );

        const presentacionesActualizadas = presentaciones.map(pres =>
          pres.id_presentacion_producto === selectedPresentacion.id_presentacion_producto
            ? {
                ...pres,
                sku: values.sku.trim().toUpperCase(),
                fk_unidad_medida: parseInt(values.fk_unidad_medida),
                precio_venta: Number(values.precio_venta),
                unidad_nombre: unidades.find(u => u.id_unidad === parseInt(values.fk_unidad_medida))?.nombre,
                producto_nombre: values.nombre_base.trim(),
                stock_actual: Number(values.existencia),
                atributos: atributosCompletos
              }
            : pres
        );

        setProductos(productosActualizados);
        setPresentaciones(presentacionesActualizadas);

        // En futuro: inventoryService.updateProducto(...)
        // En futuro: inventoryService.updatePresentacion(...)

        notifications.show({
          title: 'Producto actualizado',
          message: 'El producto se ha actualizado exitosamente',
          color: 'green',
        });
      } else {
        // Modo creación
        const nuevoProductoId = Math.max(...productos.map(p => p.id_producto), 0) + 1;
        const nuevoProducto: Producto = {
          id_producto: nuevoProductoId,
          nombre_base: values.nombre_base.trim(),
          descripcion: values.descripcion.trim(),
          marca: values.marca || undefined,
          existencia: Number(values.existencia)
        };

        const nuevaPresentacionId = Math.max(...presentaciones.map(p => p.id_presentacion_producto), 0) + 1;
        const nuevaPresentacion: PresentacionProducto = {
          id_presentacion_producto: nuevaPresentacionId,
          sku: values.sku.trim().toUpperCase(),
          fk_producto: nuevoProductoId,
          fk_unidad_medida: parseInt(values.fk_unidad_medida),
          precio_venta: Number(values.precio_venta),
          unidad_nombre: unidades.find(u => u.id_unidad === parseInt(values.fk_unidad_medida))?.nombre,
          producto_nombre: values.nombre_base.trim(),
          stock_actual: Number(values.existencia),
          atributos: atributosCompletos
        };

        setProductos([nuevoProducto, ...productos]);
        setPresentaciones([nuevaPresentacion, ...presentaciones]);

        // En futuro: inventoryService.createProducto(...)
        // En futuro: inventoryService.createPresentacion(...)

        notifications.show({
          title: 'Producto creado',
          message: 'El producto se ha creado exitosamente',
          color: 'green',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'No se pudo guardar el producto',
        color: 'red',
      });
    }
  }, [productos, presentaciones, atributos, unidades]);

  const handleRegistrarMovimiento = useCallback((values: MovimientoFormValues, presentacion: PresentacionProducto) => {
    try {
      const tipo = tiposMovimiento.find(t => t.id_tipo_movimiento === parseInt(values.fk_tipo_movimiento));
      if (!tipo) {
        notifications.show({
          title: 'Error',
          message: 'Tipo de movimiento no válido',
          color: 'red',
        });
        return;
      }

      const cantidadNumerica = Number(values.cantidad);
      const cantidadFinal = tipo.es_entrada ? cantidadNumerica : -cantidadNumerica;

      // Crear nuevo movimiento
      const nuevoMovimiento: MovimientoStock = {
        id_stock: Math.max(...movimientos.map(m => m.id_stock), 0) + 1,
        fk_presentacion_producto: presentacion.id_presentacion_producto,
        cantidad: cantidadFinal,
        fecha_movimiento: new Date(),
        fk_tipo_movimiento: parseInt(values.fk_tipo_movimiento),
        tipo_nombre: tipo.descripcion,
        motivo: values.motivo.trim(),
        realizado_por: 'Usuario Actual'
      };

      // Actualizar estados
      setMovimientos([...movimientos, nuevoMovimiento]);
      setPresentaciones(presentaciones.map(pres =>
        pres.id_presentacion_producto === presentacion.id_presentacion_producto
          ? { ...pres, stock_actual: (pres.stock_actual || 0) + cantidadFinal }
          : pres
      ));

      // En futuro: inventoryService.createMovimiento(...)

      notifications.show({
        title: 'Movimiento registrado',
        message: 'El movimiento de inventario se ha registrado exitosamente',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'No se pudo registrar el movimiento',
        color: 'red',
      });
    }
  }, [movimientos, presentaciones, tiposMovimiento]);

  const handleDeleteProducto = useCallback((presentacion: PresentacionProducto) => {
    try {
      setPresentaciones(presentaciones.filter(p => p.id_presentacion_producto !== presentacion.id_presentacion_producto));
      
      // También eliminar el producto base si no hay más presentaciones
      const otrasPresentaciones = presentaciones.filter(p => 
        p.fk_producto === presentacion.fk_producto && 
        p.id_presentacion_producto !== presentacion.id_presentacion_producto
      );
      
      if (otrasPresentaciones.length === 0) {
        setProductos(productos.filter(p => p.id_producto !== presentacion.fk_producto));
      }

      // En futuro: inventoryService.deletePresentacion(...)

      notifications.show({
        title: 'Producto eliminado',
        message: 'El producto se ha eliminado exitosamente',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'No se pudo eliminar el producto',
        color: 'red',
      });
    }
  }, [presentaciones, productos]);

  const handleDuplicarProducto = useCallback((presentacion: PresentacionProducto) => {
    try {
      const producto = productos.find(p => p.id_producto === presentacion.fk_producto);
      if (!producto) return;

      // Crear nuevo producto base duplicado
      const nuevoProductoId = Math.max(...productos.map(p => p.id_producto), 0) + 1;
      const nuevoProducto: Producto = {
        ...producto,
        id_producto: nuevoProductoId,
        nombre_base: `${producto.nombre_base} (Copia)`,
        existencia: 0
      };

      // Crear nueva presentación duplicada
      const nuevaPresentacionId = Math.max(...presentaciones.map(p => p.id_presentacion_producto), 0) + 1;
      const nuevaPresentacion: PresentacionProducto = {
        ...presentacion,
        id_presentacion_producto: nuevaPresentacionId,
        fk_producto: nuevoProductoId,
        sku: `${presentacion.sku}-COPY`,
        producto_nombre: `${producto.nombre_base} (Copia)`,
        stock_actual: 0,
        atributos: presentacion.atributos ? [...presentacion.atributos] : []
      };

      // Actualizar estados
      setProductos([nuevoProducto, ...productos]);
      setPresentaciones([nuevaPresentacion, ...presentaciones]);

      notifications.show({
        title: 'Producto duplicado',
        message: 'El producto se ha duplicado exitosamente',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'No se pudo duplicar el producto',
        color: 'red',
      });
    }
  }, [productos, presentaciones]);

  // Funciones auxiliares
  const getMovimientosByPresentacion = useCallback((presentacionId: number) => {
    return movimientos
      .filter(mov => mov.fk_presentacion_producto === presentacionId)
      .sort((a, b) => new Date(b.fecha_movimiento).getTime() - new Date(a.fecha_movimiento).getTime());
  }, [movimientos]);

  const calcularStockAcumulado = useCallback((movimientosArray: MovimientoStock[]) => {
    let acumulado = 0;
    return movimientosArray.map(mov => {
      acumulado += mov.cantidad;
      return { ...mov, stock_acumulado: acumulado };
    });
  }, []);

  const getStockStatus = useCallback((stock: number) => {
    if (stock === 0) return { color: 'red', label: 'Sin Stock' };
    if (stock < 10) return { color: 'orange', label: 'Bajo' };
    if (stock < 50) return { color: 'yellow', label: 'Medio' };
    return { color: 'green', label: 'Alto' };
  }, []);

  // Filtrado
  const filteredPresentaciones = useCallback(() => {
    return presentaciones.filter(pres => {
      if (!filtrosAplicados) return true;
      
      const matchesSearch = searchTerm === '' || 
        pres.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pres.producto_nombre?.toLowerCase().includes(searchTerm.toLowerCase());
      
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
  }, [presentaciones, filtrosAplicados, searchTerm, stockFilter, marcaFilter, productos]);

  const handleAplicarFiltros = useCallback(() => {
    // Si todos los filtros están vacíos, no hacer nada
    if (!searchTerm.trim() && !stockFilter && !marcaFilter) {
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setFiltrosAplicados(true);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleLimpiarFiltros = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setSearchTerm('');
      setStockFilter(null);
      setMarcaFilter(null);
      setFiltrosAplicados(false);
      setIsLoading(false);
    }, 300);
  }, []);

  // Obtener marcas únicas para filtros
  const marcasUnicas = [...new Set(productos.map(p => p.marca).filter(Boolean))] as string[];
  const marcasDisponibles = marcasUnicas.map(marca => ({
    value: marca,
    label: marca
  }));

  return {
    // Estados
    productos,
    presentaciones,
    movimientos,
    isLoading,
    selectedProducto,
    selectedPresentacion,
    searchTerm,
    marcaFilter,
    stockFilter,
    filtrosAplicados,
    tiposMovimiento,
    unidades,
    atributos,
    marcasDisponibles,
    
    // Setters
    setProductos,
    setPresentaciones,
    setMovimientos,
    setIsLoading,
    setSelectedProducto,
    setSelectedPresentacion,
    setSearchTerm,
    setMarcaFilter,
    setStockFilter,
    setFiltrosAplicados,
    
    // Funciones
    handleSaveProduct,
    handleRegistrarMovimiento,
    handleDeleteProducto,
    handleDuplicarProducto,
    getMovimientosByPresentacion,
    calcularStockAcumulado,
    getStockStatus,
    filteredPresentaciones: filteredPresentaciones(),
    handleAplicarFiltros,
    handleLimpiarFiltros,
  };
};