import {
  IconClockHour7,
  IconCreditCard,
  IconBuildingStore,
  IconCategory,
  IconShoppingCart,
  IconBox,
  IconUsers,
  IconClipboardList,
  IconFileAnalytics,
} from '@tabler/icons-react';

export type UserRole = 'Superusuario' | 'Administrador' | 'Empleado';

export interface NavigationItem {
  icon: React.FC<any>;
  label: string;
  to?: string;
  roles: UserRole[];
  links?: { label: string; to: string }[];
}

export const NavigationData: NavigationItem[] = [
  {
    icon: IconClockHour7,
    label: 'Panel de métricas',
    to: '',
    roles: ['Superusuario', 'Administrador', 'Empleado']
  },
  {
    icon: IconCreditCard,
    label: 'Punto de Venta',
    to: 'pos',
    roles: ['Superusuario', 'Administrador', 'Empleado']
  },
  {
    icon: IconBuildingStore,
    label: 'Inventario',
    to: 'inventario',
    roles: ['Superusuario', 'Administrador', 'Empleado'],
  },
  {
    icon: IconCategory,
    label: 'Catálogos',
    roles: ['Superusuario', 'Administrador', 'Empleado'],
    links: [
      { label: 'Marcas', to: 'marcas' },
      { label: 'Unidades de Medida', to: 'unidad-medida' },
      { label: 'Atributos', to: 'atributos' },
    ],
  },
  {
    icon: IconShoppingCart,
    label: 'Ventas',
    to: 'ventas',
    roles: ['Superusuario', 'Administrador', 'Empleado']
  },
  {
    icon: IconBox,
    label: 'Compras',
    to: 'compras',
    roles: ['Superusuario', 'Administrador', 'Empleado']
  },
  {
    icon: IconUsers,
    label: 'Contactos',
    roles: ['Superusuario', 'Administrador', 'Empleado'],
    links: [
      { label: 'Clientes', to: 'clientes' },
      { label: 'Proveedores', to: 'proveedores' },
    ],
  },
  {
    icon: IconClipboardList,
    label: 'Pedidos',
    to: 'pedidos',
    roles: ['Superusuario', 'Administrador', 'Empleado']
  },
  {
    icon: IconFileAnalytics,
    label: 'Reportes',
    to: 'reportes',
    roles: ['Superusuario', 'Administrador']
  },
  {
    icon: IconUsers,
    label: 'Usuarios',
    to: 'usuarios',
    roles: ['Superusuario']
  },
];