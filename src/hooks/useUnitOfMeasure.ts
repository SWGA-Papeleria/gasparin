import { useState, useCallback, useMemo } from 'react';
import { notifications } from '@mantine/notifications';
import type { UnitOfMeasure, UnitOfMeasureFormData } from '../types/unit-of-measure.types';
import { unitOfMeasureService } from '../services/unit-of-measure.service';

export const useUnitOfMeasure = () => {
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Cargar unidades
  const loadUnits = useCallback(async () => {
    setLoading(true);
    try {
      const data = await unitOfMeasureService.getAll();
      setUnits(data);
    } catch (error) {
      notifications.show({
        title: 'Error loading units',
        message: 'Could not load units of measure',
        color: 'red',
      });
      console.error('Error loading units:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtrar unidades
  const filteredUnits = useMemo(() => {
    return unitOfMeasureService.filterUnits(units, searchTerm, filtersApplied);
  }, [units, searchTerm, filtersApplied]);

  // CRUD Operations
  const createUnit = async (data: UnitOfMeasureFormData) => {
    try {
      const validationError = unitOfMeasureService.validateName(data.name);
      if (validationError) {
        notifications.show({
          title: 'Validation Error',
          message: validationError,
          color: 'red',
        });
        throw new Error(validationError);
      }

      const newUnit = await unitOfMeasureService.create(data);
      setUnits(prev => [...prev, newUnit]);
      
      notifications.show({
        title: 'Unit created',
        message: `Unit "${data.name}" created successfully`,
        color: 'green',
      });
      
      return newUnit;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Validation')) {
        throw error;
      }
      notifications.show({
        title: 'Error',
        message: 'Could not create unit',
        color: 'red',
      });
      throw error;
    }
  };

  const updateUnit = async (id: number, data: UnitOfMeasureFormData) => {
    try {
      const validationError = unitOfMeasureService.validateName(data.name, id);
      if (validationError) {
        notifications.show({
          title: 'Validation Error',
          message: validationError,
          color: 'red',
        });
        throw new Error(validationError);
      }

      const updatedUnit = await unitOfMeasureService.update(id, data);
      setUnits(prev => 
        prev.map(unit => unit.id_unit === id ? updatedUnit : unit)
      );
      
      notifications.show({
        title: 'Unit updated',
        message: `Unit "${data.name}" updated successfully`,
        color: 'green',
      });
      
      return updatedUnit;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Validation')) {
        throw error;
      }
      notifications.show({
        title: 'Error',
        message: 'Could not update unit',
        color: 'red',
      });
      throw error;
    }
  };

  const deleteUnit = async (id: number, name: string) => {
    try {
      await unitOfMeasureService.delete(id);
      setUnits(prev => prev.filter(unit => unit.id_unit !== id));
      
      notifications.show({
        title: 'Unit deleted',
        message: `Unit "${name}" deleted successfully`,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Could not delete unit',
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
    units,
    filteredUnits,
    loading,
    searchInput,
    setSearchInput,
    filtersApplied,
    
    // Actions
    loadUnits,
    createUnit,
    updateUnit,
    deleteUnit,
    handleSearch,
    handleClearFilters,
  };
};