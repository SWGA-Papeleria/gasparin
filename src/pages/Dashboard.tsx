// src/pages/Dashboard.tsx
import { Container, Title, Text, SimpleGrid, Box, Paper, Group, Badge } from '@mantine/core';
import { IconCalendar, IconCoin, IconShoppingCart, IconTrendingUp, IconPackage, IconClock, IconUser } from '@tabler/icons-react';
import { TopProductsCard, SalesByCategoryCard, RecentAlertsCard } from '../components/dashboard/DashboardCharts';
import { StatCard } from '../components/dashboard/StatCard';
import { FilterControls } from '../components/dashboard/FilterControls';
import { useDashboard } from '../hooks/useDashboard';

const defaultMetrics = {
  sales: { value: '$24,850', description: 'Este mes', color: 'green' },
  transactions: { value: '245', description: 'Este mes', color: 'green' },
  avgTicket: { value: '$101.43', description: 'Por venta', color: 'green' },
  lowStock: { value: '18', description: 'Productos', color: 'red' },
  urgentOrders: { value: '7', description: 'Este mes', color: 'orange' },
  activeClients: { value: '156', description: 'Nuevos este mes', color: 'green' }
};

function Dashboard() {  // Cambié a function en lugar de export default function
  const {
    period,
    setPeriod,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isLoading,
    handleApplyFilters,
    handleResetFilters
  } = useDashboard();

  const currentPeriod = period;

  return (
    <Container size="xl" py="md">
      <Title order={1} mb="xs">Dashboard</Title>
      <Text c="dimmed" mb="xl">Resumen del negocio • {currentPeriod}</Text>

      <FilterControls
        period={period}
        setPeriod={setPeriod}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        isLoading={isLoading}
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 6 }} spacing="lg">
        <StatCard 
          title="Ventas Totales" 
          value={defaultMetrics.sales.value}
          description={defaultMetrics.sales.description}
          valueColor={defaultMetrics.sales.color}
          icon={<IconCoin size="1.2rem" />}
        />
        <StatCard 
          title="Transacciones" 
          value={defaultMetrics.transactions.value}
          description={defaultMetrics.transactions.description}
          valueColor={defaultMetrics.transactions.color}
          icon={<IconShoppingCart size="1.2rem" />}
        />
        <StatCard 
          title="Ticket Promedio" 
          value={defaultMetrics.avgTicket.value}
          description={defaultMetrics.avgTicket.description}
          valueColor={defaultMetrics.avgTicket.color}
          icon={<IconTrendingUp size="1.2rem" />}
        />
        <StatCard 
          title="Bajo Stock" 
          value={defaultMetrics.lowStock.value}
          description={defaultMetrics.lowStock.description}
          valueColor={defaultMetrics.lowStock.color}
          icon={<IconPackage size="1.2rem" />}
        />
        <StatCard 
          title="Pedidos Urgentes" 
          value={defaultMetrics.urgentOrders.value}
          description={defaultMetrics.urgentOrders.description}
          valueColor={defaultMetrics.urgentOrders.color}
          icon={<IconClock size="1.2rem" />}
        />
        <StatCard 
          title="Clientes Activos" 
          value={defaultMetrics.activeClients.value}
          description={defaultMetrics.activeClients.description}
          valueColor={defaultMetrics.activeClients.color}
          icon={<IconUser size="1.2rem" />}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg" mt="xl">
        <TopProductsCard period={currentPeriod} />
        <SalesByCategoryCard period={currentPeriod} />
      </SimpleGrid>

      <Box mt="xl">
        <RecentAlertsCard startDate={startDate} endDate={endDate} />
      </Box>

      <Paper withBorder p="md" radius="md" mt="lg" bg="gray.0">
        <Group justify="space-between">
          <Group gap="xs">
            <IconCalendar size="1rem" />
            <Text size="sm" fw={500}>Período actual</Text>
          </Group>
          <Badge color="blue" variant="filled">{currentPeriod}</Badge>
        </Group>
        <Text size="sm" c="dimmed" mt="xs">
          {period === 'Personalizado' 
            ? `Mostrando datos del ${startDate} al ${endDate}`
            : `Mostrando datos para ${currentPeriod}`}
        </Text>
      </Paper>
    </Container>
  );
}

export default Dashboard;  