// pages/Reports.tsx
import { useState } from 'react';
import {
  Container,
  Title,
  Paper,
  Group,
  Button,
  Stack,
  Select,
  TextInput,
  Text,
  Badge,
  Table,
  ActionIcon,
  Tooltip,
  Loader,
  Grid,
} from '@mantine/core';
import { 
  IconFileTypePdf, 
  IconCalendar, 
  IconRefresh, 
  IconSearch 
} from '@tabler/icons-react';
import { useReports } from '../hooks/useReports';

export default function Reports() {
  const {
    filteredReports,
    downloadingId,
    generatingReports,
    filterModule,
    filterPeriod,
    filtersApplied,
    downloadReport,
    generateReports,
    applySearch,
    clearFilters,
    handleModuleChange,
    handlePeriodChange,
    loading,
  } = useReports();

  const [searchInput, setSearchInput] = useState('');

  const handleBuscar = () => {
    applySearch(searchInput);
  };

  const handleLimpiar = () => {
    setSearchInput('');
    clearFilters();
  };

  return (
    <Container size="xl">
      <Stack gap="md">
        {/* Header */}
        <Paper withBorder p="md" shadow="xs">
          <Group justify="space-between">
            <div>
              <Title order={3}>Reportes Automáticos</Title>
              <Text c="dimmed" size="sm">
                Reportes generados automáticamente por el sistema
              </Text>
            </div>
            <Tooltip label="Forzar generación de reportes actuales">
              {generatingReports ? (
                <ActionIcon 
                  variant="light" 
                  color="blue" 
                  size="lg"
                  disabled
                >
                  <Loader size="1.2rem" />
                </ActionIcon>
              ) : (
                <ActionIcon 
                  variant="light" 
                  color="blue" 
                  size="lg"
                  onClick={generateReports}
                >
                  <IconRefresh size="1.2rem" />
                </ActionIcon>
              )}
            </Tooltip>
          </Group>
        </Paper>

        {/* Filtros */}
        <Paper withBorder p="md" shadow="xs">
          <Group align="flex-end" gap="xs">
            <TextInput
              placeholder="Buscar por tipo o período..."
              leftSection={<IconSearch size={16} />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ flex: 1 }}
              size="md"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleBuscar();
                }
              }}
            />
            
            <Select
              placeholder="Todos los módulos"
              data={[
                { value: 'ventas', label: 'Ventas' },
                { value: 'inventario', label: 'Inventario' },
                { value: 'compras', label: 'Compras' },
                { value: 'pedidos', label: 'Pedidos' },
              ]}
              value={filterModule}
              onChange={handleModuleChange}
              clearable
              size="md"
              style={{ flex: 1 }}
            />
            
            <Select
              placeholder="Todos los períodos"
              data={[
                { value: 'semanal', label: 'Semanal' },
                { value: 'mensual', label: 'Mensual' },
              ]}
              value={filterPeriod}
              onChange={handlePeriodChange}
              clearable
              size="md"
              style={{ flex: 1 }}
            />
            
            <Button 
              variant="subtle" 
              onClick={handleLimpiar}
              size="md"
            >
              Limpiar
            </Button>
            
            <Button 
              onClick={handleBuscar}
              size="md"
            >
              Buscar
            </Button>
          </Group>
        </Paper>

        {/* Tabla de Reportes Automáticos */}
        <Paper withBorder p="md" shadow="xs">
          <Group justify="space-between" mb="md">
            <Title order={4}>Reportes Disponibles</Title>
          </Group>
          
          <Table striped withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Tipo de Reporte</Table.Th>
                <Table.Th>Módulo</Table.Th>
                <Table.Th>Período</Table.Th>
                <Table.Th>Fecha Generación</Table.Th>
                <Table.Th>Acción</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredReports.map((reporte) => (
                <Table.Tr key={reporte.id}>
                  <Table.Td>
                    <Text>{reporte.tipo}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge 
                      color={
                        reporte.modulo === 'ventas' ? 'blue' :
                        reporte.modulo === 'inventario' ? 'green' :
                        reporte.modulo === 'compras' ? 'orange' : 'grape'
                      }
                      variant="light"
                    >
                      {reporte.modulo}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{reporte.periodo}</Table.Td>
                  <Table.Td>{reporte.fechaGeneracion}</Table.Td>
                  <Table.Td>
                    {downloadingId === reporte.id ? (
                      <Button 
                        size="xs" 
                        variant="light" 
                        color="red"
                        disabled
                        leftSection={<Loader size="0.8rem" />}
                      >
                        Descargando...
                      </Button>
                    ) : (
                      <Tooltip label="Descargar reporte">
                        <Button 
                          size="xs" 
                          variant="light" 
                          color="red"
                          leftSection={<IconFileTypePdf size="0.8rem" />}
                          onClick={() => downloadReport(reporte)}
                        >
                          Descargar PDF
                        </Button>
                      </Tooltip>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {filteredReports.length === 0 && (
            <Paper withBorder p="xl" mt="md" style={{ textAlign: 'center' }}>
              <IconFileTypePdf size={48} color="var(--mantine-color-gray-4)" />
              <Text c="dimmed" mt="md">
                {filtersApplied 
                  ? "No hay reportes que coincidan con los filtros aplicados" 
                  : "No hay reportes disponibles"}
              </Text>
            </Paper>
          )}
        </Paper>

        {/* Información de Programación */}
        <Paper withBorder p="md" shadow="xs" bg="blue.0">
          <Title order={4} mb="sm">Programación de Reportes Automáticos</Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Group>
                <div>
                  <Text fw={500}>📊 Reportes Semanales</Text>
                  <Text size="sm" c="dimmed">
                    Ventas y Pedidos - Domingos 23:59
                  </Text>
                </div>
              </Group>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Group>
                <div>
                  <Text fw={500}>📦 Reportes Mensuales</Text>
                  <Text size="sm" c="dimmed">
                    Inventario y Compras - Último día del mes 23:59
                  </Text>
                </div>
              </Group>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 12 }}>
              <Group>
                <div>
                  <Text fw={500}>🔄 Actualización Automática</Text>
                  <Text size="sm" c="dimmed">
                    Los reportes se generan automáticamente según la programación establecida
                  </Text>
                </div>
              </Group>
            </Grid.Col>
          </Grid>
        </Paper>
      </Stack>
    </Container>
  );
}