// hooks/useSales.ts
import { useState, useMemo, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import type { Venta, EstadoVenta, MetodoPago, SalesFilterParams } from '../types/sales.types';
import { salesService } from '../services/sales.service';
import { getDefaultDates } from '../utils/date.utils';

export const useSales = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [estadosVenta, setEstadosVenta] = useState<EstadoVenta[]>([]);
  const [metodosPago, setMetodosPago] = useState<MetodoPago[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [printingVenta, setPrintingVenta] = useState<number | null>(null);
  
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtrosAplicados, setFiltrosAplicados] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await fetchSalesData();
    } catch (error) {
      handleLoadError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSalesData = async () => {
    const [estadosData, metodosData, ventasData] = await Promise.all([
      salesService.getEstadosVenta(),
      salesService.getMetodosPago(),
      salesService.getVentas()
    ]);
    
    setEstadosVenta(estadosData);
    setMetodosPago(metodosData);
    setVentas(ventasData);
  };

  const handleLoadError = (error: any) => {
    console.error('Error loading sales data:', error);
    notifications.show({
      title: 'Error',
      message: 'No se pudieron cargar los datos de ventas',
      color: 'red',
    });
  };

  const simulateSearchDelay = async (): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(), 300);
    });
  };

  const handleBuscar = async () => {
    setSearchTerm(searchInput);
    setFiltrosAplicados(true);
    
    // Simular tiempo de búsqueda solo si hay término de búsqueda
    if (searchInput.trim() || paymentFilter || statusFilter || dateFilter) {
      setIsRefreshing(true);
      await simulateSearchDelay();
      setIsRefreshing(false);
    }
  };

  const handleLimpiar = async () => {
    setSearchInput('');
    setSearchTerm('');
    setPaymentFilter(null);
    setStatusFilter(null);
    setDateFilter(null);
    setFiltrosAplicados(false);
    
    // Refrescar los datos para mostrar todas las ventas
    setIsRefreshing(true);
    await simulateSearchDelay(); // Simular tiempo de recarga
    setIsRefreshing(false);
  };

  const filtrarPorFecha = (fechaVenta: string, filtro: string) => {
    const fecha = new Date(fechaVenta);
    const hoy = new Date();

    switch (filtro) {
      case 'hoy':
        return fecha.toDateString() === hoy.toDateString();
      case 'semana':
        const inicioSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay()));
        return fecha >= inicioSemana;
      case 'mes':
        return fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
      default:
        return true;
    }
  };

  const filteredVentas = useMemo(() => {
    // Si no se han aplicado filtros, mostrar todas las ventas
    if (!filtrosAplicados) return ventas;
    
    // Filtrar por término de búsqueda
    let filtered = ventas.filter(venta =>
      venta.folio_venta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (venta.cliente_nombre && venta.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    // Aplicar filtros adicionales
    filtered = filtered.filter(venta => {
      const matchesPayment = !paymentFilter || venta.fk_metodo_pago.toString() === paymentFilter;
      const matchesStatus = !statusFilter || venta.fk_estado_venta.toString() === statusFilter;
      const matchesDate = !dateFilter || filtrarPorFecha(venta.fecha_venta, dateFilter);
      return matchesPayment && matchesStatus && matchesDate;
    });
    
    return filtered;
  }, [ventas, searchTerm, paymentFilter, statusFilter, dateFilter, filtrosAplicados]);

  const handleUpdateVenta = async (ventaActualizada: Venta) => {
    try {
      const updatedVenta = await salesService.updateVenta(ventaActualizada);
      setVentas(ventas.map(v => 
        v.id_venta === updatedVenta.id_venta ? updatedVenta : v
      ));
      
      return true;
    } catch (error) {
      console.error('Error updating sale:', error);
      return false;
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'finalizada': return 'green';
      case 'cancelada': return 'red';
      case 'devolucion': return 'orange';
      default: return 'gray';
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const simulatePrintDelay = async (): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(), 1500);
    });
  };

  const handlePrint = async (venta: Venta) => {
    setPrintingVenta(venta.id_venta);
    
    try {
      console.log('Descargando recibo de venta:', venta.folio_venta);
      
      // Simular tiempo de descarga del recibo
      await simulatePrintDelay();
      
      // Mostrar notificación de éxito
      notifications.show({
        title: 'Recibo descargado',
        message: `El recibo de la venta "${venta.folio_venta}" se ha descargado exitosamente`,
        color: 'green',
      });
      
    } catch (error) {
      console.error('Error al descargar recibo:', error);
      
      // Mostrar notificación de error
      notifications.show({
        title: 'Error',
        message: 'No se pudo descargar el recibo',
        color: 'red',
      });
      
    } finally {
      setPrintingVenta(null);
    }
  };

  const isPrinting = (ventaId: number) => {
    return printingVenta === ventaId;
  };

  return {
    // Estado
    ventas,
    estadosVenta,
    metodosPago,
    isLoading,
    isRefreshing,
    printingVenta,
    searchInput,
    searchTerm,
    filtrosAplicados,
    paymentFilter,
    statusFilter,
    dateFilter,
    filteredVentas,
    
    // Setters
    setSearchInput,
    setSearchTerm,
    setPaymentFilter,
    setStatusFilter,
    setDateFilter,
    setFiltrosAplicados,
    
    // Funciones
    handleBuscar,
    handleLimpiar,
    handleUpdateVenta,
    handlePrint,
    getStatusColor,
    formatFecha,
    isPrinting
  };
};