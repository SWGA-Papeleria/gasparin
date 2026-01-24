// hooks/useReports.ts
import { useState, useEffect, useMemo } from 'react';
import { notifications } from '@mantine/notifications';
import type { ReporteAutomatico, ReportModule, ReportPeriod } from '../types/reports.types';
import { reportsService } from '../services/reports.service';

export const useReports = () => {
  const [reports, setReports] = useState<ReporteAutomatico[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [generatingReports, setGeneratingReports] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState<ReportModule | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<ReportPeriod | null>(null);
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Cargar reportes al iniciar
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await reportsService.getReports();
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
      notifications.show({
        title: 'Error',
        message: 'No se pudieron cargar los reportes',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar reportes
  const filteredReports = useMemo(() => {
    if (!filtersApplied) return reports;
    
    return reportsService.filterReports(
      reports, 
      searchTerm, 
      filterModule, 
      filterPeriod
    );
  }, [reports, searchTerm, filterModule, filterPeriod, filtersApplied]);

  // Descargar reporte
  const downloadReport = async (reporte: ReporteAutomatico) => {
    setDownloadingId(reporte.id);
    try {
      await reportsService.downloadReport(reporte);
      notifications.show({
        title: 'Reporte descargado',
        message: `El reporte "${reporte.tipo} - ${reporte.periodo}" se ha descargado exitosamente`,
        color: 'green',
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      notifications.show({
        title: 'Error',
        message: 'No se pudo descargar el reporte',
        color: 'red',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  // Forzar generación de reportes
  const generateReports = async () => {
    setGeneratingReports(true);
    try {
      await reportsService.generateReports();
      notifications.show({
        title: 'Reportes generados',
        message: 'Los reportes automáticos se han generado exitosamente',
        color: 'green',
      });
      // Recargar reportes después de generarlos
      await loadReports();
    } catch (error) {
      console.error('Error generating reports:', error);
      notifications.show({
        title: 'Error',
        message: 'No se pudieron generar los reportes',
        color: 'red',
      });
    } finally {
      setGeneratingReports(false);
    }
  };

  // Aplicar búsqueda/filtros
  const applySearch = (searchInput: string) => {
    setSearchTerm(searchInput);
    setFiltersApplied(true);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm('');
    setFilterModule(null);
    setFilterPeriod(null);
    setFiltersApplied(false);
  };

  // Convertir string a ReportModule - NUEVA FUNCIÓN
  const handleModuleChange = (value: string | null) => {
    if (value === null) {
      setFilterModule(null);
    } else {
      // Validar que el valor sea un ReportModule válido
      const validModules: ReportModule[] = ['ventas', 'inventario', 'compras', 'pedidos'];
      if (validModules.includes(value as ReportModule)) {
        setFilterModule(value as ReportModule);
      } else {
        setFilterModule(null);
      }
    }
  };

  // Convertir string a ReportPeriod - NUEVA FUNCIÓN
  const handlePeriodChange = (value: string | null) => {
    if (value === null) {
      setFilterPeriod(null);
    } else {
      // Validar que el valor sea un ReportPeriod válido
      const validPeriods: ReportPeriod[] = ['semanal', 'mensual'];
      if (validPeriods.includes(value as ReportPeriod)) {
        setFilterPeriod(value as ReportPeriod);
      } else {
        setFilterPeriod(null);
      }
    }
  };

  return {
    // Estado
    reports,
    filteredReports,
    loading,
    downloadingId,
    generatingReports,
    searchTerm,
    filterModule,
    filterPeriod,
    filtersApplied,
    
    // Setters
    setSearchTerm,
    handleModuleChange, // Usar esta en lugar de setFilterModule
    handlePeriodChange, // Usar esta en lugar de setFilterPeriod
    
    // Métodos
    downloadReport,
    generateReports,
    applySearch,
    clearFilters,
    reloadReports: loadReports,
  };
};