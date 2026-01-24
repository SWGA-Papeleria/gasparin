// src/hooks/useOrders.ts
import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import type { Pedido, DetallePedido, EstadoPedido, PrioridadPedido } from '../types/orders.types';
import { ordersService } from '../services/orders.service';

export function useOrders() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [detallesLoading, setDetallesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string | null>(null);
  const [prioridadFilter, setPrioridadFilter] = useState<string | null>(null);
  const [fechaInicioFilter, setFechaInicioFilter] = useState<string>('');
  const [fechaFinFilter, setFechaFinFilter] = useState<string>('');
  const [filtrosAplicados, setFiltrosAplicados] = useState(false);

  // Estados para pedidos
  const [estadosPedido] = useState<EstadoPedido[]>([
    { id_estado_pedido: 1, descripcion: 'Pendiente', color: 'yellow' },
    { id_estado_pedido: 2, descripcion: 'Listo para entregar', color: 'blue' },
    { id_estado_pedido: 3, descripcion: 'Entregado', color: 'green' },
  ]);

  const [prioridadesPedido] = useState<PrioridadPedido[]>([
    { id_prioridad_pedido: 1, descripcion: 'Normal', color: 'blue' },
    { id_prioridad_pedido: 2, descripcion: 'Urgente', color: 'red' },
  ]);

  // Funciones para manejar filtros
  const handleBuscar = useCallback(() => {
    if (!searchTerm.trim() && !estadoFilter && !prioridadFilter && !fechaInicioFilter && !fechaFinFilter) {
      // Si todos los filtros están vacíos, simplemente no hace nada
      return;
    }
    setFiltrosAplicados(true);
    // Aquí normalmente se haría una llamada a la API
  }, [searchTerm, estadoFilter, prioridadFilter, fechaInicioFilter, fechaFinFilter]);

  const handleLimpiar = useCallback(() => {
    setSearchTerm('');
    setEstadoFilter(null);
    setPrioridadFilter(null);
    setFechaInicioFilter('');
    setFechaFinFilter('');
    setFiltrosAplicados(false);
  }, []);

  // Funciones para pedidos
  const cargarPedidos = useCallback(async () => {
    setLoading(true);
    try {
      // Simulación de carga
      await new Promise(resolve => setTimeout(resolve, 500));
      // En producción: const data = await ordersService.getPedidos();
      // setPedidos(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Error al cargar los pedidos',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const eliminarPedido = useCallback(async (id: number) => {
    try {
      // Simulación de eliminación
      await new Promise(resolve => setTimeout(resolve, 300));
      setPedidos(prev => prev.filter(p => p.id_pedido !== id));
      
      notifications.show({
        title: 'Pedido eliminado',
        message: 'El pedido se ha eliminado exitosamente',
        color: 'green',
      });
      return true;
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Error al eliminar el pedido',
        color: 'red',
      });
      return false;
    }
  }, []);

  const cambiarEstadoPedido = useCallback(async (id: number, nuevoEstadoId: number) => {
    try {
      // Simulación de cambio de estado
      await new Promise(resolve => setTimeout(resolve, 300));
      setPedidos(prev => prev.map(pedido => 
        pedido.id_pedido === id 
          ? { 
              ...pedido, 
              fk_estado_pedido: nuevoEstadoId,
              estado: estadosPedido.find(e => e.id_estado_pedido === nuevoEstadoId)?.descripcion || pedido.estado
            } 
          : pedido
      ));
      
      return true;
    } catch (error) {
      return false;
    }
  }, [estadosPedido]);

  const cargarDetallesPedido = useCallback(async (pedidoId: number): Promise<DetallePedido[]> => {
    setDetallesLoading(true);
    try {
      // Simulación de carga de detalles
      await new Promise(resolve => setTimeout(resolve, 500));
      // Datos de ejemplo
      if (pedidoId === 1) {
        return [
          {
            id_pedido_producto: 1,
            fk_presentacion_producto: 1,
            producto_nombre: 'Bolígrafo BIC Azul',
            sku: 'BOL-BIC-AZUL',
            cantidad: 100,
            precio_venta: 5.50,
            subtotal: 550.00
          },
          {
            id_pedido_producto: 2,
            fk_presentacion_producto: 3,
            producto_nombre: 'Cuaderno Norma A4',
            sku: 'CUAD-NORMA-A4',
            cantidad: 50,
            precio_venta: 45.00,
            subtotal: 2250.00
          }
        ];
      } else if (pedidoId === 2) {
        return [
          {
            id_pedido_producto: 3,
            fk_presentacion_producto: 2,
            producto_nombre: 'Bolígrafo BIC Negro',
            sku: 'BOL-BIC-NEGRO',
            cantidad: 200,
            precio_venta: 5.50,
            subtotal: 1100.00
          },
          {
            id_pedido_producto: 4,
            fk_presentacion_producto: 3,
            producto_nombre: 'Cuaderno Norma A4',
            sku: 'CUAD-NORMA-A4',
            cantidad: 15,
            precio_venta: 45.00,
            subtotal: 675.00
          }
        ];
      }
      // En producción: return await ordersService.getDetallesPedido(pedidoId);
      return [];
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Error al cargar los detalles del pedido',
        color: 'red',
      });
      return [];
    } finally {
      setDetallesLoading(false);
    }
  }, []);

  return {
    // Estados
    pedidos,
    loading,
    detallesLoading,
    searchTerm,
    estadoFilter,
    prioridadFilter,
    fechaInicioFilter,
    fechaFinFilter,
    filtrosAplicados,
    estadosPedido,
    prioridadesPedido,
    
    // Setters
    setPedidos,
    setSearchTerm,
    setEstadoFilter,
    setPrioridadFilter,
    setFechaInicioFilter,
    setFechaFinFilter,
    setFiltrosAplicados,
    
    // Funciones
    handleBuscar,
    handleLimpiar,
    cargarPedidos,
    eliminarPedido,
    cambiarEstadoPedido,
    cargarDetallesPedido,
  };
}