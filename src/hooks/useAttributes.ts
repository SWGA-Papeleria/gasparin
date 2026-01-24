import { useState, useCallback, useMemo } from 'react';
import { notifications } from '@mantine/notifications';
import type { Attribute, AttributeValue, AttributeFormData } from '../types/attribute.types';
import { attributeService } from '../services/attribute.service';

export const useAttributes = () => {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Cargar atributos
  const loadAttributes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await attributeService.getAll();
      setAttributes(data);
    } catch (error) {
      notifications.show({
        title: 'Error loading attributes',
        message: 'Could not load attributes',
        color: 'red',
      });
      console.error('Error loading attributes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtrar atributos
  const filteredAttributes = useMemo(() => {
    return attributeService.filterAttributes(attributes, searchTerm, filtersApplied);
  }, [attributes, searchTerm, filtersApplied]);

  // CRUD Operations
  const createAttribute = async (data: AttributeFormData) => {
    try {
      const validationError = attributeService.validateName(data.name);
      if (validationError) {
        notifications.show({
          title: 'Validation Error',
          message: validationError,
          color: 'red',
        });
        throw new Error(validationError);
      }

      // Validar valores
      for (const value of data.values) {
        const valueError = attributeService.validateValue(
          value.value, 
          data.values.filter(v => v.id_value !== value.id_value),
          value.id_value
        );
        if (valueError) {
          notifications.show({
            title: 'Value Error',
            message: `${valueError}: "${value.value}"`,
            color: 'red',
          });
          throw new Error(valueError);
        }
      }

      const newAttribute = await attributeService.create(data);
      setAttributes(prev => [...prev, newAttribute]);
      
      notifications.show({
        title: 'Attribute created',
        message: `Attribute "${data.name}" created successfully`,
        color: 'green',
      });
      
      return newAttribute;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('Validation') || error.message.includes('Value'))) {
        throw error;
      }
      notifications.show({
        title: 'Error',
        message: 'Could not create attribute',
        color: 'red',
      });
      throw error;
    }
  };

  const updateAttribute = async (id: number, data: AttributeFormData) => {
    try {
      const validationError = attributeService.validateName(data.name, id);
      if (validationError) {
        notifications.show({
          title: 'Validation Error',
          message: validationError,
          color: 'red',
        });
        throw new Error(validationError);
      }

      // Validar valores
      for (const value of data.values) {
        const valueError = attributeService.validateValue(
          value.value, 
          data.values.filter(v => v.id_value !== value.id_value),
          value.id_value
        );
        if (valueError) {
          notifications.show({
            title: 'Value Error',
            message: `${valueError}: "${value.value}"`,
            color: 'red',
          });
          throw new Error(valueError);
        }
      }

      const updatedAttribute = await attributeService.update(id, data);
      setAttributes(prev => 
        prev.map(attr => attr.id_attribute === id ? updatedAttribute : attr)
      );
      
      notifications.show({
        title: 'Attribute updated',
        message: `Attribute "${data.name}" updated successfully`,
        color: 'green',
      });
      
      return updatedAttribute;
    } catch (error) {
      if (error instanceof Error && (error.message.includes('Validation') || error.message.includes('Value'))) {
        throw error;
      }
      notifications.show({
        title: 'Error',
        message: 'Could not update attribute',
        color: 'red',
      });
      throw error;
    }
  };

  const deleteAttribute = async (id: number, name: string) => {
    try {
      await attributeService.delete(id);
      setAttributes(prev => prev.filter(attr => attr.id_attribute !== id));
      
      notifications.show({
        title: 'Attribute deleted',
        message: `Attribute "${name}" deleted successfully`,
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Could not delete attribute',
        color: 'red',
      });
      throw error;
    }
  };

  // Value Operations
  const createTempValue = (value: string): AttributeValue => {
    return attributeService.createTempValue(value);
  };

  const updateValueInList = (values: AttributeValue[], id: number, newValue: string): AttributeValue[] => {
    return attributeService.updateValueInList(values, id, newValue);
  };

  const removeValueFromList = (values: AttributeValue[], id: number): AttributeValue[] => {
    return attributeService.removeValueFromList(values, id);
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
    attributes,
    filteredAttributes,
    loading,
    searchInput,
    setSearchInput,
    filtersApplied,
    
    // Actions
    loadAttributes,
    createAttribute,
    updateAttribute,
    deleteAttribute,
    createTempValue,
    updateValueInList,
    removeValueFromList,
    handleSearch,
    handleClearFilters,
  };
};