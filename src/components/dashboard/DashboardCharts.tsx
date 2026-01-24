// src/components/dashboard/DashboardCharts.tsx
import { Card, Group, Title, Badge, Stack, Divider, Text, Alert, rem } from '@mantine/core';
import { IconAlertCircle, IconCalendar } from '@tabler/icons-react';

interface DashboardChartsProps {
  period: string;
  startDate: string;
  endDate: string;
}

export const TopProductsCard: React.FC<{ period: string }> = ({ period }) => {
  const topProducts = [
    { name: 'Lápices HB', quantity: 45, category: 'Escritura', change: '+12%' },
    { name: 'Cuadernos Profesionales', quantity: 32, category: 'Papelería', change: '+8%' },
    { name: 'Bolígrafos Azules', quantity: 28, category: 'Escritura', change: '+5%' },
    { name: 'Resaltadores', quantity: 24, category: 'Escritura', change: '-3%' },
    { name: 'Cartulinas', quantity: 18, category: 'Arte', change: '+15%' }
  ];

  return (
    <Card withBorder p="lg" radius="md" shadow="sm">
      <Group justify="space-between" mb="md">
        <Title order={3}>Productos Más Vendidos</Title>
        <Badge color="blue" variant="light">{period}</Badge>
      </Group>
      <Stack gap="sm">
        {topProducts.map((product, index) => (
          <div key={index}>
            <Group justify="space-between">
              <div>
                <Text fw={500}>{product.name}</Text>
                <Text size="sm" c="dimmed">{product.category}</Text>
              </div>
              <Group gap="xs">
                <Badge color={product.change.startsWith('+') ? 'green' : 'red'} variant="light" size="xs">
                  {product.change}
                </Badge>
                <Badge color="blue" variant="light">
                  {product.quantity} u.
                </Badge>
              </Group>
            </Group>
            {index < topProducts.length - 1 && <Divider my="sm" />}
          </div>
        ))}
      </Stack>
    </Card>
  );
};

export const SalesByCategoryCard: React.FC<{ period: string }> = ({ period }) => {
  const categories = [
    { name: 'Escritura', amount: 2450, percentage: 35 },
    { name: 'Papelería', amount: 1890, percentage: 27 },
    { name: 'Arte', amount: 1235, percentage: 18 },
    { name: 'Oficina', amount: 856, percentage: 12 },
    { name: 'Escolar', amount: 578, percentage: 8 }
  ];

  return (
    <Card withBorder p="lg" radius="md" shadow="sm">
      <Group justify="space-between" mb="md">
        <Title order={3}>Ventas por Categoría</Title>
        <Badge color="blue" variant="light">{period}</Badge>
      </Group>
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
              <Group gap="xs" w={rem(60)} justify="flex-end">
                <Text size="sm" c="dimmed">
                  {category.percentage}%
                </Text>
              </Group>
            </Group>
          </div>
        ))}
      </Stack>
    </Card>
  );
};

export const RecentAlertsCard: React.FC<{ startDate: string; endDate: string }> = ({ startDate, endDate }) => {
  const alerts = [
    { 
      type: 'stock' as const, 
      message: 'Stock bajo: Cuadernos profesionales (solo 5 unidades)', 
      color: 'red',
      date: '2024-01-15 10:30',
      priority: 'Alta' as const
    },
    { 
      type: 'sale' as const, 
      message: 'Nueva venta: $450.00 - María García', 
      color: 'green',
      date: '2024-01-15 09:15',
      priority: 'Baja' as const
    },
    { 
      type: 'order' as const, 
      message: 'Pedido urgente #P-123 por entregar hoy', 
      color: 'orange',
      date: '2024-01-14 16:45',
      priority: 'Alta' as const
    },
    { 
      type: 'supplier' as const, 
      message: 'Proveedor "Papelera Central" con retraso de 2 días', 
      color: 'yellow',
      date: '2024-01-14 14:20',
      priority: 'Media' as const
    },
    { 
      type: 'payment' as const, 
      message: 'Pago pendiente: Cliente "Empresa ABC" - $1,200.00', 
      color: 'red',
      date: '2024-01-13 11:00',
      priority: 'Media' as const
    }
  ];

  return (
    <Card withBorder p="lg" radius="md" shadow="sm">
      <Group justify="space-between" mb="md">
        <Title order={3}>Actividad y Alertas Recientes</Title>
        <Badge color="blue" variant="light">
          {startDate} - {endDate}
        </Badge>
      </Group>
      <Stack gap="md">
        {alerts.map((alert, index) => (
          <Alert 
            key={index}
            variant="light"
            color={alert.color}
            title={
              <Group justify="space-between" w="100%">
                <Text fw={600}>{alert.message}</Text>
                <Badge color={alert.color} variant="filled" size="xs">
                  {alert.priority}
                </Badge>
              </Group>
            }
            icon={<IconAlertCircle size="1rem" />}
          >
            <Group justify="space-between" mt={4}>
              <Text size="xs" c="dimmed">
                <IconCalendar size="0.8rem" style={{ marginRight: 4 }} />
                {alert.date}
              </Text>
              <Badge variant="outline" size="xs">
                {alert.type === 'stock' ? 'Inventario' : 
                 alert.type === 'sale' ? 'Venta' : 
                 alert.type === 'order' ? 'Pedido' : 
                 alert.type === 'supplier' ? 'Proveedor' : 'Pago'}
              </Badge>
            </Group>
          </Alert>
        ))}
      </Stack>
    </Card>
  );
};

// Exportamos los componentes individualmente
// Ya no usamos DashboardCharts como contenedor