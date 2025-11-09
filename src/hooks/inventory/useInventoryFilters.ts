// src/hooks/inventory/useInventoryFilters.ts (CORREGIDO)
import { useState, useMemo } from 'react';
import type { PresentacionProducto } from './useProducts'; // ← CAMBIO: type-only import

export const useInventoryFilters = (inventario: any[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string | null>(''); // ← CAMBIO: string | null
  const [marcaFilter, setMarcaFilter] = useState<string | null>(''); // ← CAMBIO: string | null
  const [stockFilter, setStockFilter] = useState<string | null>(''); // ← CAMBIO: string | null

  // Filtrar inventario
  const inventarioFiltrado = useMemo(() => {
    return inventario.filter(item => {
      const matchesSearch = 
        item.producto?.nombre_base.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.producto?.descripcion.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategoria = 
        !categoriaFilter || item.producto?.fk_categoria.toString() === categoriaFilter;

      const matchesMarca = 
        !marcaFilter || item.producto?.fk_marca.toString() === marcaFilter;

      const matchesStock = 
        !stockFilter || 
        (stockFilter === 'bajo' && item.stock_actual < 10) ||
        (stockFilter === 'medio' && item.stock_actual >= 10 && item.stock_actual < 50) ||
        (stockFilter === 'alto' && item.stock_actual >= 50) ||
        (stockFilter === 'sin-stock' && item.stock_actual === 0);

      return matchesSearch && matchesCategoria && matchesMarca && matchesStock;
    });
  }, [inventario, searchTerm, categoriaFilter, marcaFilter, stockFilter]);

  const limpiarFiltros = () => {
    setSearchTerm('');
    setCategoriaFilter('');
    setMarcaFilter('');
    setStockFilter('');
  };

  return {
    searchTerm,
    setSearchTerm,
    categoriaFilter,
    setCategoriaFilter,
    marcaFilter,
    setMarcaFilter,
    stockFilter,
    setStockFilter,
    inventarioFiltrado,
    limpiarFiltros,
  };
};