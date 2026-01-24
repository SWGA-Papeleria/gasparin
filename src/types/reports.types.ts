// types/reports.types.ts
export type ReportModule = 'ventas' | 'inventario' | 'compras' | 'pedidos';
export type ReportPeriod = 'semanal' | 'mensual';

export interface ReporteAutomatico {
  id: number;
  tipo: string;
  modulo: ReportModule;
  periodo: string;
  fechaGeneracion: string;
  rutaArchivo: string;
}

export interface ReportsFilters {
  searchTerm?: string;
  modulo?: ReportModule | null;
  periodo?: ReportPeriod | null;
  aplicados: boolean;
}