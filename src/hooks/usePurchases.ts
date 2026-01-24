// src/hooks/usePurchases.ts
import { useState, useEffect, useCallback } from 'react';
import { purchasesService } from '../services/purchases.service';
import type {
  Proveedor,
  ProductoCompra,
  PresentacionProducto,
  Producto,
  Compra
} from '../types/purchases.types';

export const usePurchases = () => {
  // Estados para datos
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [presentaciones, setPresentaciones] = useState<PresentacionProducto[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  
  // Estados para UI y filtros
  const [loading, setLoading] = useState({
    proveedores: false,
    productos: false,
    presentaciones: false,
    compras: false,
    filtros: false
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filtrosAplicados, setFiltrosAplicados] = useState(false);
  
  // Cargar datos iniciales
  useEffect(() => {
    loadProveedores();
    loadProductos();
    loadPresentaciones();
    loadCompras();
  }, []);

  const loadProveedores = async () => {
    setLoading(prev => ({ ...prev, proveedores: true }));
    try {
      const data = await purchasesService.getProveedores();
      setProveedores(data);
    } catch (error) {
      console.error('Error cargando proveedores:', error);
    } finally {
      setLoading(prev => ({ ...prev, proveedores: false }));
    }
  };

  const loadProductos = async () => {
    setLoading(prev => ({ ...prev, productos: true }));
    try {
      const data = await purchasesService.getProductos();
      setProductos(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(prev => ({ ...prev, productos: false }));
    }
  };

  const loadPresentaciones = async () => {
    setLoading(prev => ({ ...prev, presentaciones: true }));
    try {
      const data = await purchasesService.getPresentaciones();
      setPresentaciones(data);
    } catch (error) {
      console.error('Error cargando presentaciones:', error);
    } finally {
      setLoading(prev => ({ ...prev, presentaciones: false }));
    }
  };

  const loadCompras = async () => {
    setLoading(prev => ({ ...prev, compras: true }));
    try {
      const data = await purchasesService.getCompras();
      setCompras(data);
    } catch (error) {
      console.error('Error cargando compras:', error);
    } finally {
      setLoading(prev => ({ ...prev, compras: false }));
    }
  };

  // Funciones de búsqueda y filtros
  const handleAplicarFiltros = useCallback(() => {
    setLoading(prev => ({ ...prev, filtros: true }));
    setFiltrosAplicados(true);
    
    // Simular búsqueda asíncrona
    setTimeout(() => {
      setLoading(prev => ({ ...prev, filtros: false }));
    }, 500);
  }, []);

  const handleLimpiarFiltros = useCallback(() => {
    setLoading(prev => ({ ...prev, filtros: true }));
    setSearchTerm('');
    setFiltrosAplicados(false);
    
    // Simular limpieza
    setTimeout(() => {
      setLoading(prev => ({ ...prev, filtros: false }));
    }, 300);
  }, []);

  // Funciones de compras
  const handleDeleteCompra = async (id: number) => {
    try {
      await purchasesService.deleteCompra(id);
      setCompras(prev => prev.filter(compra => compra.id_compra !== id));
      return true;
    } catch (error) {
      console.error('Error eliminando compra:', error);
      return false;
    }
  };

  const handleValidateCompra = async (id: number, productosValidacion: ProductoCompra[]) => {
    try {
      const compraValidada = await purchasesService.validateCompra(id, productosValidacion);
      setCompras(prev => prev.map(compra => 
        compra.id_compra === id ? compraValidada : compra
      ));
      return compraValidada;
    } catch (error) {
      console.error('Error validando compra:', error);
      throw error;
    }
  };

  // Funciones auxiliares
  const getEstadoColor = (estado: string) => {
    const colors = {
      pendiente: 'yellow',
      validado: 'green'
    };
    return colors[estado as keyof typeof colors] || 'gray';
  };

  const getEstadoText = (estado: string) => {
    const texts = {
      pendiente: 'Pendiente',
      validado: 'Validado'
    };
    return texts[estado as keyof typeof texts] || estado;
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return {
    // Datos
    proveedores,
    productos,
    presentaciones,
    compras,
    loading,
    
    // Estados de filtros
    searchTerm,
    setSearchTerm,
    filtrosAplicados,
    
    // Funciones
    handleAplicarFiltros,
    handleLimpiarFiltros,
    handleDeleteCompra,
    handleValidateCompra,
    
    // Funciones auxiliares
    getEstadoColor,
    getEstadoText,
    formatFecha,
    
    // Loaders
    setLoading
  };
};