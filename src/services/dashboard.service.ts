import { FilterParams, DashboardMetrics } from '../types/dashboard.types';

export const dashboardService = {
  async getMetrics(params: FilterParams): Promise<DashboardMetrics> {
    // TODO: Reemplazar con llamada real a API
    console.log('[API] Fetching metrics:', params);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      sales: { value: '$24,850', description: 'Este mes', color: 'green' },
      transactions: { value: '245', description: 'Este mes', color: 'green' },
      avgTicket: { value: '$101.43', description: 'Por venta', color: 'green' },
      lowStock: { value: '18', description: 'Productos', color: 'red' },
      urgentOrders: { value: '7', description: 'Este mes', color: 'orange' },
      activeClients: { value: '156', description: 'Nuevos este mes', color: 'green' }
    };
  },

  async getTopProducts(params: FilterParams) {
    // TODO: Reemplazar con llamada real a API
    console.log('[API] Fetching top products:', params);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return [
      { name: 'Lápices HB', quantity: 45, category: 'Escritura', change: '+12%' },
      { name: 'Cuadernos Profesionales', quantity: 32, category: 'Papelería', change: '+8%' },
      { name: 'Bolígrafos Azules', quantity: 28, category: 'Escritura', change: '+5%' },
      { name: 'Resaltadores', quantity: 24, category: 'Escritura', change: '-3%' },
      { name: 'Cartulinas', quantity: 18, category: 'Arte', change: '+15%' }
    ];
  },

  async getSalesByCategory(params: FilterParams) {
    // TODO: Reemplazar con llamada real a API
    console.log('[API] Fetching sales by category:', params);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return [
      { name: 'Escritura', amount: 2450, percentage: 35 },
      { name: 'Papelería', amount: 1890, percentage: 27 },
      { name: 'Arte', amount: 1235, percentage: 18 },
      { name: 'Oficina', amount: 856, percentage: 12 },
      { name: 'Escolar', amount: 578, percentage: 8 }
    ];
  },

  async getRecentAlerts(params: FilterParams) {
    // TODO: Reemplazar con llamada real a API
    console.log('[API] Fetching recent alerts:', params);
    await new Promise(resolve => setTimeout(resolve, 150));
    
    return [
      { 
        type: 'stock', 
        message: 'Stock bajo: Cuadernos profesionales (solo 5 unidades)', 
        color: 'red',
        date: '2024-01-15 10:30',
        priority: 'Alta' as const
      }
    ];
  }
};