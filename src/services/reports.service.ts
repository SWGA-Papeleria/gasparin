// services/reports.service.ts
import type { ReporteAutomatico } from '../types/reports.types';

// Datos de ejemplo - en producción vendrían de una API
const reportesEjemplo: ReporteAutomatico[] = [
  {
    id: 1,
    tipo: 'Ventas Semanales',
    modulo: 'ventas',
    periodo: 'Semana 15-21 Ene 2024',
    fechaGeneracion: '21/01/2024 23:59',
    rutaArchivo: '/reportes/ventas/semana-15-21-ene-2024.pdf'
  },
  {
    id: 2,
    tipo: 'Inventario Mensual',
    modulo: 'inventario',
    periodo: 'Enero 2024',
    fechaGeneracion: '31/01/2024 23:59',
    rutaArchivo: '/reportes/inventario/enero-2024.pdf'
  },
  {
    id: 3,
    tipo: 'Compras Mensuales',
    modulo: 'compras',
    periodo: 'Enero 2024',
    fechaGeneracion: '31/01/2024 23:59',
    rutaArchivo: '/reportes/compras/enero-2024.pdf'
  },
  {
    id: 4,
    tipo: 'Pedidos Pendientes',
    modulo: 'pedidos',
    periodo: 'Semana 15-21 Ene 2024',
    fechaGeneracion: '21/01/2024 23:59',
    rutaArchivo: '/reportes/pedidos/semana-15-21-ene-2024.pdf'
  },
  {
    id: 5,
    tipo: 'Ventas Semanales',
    modulo: 'ventas',
    periodo: 'Semana 8-14 Ene 2024',
    fechaGeneracion: '14/01/2024 23:59',
    rutaArchivo: '/reportes/ventas/semana-8-14-ene-2024.pdf'
  }
];

export const reportsService = {
  // Obtener todos los reportes (simulado)
  getReports: async (): Promise<ReporteAutomatico[]> => {
    // En producción, aquí harías un fetch a la API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...reportesEjemplo]);
      }, 300);
    });
  },

  // Descargar un reporte (simulado)
  downloadReport: async (reporte: ReporteAutomatico): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // En producción, aquí manejarías la descarga real
        console.log('Descargando reporte:', reporte.rutaArchivo);
        resolve();
      }, 1500);
    });
  },

  // Forzar generación de reportes (simulado)
  generateReports: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Reportes generados exitosamente');
        resolve();
      }, 2000);
    });
  },

  // Filtrar reportes localmente (opcional - normalmente se haría en el backend)
  filterReports: (
    reports: ReporteAutomatico[], 
    searchTerm: string, 
    modulo: string | null, 
    periodo: string | null
  ): ReporteAutomatico[] => {
    let filtered = reports.filter(reporte =>
      reporte.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reporte.periodo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    filtered = filtered.filter(reporte => {
      const coincideModulo = !modulo || reporte.modulo === modulo;
      const coincidePeriodo = !periodo || 
        (periodo === 'semanal' && reporte.tipo.includes('Semanales')) ||
        (periodo === 'mensual' && reporte.tipo.includes('Mensual'));
      
      return coincideModulo && coincidePeriodo;
    });
    
    return filtered;
  }
};