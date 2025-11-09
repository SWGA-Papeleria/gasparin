// MainLayout.tsx (MODIFICADO)
import { useState, useEffect} from 'react';
import {
  AppShell,
  Text,
  Group,
  Code,
  Box,
  ScrollArea,
  UnstyledButton,
  ThemeIcon,
  Collapse,
  rem,
  createTheme,
  MantineProvider,
  Stack, 
} from '@mantine/core';

import {
  IconChevronRight,
  IconBuildingStore,
  IconUsers,
  IconFileAnalytics,
  IconShoppingCart,
  IconPoint,
  IconLogout,
  IconClockHour7, 
  IconClipboardList,
  IconBox,
  IconCreditCard, 
  IconUser,
  IconTruck,
  IconCategory, // NUEVO: Para Catálogos
  IconPackages, // NUEVO: Para Productos
  IconRuler, // NUEVO: Para Unidad de Medida
  IconTags, // NUEVO: Para Atributos
} from '@tabler/icons-react';

import { useNavigate, Routes, Route, useLocation } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; 

import Dashboard from '../pages/view/Dashboard'; 
import POS from '../pages/view/POS';
import Inventory from '../pages/view/Inventory';
import Sales from '../pages/view/Sales';
import Purchases from '../pages/view/Purchases';
import NewPurchase from '../pages/view/NewPurchase';
// NUEVOS IMPORTS PARA LOS CATÁLOGOS
import UnitOfMeasure from '../pages/view/UnitOfMeasure';
import Attributes from '../pages/view/Attributes';
import Products from '../pages/view/Products';


const mainTheme = createTheme({
    colors: {
        'dark-gray': ['#f0f0f0', '#e0e0e0', '#c0c0c0', '#a0a0a0', '#808080', '#606060', '#404040', '#2d2d2d', '#1a1a1a', '#0a0a0a'],
    },
}); 

type UserRole = 'Superusuario' | 'Administrador' | 'Empleado';

interface LinkData {
    icon: React.FC<any>;
    label: string;
    to?: string; 
    roles: UserRole[]; 
    initiallyOpened?: boolean;
    links?: { label: string; to: string }[];
}

interface LinksGroupProps extends LinkData {
    activePath: string;
}

