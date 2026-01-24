import { useState, useCallback, useMemo } from 'react';
import { notifications } from '@mantine/notifications';
import type { Brand, BrandFormData } from '../types/brand.types';
import { brandService } from '../services/brand.service';

export const useBrands = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Cargar marcas
  const loadBrands = useCallback(async () => {
    setLoading(true);
    try {
      const data = await brandService.getAll();
      setBrands(data);
    } catch (error) {
      notifications.show({
        title: 'Error loading brands',
        message: 'Could not load brands',
        color: 'red',
      });
      console.error('Error loading brands:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtrar marcas
  const filteredBrands = useMemo(() => {
    return brandService.filterBrands(brands, searchTerm, filtersApplied);
  }, [brands, searchTerm, filtersApplied]);

  // CRUD Operations
  const createBrand = async (data: BrandFormData) => {
    try {
      const validationError = brandService.validateName(data.name);
      if (validationError) {
        notifications.show({
          title: 'Validation Error',
          message: validationError,
          color: 'red',
        });
        throw new Error(validationError);
      }

      const newBrand = await brandService.create(data);
      setBrands(prev => [...prev, newBrand]);
      
      notifications.show({
        title: 'Brand created',
        message: `Brand "${data.name}" created successfully`,
        color: 'green',
      });
      
      return newBrand;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Validation')) {
        throw error;
      }
      notifications.show({
        title: 'Error',
        message: 'Could not create brand',
        color: 'red',
      });
      throw error;
    }
  };

  const updateBrand = async (id: number, data: BrandFormData) => {
    try {
      const validationError = brandService.validateName(data.name, id);
      if (validationError) {
        notifications.show({
          title: 'Validation Error',
          message: validationError,
          color: 'red',
        });
        throw new Error(validationError);
      }

      const updatedBrand = await brandService.update(id, data);
      setBrands(prev => 
        prev.map(brand => brand.id_brand === id ? updatedBrand : brand)
      );
      
      notifications.show({
        title: 'Brand updated',
        message: `Brand "${data.name}" updated successfully`,
        color: 'green',
      });
      
      return updatedBrand;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Validation')) {
        throw error;
      }
      notifications.show({
        title: 'Error',
        message: 'Could not update brand',
        color: 'red',
      });
      throw error;
    }
  };

  const deleteBrand = async (id: number, name: string) => {
    try {
      await brandService.delete(id);
      setBrands(prev => prev.filter(brand => brand.id_brand !== id));
      
      notifications.show({
        title: 'Brand deleted',
        message: `Brand "${name}" deleted successfully`,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Could not delete brand',
        color: 'red',
      });
      throw error;
    }
  };

  // Search and Filters
  const handleSearch = () => {
    setSearchTerm(searchInput);
    setFiltersApplied(true);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setFiltersApplied(false);
  };

  return {
    // State
    brands,
    filteredBrands,
    loading,
    searchInput,
    setSearchInput,
    filtersApplied,
    
    // Actions
    loadBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    handleSearch,
    handleClearFilters,
  };
};