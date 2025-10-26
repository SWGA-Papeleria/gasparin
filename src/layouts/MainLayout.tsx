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
} from '@tabler/icons-react';

import { useNavigate, Routes, Route, useLocation } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; 

import Dashboard from '../pages/view/Dashboard'; 
import POS from '../pages/view/POS';

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

// ----------------------------------------------------------------------------------
// NUEVA INTERFACE DE PROPS PARA LINKSGROUP
// ----------------------------------------------------------------------------------
interface LinksGroupProps extends LinkData {
    activePath: string; // La ruta actual de react-router-dom
}

const linksData: LinkData[] = [
    { 
        icon: IconClockHour7, 
        label: 'Dashboard', 
        to: '', 
        roles: ['Superusuario', 'Administrador', 'Empleado'] 
    }, 
    { 
        icon: IconCreditCard    , 
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

// ----------------------------------------------------------------------------------
// CAMBIADO: Acepta activePath: string y lógica de resaltado corregida
// ----------------------------------------------------------------------------------
function LinksGroup({ icon: Icon, label, initiallyOpened, links, to, activePath }: LinksGroupProps) {
    const hasLinks = Array.isArray(links);
    const [opened, setOpened] = useState(initiallyOpened || false);
    const navigate = useNavigate();

    // Helper para construir la ruta absoluta que esperamos
    const getTargetRoute = (path?: string) => `/dashboard/${path || ''}`.replace('//', '/');

    // 1. Determinar si algún sub-enlace está activo (esto resalta el grupo padre)
    const isSubLinkActive = hasLinks && links.some(link => activePath === getTargetRoute(link.to));

    // 2. Determinar si el enlace principal es una ruta directa y está activo
    // NOTA: 'to' debe ser comprobado para evitar que enlaces sin 'to' (como V&C) caigan en la ruta raíz '/'
    const isDirectMatch = to !== undefined ? activePath === getTargetRoute(to) : false;

    // 3. El control principal está activo si es la ruta directa O si alguno de sus sub-enlaces está activo.
    const isControlActive = isDirectMatch || isSubLinkActive;

    // ----------------------------------------------------------------------------------
    // AÑADIDO: Mantiene el submenú abierto si un hijo está activo
    // ----------------------------------------------------------------------------------
    useEffect(() => {
        if (hasLinks && isSubLinkActive) {
            setOpened(true);
        }
    }, [activePath, hasLinks, isSubLinkActive]); 
    // ----------------------------------------------------------------------------------
    
    const handleNavigation = (path: string) => {
        // Asegura que todas las navegaciones internas usen el prefijo /dashboard/
        const targetPath = getTargetRoute(path);
        navigate(targetPath); 
    };
    
    // CORRECCIÓN/MEJORA: linkControlStyle ahora es una función para manejar el resaltado
    const linkControlStyle = (isActive: boolean) => ({ 
        padding: 'var(--mantine-spacing-xs) var(--mantine-spacing-md)',
        borderRadius: 'var(--mantine-radius-sm)',
        fontWeight: 500,
        display: 'block',
        width: '100%',
        color: 'white', 
        backgroundColor: isActive ? 'var(--mantine-color-blue-filled)' : 'transparent', // RESALTADO AZUL
        '&:hover': {
            backgroundColor: isActive ? 'var(--mantine-color-blue-filled)' : 'rgba(255, 255, 255, 0.1)', // Mantiene el color si ya está activo
        },
    });

    // CORRECCIÓN/MEJORA: linkStyle es una función que añade cursor: pointer y maneja el resaltado del hijo
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
            
            // Colores activos e inactivos
            color: isLinkActive ? 'white' : 'var(--mantine-color-gray-3)', 
            backgroundColor: isLinkActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent', // Fondo para el sub-enlace activo

            '&:hover': {
                color: 'white', 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            },
        };
    };

    const control = (
        <UnstyledButton
            onClick={() => (hasLinks ? setOpened((o) => !o) : handleNavigation(to!))}
            style={linkControlStyle(isControlActive)} // <-- USA EL ESTILO ACTIVO
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
            style={{ ...linkStyle(link.to), paddingLeft: rem(50) }} // <-- PASA LA RUTA DEL SUB-ENLACE AL ESTILO
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
  const location = useLocation(); // <-- Se usa para el resaltado

  const mockUser = { name: 'Usuario Demo', role: 'Superusuario' as UserRole };
  const currentUser = user || mockUser;

  const filteredLinks = linksData.filter(item => 
      currentUser && item.roles.includes(currentUser.role)
  );

    // CAMBIADO: Se pasa la ruta actual (location.pathname) a cada LinksGroup
  const navLinks = filteredLinks.map((item) => (
    <LinksGroup 
        {...item} 
        key={item.label} 
        activePath={location.pathname} 
    />
));

const getPageTitle = () => {
    // 1. Obtener la ruta relativa: 'pos', 'ventas', o ''
    const currentPath = location.pathname.split('/').filter(p => p.length > 0);
    const routeKey = currentPath.length > 1 ? currentPath[1] : ''; 
    
    let currentTitle: string | undefined;

    // 2. Buscar en enlaces principales (dashboard, pos, inventario, etc.)
    const mainLink = linksData.find(link => link.to === routeKey);
    if (mainLink) {
        currentTitle = mainLink.label;
    } 
    
    // 3. Si no es un enlace principal, buscar en sub-enlaces (ventas, compras)
    if (!currentTitle) {
        const submenuLinks = linksData.flatMap(link => link.links || []);
        const subLink = submenuLinks.find(link => link.to === routeKey);
        
        if (subLink) {
            currentTitle = subLink.label;
        }
    }

    // 4. Devolver el título encontrado o un valor por defecto
    if (currentTitle) {
        return currentTitle;
    }

    // 5. Caso de ruta no mapeada (404), capitalizando la clave para mostrarla.
    return routeKey.charAt(0).toUpperCase() + routeKey.slice(1) || 'Panel de Control';
};

const pageTitle = getPageTitle();
useEffect(() => {
    // Definimos un sufijo para mantener el nombre de la empresa
    const suffix = ' | Papelería Gasparín'; 
    
    // El título será el nombre de la página + el sufijo
    document.title = `${pageTitle}${suffix}`;

    // La dependencia [pageTitle] asegura que se actualice cada vez que cambies de ruta
}, [pageTitle]);

  return (
    <MantineProvider theme={mainTheme}>
      <AppShell
        //header={{ height: 60 }}
        navbar={{ width: 300, breakpoint: 'sm' }}
        padding="md"
      >
        {/*<AppShell.Header 
            p="md" 
            bg="#1a1a1a" 
            style={{ borderBottom: `1px solid var(--mantine-color-dark-gray-7)` }} // Borde sutil
        >
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Text fw={700} size="xl" c="white">
                {pageTitle} 📊 
            </Text>
          </div>
        </AppShell.Header>*/}

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

            {/* Enlaces filtrados por rol */}
            <AppShell.Section
                grow
                component={ScrollArea}
                mt="md"
                mx="calc(-1 * var(--mantine-spacing-md))"
                px="var(--mantine-spacing-md)"
            >
                <Box pt={0} py="md">{navLinks}</Box>
            </AppShell.Section>

            {/* Información de usuario y logout */}
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

        {/* MAIN (Contenido de la vista) */}
        <AppShell.Main bg="var(--mantine-color-gray-0)"> 
            <Routes>
                <Route path="/" element={<Dashboard />} /> 
                <Route path="pos" element={<POS />} /> 
                <Route path="inventario" element={<Text size="xl">Página de Inventario</Text>} /> 
                <Route path="ventas" element={<Text size="xl">Página de Ventas</Text>} /> 
                <Route path="compras" element={<Text size="xl">Página de Compras</Text>} />
                <Route path="contactos" element={<Text size="xl">Página de Clientes y Proveedores</Text>} />
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