const linksData: LinkData[] = [
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
    // NUEVO: Sección Catálogos con submenús
    {
        icon: IconCategory,
        label: 'Catálogos',
        roles: ['Superusuario', 'Administrador', 'Empleado'],
        links: [
            { label: 'Productos', to: 'productos' },
            { label: 'Unidad de Medida', to: 'unidad-medida' },
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

function LinksGroup({ icon: Icon, label, initiallyOpened, links, to, activePath }: LinksGroupProps) {
    const hasLinks = Array.isArray(links);
    const [opened, setOpened] = useState(initiallyOpened || false);
    const navigate = useNavigate();

    const getTargetRoute = (path?: string) => `/dashboard/${path || ''}`.replace('//', '/');

    const isSubLinkActive = hasLinks && links.some(link => activePath === getTargetRoute(link.to));
    const isDirectMatch = to !== undefined ? activePath === getTargetRoute(to) : false;
    const isControlActive = isDirectMatch || isSubLinkActive;

    useEffect(() => {
        if (hasLinks && isSubLinkActive) {
            setOpened(true);
        }
    }, [activePath, hasLinks, isSubLinkActive]); 
    
    const handleNavigation = (path: string) => {
        const targetPath = getTargetRoute(path);
        navigate(targetPath); 
    };
    
    const linkControlStyle = (isActive: boolean) => ({ 
        padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-md)',
        borderRadius: 'var(--mantine-radius-sm)',
        fontWeight: 500,
        display: 'block',
        width: '100%',
        color: 'white', 
        backgroundColor: isActive ? 'var(--mantine-color-blue-filled)' : 'transparent',
        '&:hover': {
            backgroundColor: isActive ? 'var(--mantine-color-blue-filled)' : 'rgba(255, 255, 255, 0.1)',
        },
    });

    const linkStyle = (linkTo: string) => { 
        const isLinkActive = activePath === getTargetRoute(linkTo);

        return {
            padding: rem(6),
            fontWeight: 500,
            display: 'block',
            textDecoration: 'none',
            fontSize: 'var(--mantine-font-size-sm)',
            cursor: 'pointer', 
            borderRadius: 'var(--mantine-radius-sm)', 
            color: isLinkActive ? 'white' : 'var(--mantine-color-gray-3)', 
            backgroundColor: isLinkActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            '&:hover': {
                color: 'white', 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            },
        };
    };

    const control = (
        <UnstyledButton
            onClick={() => (hasLinks ? setOpened((o) => !o) : handleNavigation(to!))}
            style={linkControlStyle(isControlActive)}
        >
            <Group justify="space-between" gap={0}>
                <Box style={{ display: 'flex', alignItems: 'center' }}>
                    <ThemeIcon variant="light" size={30} bg="rgba(255, 255, 255, 0.1)" c="white">
                        <Icon size="1.1rem" />
                    </ThemeIcon>
                    <Box ml="md">{label}</Box>
                </Box>
                {hasLinks && (
                    <IconChevronRight
                        size="1rem"
                        stroke={1.5}
                        style={{
                            transition: 'transform 200ms ease',
                            transform: opened ? 'rotate(90deg)' : 'none',
                            color: 'white', 
                        }}
                    />
                )}
            </Group>
        </UnstyledButton>
    );

    const items = (hasLinks ? links : []).map((link) => (
        <Text<'a'>
            component="a"
            style={{ ...linkStyle(link.to), paddingLeft: rem(50) }}
            key={link.label}
            onClick={() => handleNavigation(link.to)} 
        >
            {link.label}
        </Text>
    ));

    return (
        <Box>
            {control}
            {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
        </Box>
    );
}

export default function MainLayout() { 
  
  const { user, logout } = useAuth(); 
  const location = useLocation();

  const mockUser = { name: 'Usuario Demo', role: 'Superusuario' as UserRole };
  const currentUser = user || mockUser;

  const filteredLinks = linksData.filter(item => 
      currentUser && item.roles.includes(currentUser.role)
  );

  const navLinks = filteredLinks.map((item) => (
    <LinksGroup 
        {...item} 
        key={item.label} 
        activePath={location.pathname} 
    />
));

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

    if (currentTitle) {
        return currentTitle;
    }

    return routeKey.charAt(0).toUpperCase() + routeKey.slice(1) || 'Panel de Control';
};

const pageTitle = getPageTitle();
useEffect(() => {
    const suffix = ' | Papelería Gasparín'; 
    document.title = `${pageTitle}${suffix}`;
}, [pageTitle]);

  return (
    <MantineProvider theme={mainTheme}>
      <AppShell
        navbar={{ width: 300, breakpoint: 'sm' }}
        padding="md"
      >
        <AppShell.Navbar p="md" bg="#2d2d2d" c="white">
            <AppShell.Section>
                <Group justify="space-between">
                    <Text fw={700} size="lg" c="white"> 
                        Papelería Gasparín
                    </Text>
                </Group>
            </AppShell.Section>

            <Box 
                style={{ 
                    height: '1px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                    margin: 'var(--mantine-spacing-md) calc(-1 * var(--mantine-spacing-md))',
                    marginTop: rem(12),
                    marginBottom: rem(12),
                }}
            />

            <AppShell.Section
                grow
                component={ScrollArea}
                mt="md"
                mx="calc(-1 * var(--mantine-spacing-md))"
                px="var(--mantine-spacing-md)"
            >
                <Box pt={0} py="md">{navLinks}</Box>
            </AppShell.Section>

            <AppShell.Section>
              <Box 
                pt="md" 
                style={{ 
                  borderTop: `1px solid rgba(255, 255, 255, 0.1)`, 
                }}
              > 
                <Box px="md">
                  {currentUser && (
                      <Stack gap={rem(4)}> 
                          <Text size="sm" fw={600} c="white"> 
                              {currentUser.name} 
                          </Text>
                          <Text size="xs" c="var(--mantine-color-gray-3)"> 
                              Rol: <Text 
                                        span fw={700} 
                                        c={currentUser.role === 'Superusuario' ? 'orange' : currentUser.role === 'Administrador' ? 'red' : 'green'}
                                    >
                                        {currentUser.role}
                                    </Text>
                          </Text>
                      </Stack>
                  )}
                  <UnstyledButton 
                      onClick={logout} 
                      style={{ 
                          width: '100%', 
                          marginTop: rem(10), 
                            padding: 'var(--mantine-spacing-xs) 0', 
                            borderRadius: 'var(--mantine-radius-sm)',
                            color: 'var(--mantine-color-red-3)', 
                            fontSize: 'var(--mantine-font-size-sm)',
                            textAlign: 'left',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: rem(8),
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                                padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-md)', 
                            },
                      }}
                  >
                      <IconLogout size="1.1rem" stroke={1.5} />
                    Cerrar Sesión
                  </UnstyledButton>
                </Box>
              </Box>
            </AppShell.Section>
        </AppShell.Navbar>

        <AppShell.Main bg="var(--mantine-color-gray-0)"> 
            <Routes>
                <Route path="/" element={<Dashboard />} /> 
                <Route path="pos" element={<POS />} /> 
                <Route path="inventario" element={<Inventory />} /> 
                {/* NUEVAS RUTAS para Catálogos */}
                <Route path="productos" element={<Products />} />
                <Route path="unidad-medida" element={<UnitOfMeasure />} />
                <Route path="atributos" element={<Attributes />} />
                <Route path="ventas" element={<Sales />} /> 
                <Route path="compras" element={<Purchases />} />
                <Route path="/compras/nueva" element={<NewPurchase />} />
                <Route path="clientes" element={<Text size="xl">Página de Clientes</Text>} />
                <Route path="proveedores" element={<Text size="xl">Página de Proveedores</Text>} />
                <Route path="pedidos" element={<Text size="xl">Página de Pedidos</Text>} />
                <Route path="reportes" element={<Text size="xl" c="red">Página de Reportes</Text>} />
                <Route path="usuarios" element={<Text size="xl" c="blue">Página de Usuarios</Text>} />
                <Route path="*" element={<Text size="xl" c="orange">404 - Contenido no encontrado</Text>} />
            </Routes>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}