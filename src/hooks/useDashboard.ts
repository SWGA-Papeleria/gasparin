import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import type { FilterParams } from '../types/dashboard.types';

export const useDashboard = () => {
  const [period, setPeriod] = useState<string>('Este Mes');
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [filteredData, setFilteredData] = useState<any>(null);

  const handleApplyFilters = useCallback(async () => {
    setIsLoading(true);
    
    // Simulación de carga
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const params: FilterParams = { period, startDate, endDate };
    setFilteredData(params);
    
    notifications.show({
      title: 'Filtros aplicados',
      message: period === 'Personalizado' 
        ? `Se aplicaron filtros para: ${startDate} al ${endDate}`
        : `Se aplicaron filtros para: ${period}`,
      color: 'blue',
    });
    
    setIsLoading(false);
  }, [period, startDate, endDate]);

  const handleResetFilters = useCallback(() => {
    setPeriod('Este Mes');
    const defaultStart = new Date();
    defaultStart.setDate(defaultStart.getDate() - 30);
    setStartDate(defaultStart.toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    setFilteredData(null);
    
    notifications.show({
      title: 'Filtros restablecidos',
      message: 'Los filtros se han restablecido',
      color: 'green',
    });
  }, []);

  return {
    period,
    setPeriod,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isLoading,
    filteredData,
    handleApplyFilters,
    handleResetFilters
  };
};