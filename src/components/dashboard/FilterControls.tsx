import { 
  Card, Title, Group, Button, Grid, TextInput, Select, Text 
} from '@mantine/core';
import { IconCalendar, IconAlertCircle } from '@tabler/icons-react';
import type { FilterControlsProps } from '../../types/dashboard.types';

export const FilterControls: React.FC<FilterControlsProps> = ({
  period,
  setPeriod,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onApplyFilters,
  onResetFilters,
  isLoading = false
}) => {
  const today = new Date().toISOString().split('T')[0];

  const handlePeriodChange = (value: string | null) => {
    if (value) {
      setPeriod(value);
      if (value !== 'Personalizado') {
        const todayObj = new Date();
        let newStartDate = '';
        let newEndDate = todayObj.toISOString().split('T')[0];

        switch (value) {
          case 'Hoy':
            newStartDate = newEndDate;
            break;
          case 'Ayer': {
            const yesterday = new Date(todayObj);
            yesterday.setDate(yesterday.getDate() - 1);
            newStartDate = yesterday.toISOString().split('T')[0];
            newEndDate = newStartDate;
            break;
          }
          case 'Esta Semana': {
            const startOfWeek = new Date(todayObj);
            startOfWeek.setDate(todayObj.getDate() - todayObj.getDay());
            newStartDate = startOfWeek.toISOString().split('T')[0];
            break;
          }
          case 'Este Mes': {
            const startOfMonth = new Date(todayObj.getFullYear(), todayObj.getMonth(), 1);
            newStartDate = startOfMonth.toISOString().split('T')[0];
            break;
          }
          default: {
            const defaultStartDate = new Date();
            defaultStartDate.setDate(defaultStartDate.getDate() - 30);
            newStartDate = defaultStartDate.toISOString().split('T')[0];
          }
        }

        setStartDate(newStartDate);
        setEndDate(newEndDate);
      }
    }
  };

  return (
    <Card withBorder p="lg" radius="md" shadow="sm" mb="lg">
      <Group justify="space-between" mb="md">
        <Title order={4}>Filtros del Dashboard</Title>
        <Group gap="xs">
          <Button variant="light" size="sm" onClick={onResetFilters} disabled={isLoading}>
            Restablecer
          </Button>
          <Button 
            variant="filled" 
            size="sm" 
            onClick={onApplyFilters}
            loading={isLoading}
          >
            Aplicar Filtros
          </Button>
        </Group>
      </Group>
      
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Select
            label="Período de Tiempo"
            value={period}
            onChange={handlePeriodChange}
            data={[
              { value: 'Hoy', label: 'Hoy' },
              { value: 'Ayer', label: 'Ayer' },
              { value: 'Esta Semana', label: 'Esta Semana' },
              { value: 'Semana Pasada', label: 'Semana Pasada' },
              { value: 'Este Mes', label: 'Este Mes' },
              { value: 'Mes Pasado', label: 'Mes Pasado' },
              { value: 'Personalizado', label: 'Personalizado' },
            ]}
            leftSection={<IconCalendar size="1rem" />}
            disabled={isLoading}
          />
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <TextInput
            type="date"
            label="Fecha Inicio"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPeriod('Personalizado');
            }}
            max={endDate || today}
            disabled={period !== 'Personalizado' || isLoading}
          />
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <TextInput
            type="date"
            label="Fecha Fin"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPeriod('Personalizado');
            }}
            min={startDate}
            max={today}
            disabled={period !== 'Personalizado' || isLoading}
          />
        </Grid.Col>
      </Grid>
      
      <Group mt="md">
        <Text size="sm" c="dimmed">
          <IconAlertCircle size="0.8rem" style={{ marginRight: 4 }} />
          Seleccione un período y luego haga clic en "Aplicar Filtros" para actualizar los datos
        </Text>
      </Group>
    </Card>
  );
};