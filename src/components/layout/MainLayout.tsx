import {
  AppShell,
  Text,
  Group,
  Box,
  ScrollArea,
  UnstyledButton,
  ThemeIcon,
  Collapse,
  rem,
  Stack,
  Burger,
  useMantineTheme,
  ActionIcon,
  Divider,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import NotFound from '../../pages/NotFound';

import {
  IconChevronRight,
  IconBuildingStore,
  IconUsers,
  IconFileAnalytics,
  IconShoppingCart,
  IconLogout,
  IconClockHour7,
  IconClipboardList,
  IconBox,
  IconCreditCard,
  IconCategory,
  IconX,
} from '@tabler/icons-react';

import { useAuthContext } from '../../context/AuthContext';
import { NavigationData, type UserRole } from './NavigationData';

// Import pages
import Dashboard from '../../pages/Dashboard';
import PointOfSale from '../../pages/PointOfSale';
import Inventory from '../../pages/Inventory';
import Sales from '../../pages/Sales';
import Purchases from '../../pages/Purchases';
import PurchaseCreateEdit from '../../pages/PurchaseCreateEdit';
import Orders from '../../pages/Orders';
import OrderCreateEdit from '../../pages/OrderCreateEdit';
import Reports from '../../pages/Reports';
import Customers from '../../pages/Customers';
import Suppliers from '../../pages/Suppliers';
import Users from '../../pages/view/Users';
import UnitOfMeasure from '../../pages/UnitOfMeasure';
import Attributes from '../../pages/Attributes';
import Brand from '../../pages/Brand';

export default function MainLayout() {
  const { user, logout } = useAuthContext();
  const location = useLocation();
  const theme = useMantineTheme();
  const [navbarOpened, setNavbarOpened] = useState(false);

  const isMobile = useMediaQuery('(max-width: 767px)');
  const mockUser = { name: 'Usuario Demo', role: 'Superusuario' as UserRole };
  const currentUser = user || mockUser;

  const handleLinkClick = () => {
    if (isMobile) setNavbarOpened(false);
  };

  const handleLogout = () => {
    logout();
    if (isMobile) setNavbarOpened(false);
  };

  // Update document title
  useEffect(() => {
    const pageTitle = getPageTitle();
    document.title = `${pageTitle} | Papelería Gasparín`;
  }, [location.pathname]);

  return (
    <AppShell
      navbar={{
        width: { base: '100%', sm: 300 },
        breakpoint: 'sm',
        collapsed: { mobile: !navbarOpened, desktop: false },
      }}
      padding="md"
      header={{
        height: 60,
        collapsed: !isMobile,
      }}
      layout="alt"
    >
      {/* Mobile Header */}
      {isMobile && (
        <AppShell.Header bg="#2d2d2d" c="white" withBorder={false}>
          <Group h="100%" px="md" justify="space-between">
            <Group>
              <Burger
                opened={navbarOpened}
                onClick={() => setNavbarOpened((o) => !o)}
                size="sm"
                color="white"
                aria-label="Toggle navigation"
              />
              <Text fw={700} size="lg" c="white">
                Papelería Gasparín
              </Text>
            </Group>
          </Group>
        </AppShell.Header>
      )}

      {/* Sidebar */}
      <AppShell.Navbar p="md" bg="#2d2d2d" c="white">
        <SidebarContent
          currentUser={currentUser}
          activePath={location.pathname}
          isMobile={isMobile}
          onLinkClick={handleLinkClick}
          onClose={() => setNavbarOpened(false)}
          onLogout={handleLogout}
        />
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main
        bg="var(--mantine-color-gray-0)"
        pt={isMobile ? "calc(var(--mantine-spacing-md) + 60px)" : "md"}
      >
        <ScrollArea h="100%">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="pos" element={<PointOfSale />} />
            <Route path="inventario" element={<Inventory />} />
            <Route path="marcas" element={<Brand />} />
            <Route path="unidad-medida" element={<UnitOfMeasure />} />
            <Route path="atributos" element={<Attributes />} />
            <Route path="ventas" element={<Sales />} />
            <Route path="compras" element={<Purchases />} />
            <Route path="compras/nueva" element={<PurchaseCreateEdit />} />
            <Route path="compras/editar/:id" element={<PurchaseCreateEdit />} />
            <Route path="clientes" element={<Customers />} />
            <Route path="proveedores" element={<Suppliers />} />
            <Route path="pedidos" element={<Orders />} />
            <Route path="pedidos/nuevo" element={<OrderCreateEdit />} />
            <Route path="pedidos/editar/:id" element={<OrderCreateEdit />} />
            <Route path="reportes" element={<Reports />} />
            <Route path="usuarios" element={<Users />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ScrollArea>
      </AppShell.Main>
    </AppShell>
  );
}


// Componente interno SidebarContent
interface SidebarContentProps {
  currentUser: any;
  activePath: string;
  isMobile: boolean;
  onLinkClick: () => void;
  onClose: () => void;
  onLogout: () => void;
}

function SidebarContent({
  currentUser,
  activePath,
  isMobile,
  onLinkClick,
  onClose,
  onLogout,
}: SidebarContentProps) {
  const filteredLinks = NavigationData.filter(item =>
    currentUser && item.roles.includes(currentUser.role)
  );

  return (
    <>
      {/* Header Section */}
      <AppShell.Section>
        <Group justify="space-between">
          <Text fw={700} size="lg" c="white">
            Papelería Gasparín
          </Text>
          {isMobile && (
            <ActionIcon
              variant="transparent"
              color="white"
              onClick={onClose}
              aria-label="Cerrar menú"
            >
              <IconX size="1.5rem" />
            </ActionIcon>
          )}
        </Group>
      </AppShell.Section>

      <Divider color="rgba(255, 255, 255, 0.1)" my="md" />

      {/* Navigation Links */}
      <AppShell.Section
        grow
        component={ScrollArea}
        mt="md"
        mx="calc(-1 * var(--mantine-spacing-md))"
        px="var(--mantine-spacing-md)"
      >
        <Box pt={0} py="md">
          {filteredLinks.map((item) => (
            <NavLinkGroup
              key={item.label}
              {...item}
              activePath={activePath}
              onLinkClick={onLinkClick}
            />
          ))}
        </Box>
      </AppShell.Section>

      {/* Footer Section */}
      <AppShell.Section>
        <Box
          pt="md"
          style={{ borderTop: `1px solid rgba(255, 255, 255, 0.1)` }}
        >
          <Box px="md">
            {currentUser && (
              <Stack gap={rem(4)}>
                <Text size="sm" fw={600} c="white">
                  {currentUser.name}
                </Text>
                <Text size="xs" c="var(--mantine-color-gray-3)">
                  Rol:{' '}
                  <Text
                    span
                    fw={700}
                    c={
                      currentUser.role === 'Superusuario'
                        ? 'orange'
                        : currentUser.role === 'Administrador'
                          ? 'red'
                          : 'green'
                    }
                  >
                    {currentUser.role}
                  </Text>
                </Text>
              </Stack>
            )}
            <UnstyledButton
              onClick={onLogout}
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
    </>
  );
}

// Componente interno NavLinkGroup
interface NavLinkGroupProps {
  icon: React.FC<any>;
  label: string;
  to?: string;
  links?: { label: string; to: string }[];
  activePath: string;
  onLinkClick?: () => void;
}

function NavLinkGroup({
  icon: Icon,
  label,
  links,
  to,
  activePath,
  onLinkClick,
}: NavLinkGroupProps) {
  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();

  const getTargetRoute = (path?: string) => `/dashboard/${path || ''}`.replace('//', '/');

  const isSubLinkActive = hasLinks && links.some(link =>
    activePath === getTargetRoute(link.to)
  );

  const isDirectMatch = to !== undefined
    ? to === ''
      ? activePath === '/dashboard' || activePath === '/dashboard/'
      : activePath.startsWith(getTargetRoute(to)) &&
      (activePath === getTargetRoute(to) || activePath.startsWith(getTargetRoute(to) + '/'))
    : false;

  const isControlActive = isDirectMatch || isSubLinkActive;

  const handleNavigation = (path: string) => {
    const targetPath = getTargetRoute(path);
    navigate(targetPath);
    onLinkClick?.();
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
      onClick={() => {
        if (hasLinks) {
          setOpened((o) => !o);
        } else if (to !== undefined) {
          handleNavigation(to);
        }
      }}
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
      {hasLinks && <Collapse in={opened}>{items}</Collapse>}
    </Box>
  );
}

// Helper function para título
function getPageTitle(): string {
  const currentPath = window.location.pathname.split('/').filter(p => p.length > 0);
  const routeKey = currentPath.length > 1 ? currentPath[1] : '';

  const pageTitles: Record<string, string> = {
    '': 'Panel de métricas',
    'pos': 'Punto de Venta',
    'inventario': 'Inventario',
    'ventas': 'Ventas',
    'compras': 'Compras',
    'marcas': 'Marcas',
    'unidad-medida': 'Unidades de Medida',
    'atributos': 'Atributos',
    'clientes': 'Clientes',
    'proveedores': 'Proveedores',
    'pedidos': 'Pedidos',
    'reportes': 'Reportes',
    'usuarios': 'Usuarios',
  };

  return pageTitles[routeKey] || 'Panel de Control';
}