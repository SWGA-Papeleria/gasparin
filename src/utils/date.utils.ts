// utils/date.utils.ts
export const getDefaultDates = (period: string): { startDate: string; endDate: string } => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  if (period === 'Hoy') {
    return { startDate: todayStr, endDate: todayStr };
  }
  
  if (period === 'Ayer') {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return { startDate: yesterday.toISOString().split('T')[0], endDate: yesterday.toISOString().split('T')[0] };
  }
  
  // Por defecto: últimos 30 días
  const defaultStart = new Date(today);
  defaultStart.setDate(defaultStart.getDate() - 30);
  return { startDate: defaultStart.toISOString().split('T')[0], endDate: todayStr };
};

export const formatFecha = (fecha: string): string => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const filtrarPorFecha = (fechaVenta: string, filtro: string): boolean => {
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