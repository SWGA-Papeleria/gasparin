import { 
  Title, 
  Text, 
  SimpleGrid, 
  Paper, 
  rem, 
  Container, 
  Card, 
  Group, 
  Badge, 
  Stack,
  Divider,
  Alert,
  ThemeIcon
} from '@mantine/core';
import { 
  IconAlertCircle, 
  IconTrendingUp, 
  IconShoppingCart,
  IconUser,
  IconPackage,
  IconClock,
  IconTruck,
  IconCoin
} from '@tabler/icons-react';
import React from 'react';

// Interfaz para definir las propiedades de cada tarjeta de estadística
interface StatCardProps {
  title: string;
  value: string;
  description: string;
  valueColor?: string;
  icon?: React.ReactNode;
}

// Componente para renderizar una tarjeta de estadística reutilizable
const StatCard: React.FC<StatCardProps> = ({ title, value, description, valueColor, icon }) => (
  <Paper withBorder p="md" radius="md" shadow="sm">
    <Group justify="space-between" align="flex-start" mb="xs">
      <div style={{ flex: 1 }}>
        <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
          {title}
        </Text>
        <Text 
          fz={rem(32)}
          fw={900} 
          c={valueColor || 'var(--mantine-color-default)'}
          style={{ lineHeight: 1 }}
          mt={4}
        >
          {value}
        </Text>
        <Text fz="sm" c="dimmed" mt={2}>
          {description}
        </Text>
      </div>
      {icon && (
        <ThemeIcon variant="light" size="lg" color="blue">
          {icon}
        </ThemeIcon>
      )}
    </Group>
  </Paper>
);

// Componente para productos más vendidos
const ProductosMasVendidos = () => {
  const topProducts = [
    { name: 'Lápices HB', quantity: 45, category: 'Escritura' },
    { name: 'Cuadernos Profesionales', quantity: 32, category: 'Papelería' },
    { name: 'Bolígrafos Azules', quantity: 28, category: 'Escritura' },
    { name: 'Resaltadores', quantity: 24, category: 'Escritura' },
    { name: 'Cartulinas', quantity: 18, category: 'Arte' }
  ];

  return (
    <Card withBorder p="lg" radius="md" shadow="sm">
      <Title order={3} mb="md">Productos Más Vendidos</Title>
      <Stack gap="sm">
        {topProducts.map((product, index) => (
          <div key={index}>
            <Group justify="space-between">
              <div>
                <Text fw={500}>{product.name}</Text>
                <Text size="sm" c="dimmed">{product.category}</Text>
              </div>
              <Badge color="blue" variant="light">
                {product.quantity} unidades
              </Badge>
            </Group>
            {index < topProducts.length - 1 && <Divider my="sm" />}
          </div>
        ))}
      </Stack>
    </Card>
  );
};

// Componente para ventas por categoría
const VentasPorCategoria = () => {
  const categories = [
    { name: 'Escritura', amount: 2450, percentage: 35 },
    { name: 'Papelería', amount: 1890, percentage: 27 },
    { name: 'Arte', amount: 1235, percentage: 18 },
    { name: 'Oficina', amount: 856, percentage: 12 },
    { name: 'Escolar', amount: 578, percentage: 8 }
  ];

  return (
    <Card withBorder p="lg" radius="md" shadow="sm">
      <Title order={3} mb="md">Ventas por Categoría</Title>
      <Stack gap="md">
        {categories.map((category, index) => (
          <div key={index}>
            <Group justify="space-between" mb={4}>
              <Text fw={500}>{category.name}</Text>
              <Text fw={600}>${category.amount.toLocaleString()}</Text>
            </Group>
            <Group justify="space-between">
              <div style={{ 
                width: '100%', 
                backgroundColor: 'var(--mantine-color-gray-2)', 
                borderRadius: rem(4),
                height: rem(8)
              }}>
                <div 
                  style={{
                    width: `${category.percentage}%`,
                    backgroundColor: 'var(--mantine-color-blue-6)',
                    height: '100%',
                    borderRadius: rem(4)
                  }}
                />
              </div>
              <Text size="sm" c="dimmed" w={rem(40)}>
                {category.percentage}%
              </Text>
            </Group>
          </div>
        ))}
      </Stack>
    </Card>
  );
};

// Componente para alertas recientes
const AlertasRecientes = () => {
  const alerts = [
    { type: 'stock', message: 'Stock bajo: Cuadernos profesionales (solo 5 unidades)', color: 'red' },
    { type: 'sale', message: 'Nueva venta: $450.00 - María García', color: 'green' },
    { type: 'order', message: 'Pedido urgente #P-123 por entregar hoy', color: 'orange' },
    { type: 'supplier', message: 'Proveedor "Papelera Central" con retraso', color: 'yellow' }
  ];

  return (
    <Card withBorder p="lg" radius="md" shadow="sm">
      <Title order={3} mb="md">Actividad y Alertas Recientes</Title>
      <Stack gap="md">
        {alerts.map((alert, index) => (
          <Alert 
            key={index}
            variant="light"
            color={alert.color}
            title={alert.message}
            icon={<IconAlertCircle size="1rem" />}
          />
        ))}
      </Stack>
    </Card>
  );
};

export default function Dashboard() {
  return (
    <Container size="xl" py="md">
      <Title order={1} mb="md">
        Panel de Control Principal
      </Title>
      <Text c="dimmed" mb="xl">
        Resumen y métricas clave del negocio
      </Text>
      
      {/* Métricas Principales - 6 cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 6 }} spacing="lg">
        <StatCard 
          title="Ventas del Día" 
          value="$1,540" 
          description="+5% vs ayer" 
          valueColor="green"
          icon={<IconCoin size="1.2rem" />}
        />
        
        <StatCard 
          title="Transacciones" 
          value="15" 
          description="Hoy" 
          icon={<IconShoppingCart size="1.2rem" />}
        />
        
        <StatCard 
          title="Ticket Promedio" 
          value="$102.70" 
          description="Por venta" 
          icon={<IconTrendingUp size="1.2rem" />}
        />
        
        <StatCard 
          title="Bajo Stock" 
          value="12" 
          description="Productos" 
          valueColor="red"
          icon={<IconPackage size="1.2rem" />}
        />
        
        <StatCard 
          title="Pedidos Urgentes" 
          value="3" 
          description="Esta semana" 
          valueColor="orange"
          icon={<IconClock size="1.2rem" />}
        />
        
        <StatCard 
          title="Clientes Activos" 
          value="128" 
          description="Este mes" 
          icon={<IconUser size="1.2rem" />}
        />
      </SimpleGrid>

      {/* Sección de Análisis - 2 columnas */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" mt="xl">
        <ProductosMasVendidos />
        <VentasPorCategoria />
      </SimpleGrid>

      {/* Alertas Recientes */}
      <div style={{ marginTop: rem(32) }}>
        <AlertasRecientes />
      </div>
    </Container>
  );
}