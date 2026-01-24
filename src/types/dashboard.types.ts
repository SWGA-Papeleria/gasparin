export interface StatCardProps {
  title: string;
  value: string;
  description: string;
  valueColor?: string;
  icon?: React.ReactNode;
}

export interface FilterControlsProps {
  period: string;
  setPeriod: (period: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  isLoading?: boolean;
}

export interface DashboardMetrics {
  sales: { value: string; description: string; color: string };
  transactions: { value: string; description: string; color: string };
  avgTicket: { value: string; description: string; color: string };
  lowStock: { value: string; description: string; color: string };
  urgentOrders: { value: string; description: string; color: string };
  activeClients: { value: string; description: string; color: string };
}

export interface FilterParams {
  period: string;
  startDate: string;
  endDate: string;
}

export interface Product {
  name: string;
  quantity: number;
  category: string;
  change: string;
}

export interface CategorySale {
  name: string;
  amount: number;
  percentage: number;
}

export interface Alert {
  type: 'stock' | 'sale' | 'order' | 'supplier' | 'payment';
  message: string;
  color: string;
  date: string;
  priority: 'Alta' | 'Media' | 'Baja';
}