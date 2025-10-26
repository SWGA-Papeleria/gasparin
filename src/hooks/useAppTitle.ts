// src/hooks/useAppTitle.ts

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    IconBuildingStore,
    IconUsers,
    IconFileAnalytics,
    IconShoppingCart,
    IconClockHour7, 
    IconClipboardList,
    IconCreditCard, 
} from '@tabler/icons-react';


// --------------------------------------------------
// TIPOS DE DATOS CENTRALIZADOS
// --------------------------------------------------
export type UserRole = 'Superusuario' | 'Administrador' | 'Empleado';

export interface LinkData {
    icon: React.FC<any>;
    label: string;
    to?: string; 
    roles: UserRole[]; 
    initiallyOpened?: boolean;
    links?: { label: string; to: string }[];
}

// --------------------------------------------------
// DATA DE ENLACES CENTRALIZADA
// --------------------------------------------------
export const linksData: LinkData[] = [
    { 
        icon: IconClockHour7, 
        label: 'Dashboard', 
        to: '', 
        roles: ['Superusuario', 'Administrador', 'Empleado'] 
    }, 
    { 
        icon: IconCreditCard, 
        label: 'Punto de Venta', 
        to: 'pos', 
        roles: ['Superusuario','Administrador', 'Empleado'] 
    }, 
    { 
        icon: IconBuildingStore, 
        label: 'Inventario', 
        to: 'inventario', 
        roles: ['Superusuario', 'Administrador', 'Empleado'] 
    }, 
    {
        icon: IconShoppingCart,
        label: 'Ventas y Compras',
        roles: ['Superusuario', 'Administrador', 'Empleado'],
        links: [
            { label: 'Ventas', to: 'ventas' }, 
            { label: 'Compras', to: 'compras' }, 
        ],
    },
    { 
        icon: IconUsers, 
        label: 'Clientes y Proveedores', 
        to: 'contactos',
        roles: ['Superusuario', 'Administrador', 'Empleado'] 
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

// --------------------------------------------------
// HOOK DE LÓGICA DEL TÍTULO
// --------------------------------------------------

export const useAppTitle = (isLoginPage: boolean = false) => {
    const location = useLocation();
    const APP_SUFFIX = ' | Papelería Gasparín';

    // Lógica de Login (TÍTULO FIJO)
    if (isLoginPage) {
        useEffect(() => {
            document.title = `Iniciar Sesión${APP_SUFFIX}`; 
        }, []);
        return; 
    }

    // Lógica de Dashboard (TÍTULO DINÁMICO)
    const getPageTitle = () => {
        const currentPath = location.pathname.split('/').filter(p => p.length > 0);
        const routeKey = currentPath.length > 1 ? currentPath[1] : ''; 
        
        let currentTitle: string | undefined;

        const mainLink = linksData.find(link => link.to === routeKey);
        if (mainLink) {
            currentTitle = mainLink.label;
        } 
        
        if (!currentTitle) {
            const submenuLinks = linksData.flatMap(link => link.links || []);
            const subLink = submenuLinks.find(link => link.to === routeKey);
            
            if (subLink) {
                currentTitle = subLink.label;
            }
        }

        return currentTitle || routeKey.charAt(0).toUpperCase() + routeKey.slice(1) || 'Panel de Control';
    };

    const pageTitle = getPageTitle();
    
    useEffect(() => {
        document.title = `${pageTitle}${APP_SUFFIX}`;
    }, [pageTitle]);
};