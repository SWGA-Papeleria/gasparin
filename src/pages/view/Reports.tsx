// pages/view/Reports.tsx
import { useState } from 'react';
import {
  Container,
  Title,
  Card,
  Grid,
  Group,
  Button,
  Stack,
  Select,
  TextInput,
  Text,
  Badge,
  Table,
  Paper,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { IconFileTypePdf, IconDownload, IconCalendar, IconRefresh } from '@tabler/icons-react';

interface ReporteAutomatico {
  id: number;
  tipo: string;
  modulo: 'ventas' | 'inventario' | 'compras' | 'pedidos';
  periodo: string;
  fechaGeneracion: string;
  descargado: boolean;
  rutaArchivo: string;
}

export default function Reports() {
  const [filtroModulo, setFiltroModulo] = useState<string | null>(null);
  const [filtroPeriodo, setFiltroPeriodo] = useState<string | null>(null);

  // Datos de ejemplo - reportes generados automáticamente
  const [reportesAutomaticos, setReportesAutomaticos] = useState<ReporteAutomatico[]>([
    {
      id: 1,
      tipo: 'Ventas Semanales',
      modulo: 'ventas',
      periodo: 'Semana 15-21 Ene 2024',
      fechaGeneracion: '21/01/2024 23:59',
      descargado: false,
      rutaArchivo: '/reportes/ventas/semana-15-21-ene-2024.pdf'
    },
    {
      id: 2,
      tipo: 'Inventario Mensual',
      modulo: 'inventario',
      periodo: 'Enero 2024',
      fechaGeneracion: '31/01/2024 23:59',
      descargado: true,
      rutaArchivo: '/reportes/inventario/enero-2024.pdf'
    },
    {
      id: 3,
      tipo: 'Compras Mensuales',
      modulo: 'compras',
      periodo: 'Enero 2024',
      fechaGeneracion: '31/01/2024 23:59',
      descargado: false,
      rutaArchivo: '/reportes/compras/enero-2024.pdf'
    },
    {
      id: 4,
      tipo: 'Pedidos Pendientes',
      modulo: 'pedidos',
      periodo: 'Semana 15-21 Ene 2024',
      fechaGeneracion: '21/01/2024 23:59',
      descargado: false,
      rutaArchivo: '/reportes/pedidos/semana-15-21-ene-2024.pdf'
    },
    {
      id: 5,
      tipo: 'Ventas Semanales',
      modulo: 'ventas',
      periodo: 'Semana 8-14 Ene 2024',
      fechaGeneracion: '14/01/2024 23:59',
      descargado: true,
      rutaArchivo: '/reportes/ventas/semana-8-14-ene-2024.pdf'
    }
  ]);

  const descargarReporte = (reporte: ReporteAutomatico) => {
    // Simular descarga de PDF
    console.log('Descargando reporte:', reporte.rutaArchivo);
    
    // Marcar como descargado
    setReportesAutomaticos(prev => 
      prev.map(r => 
        r.id === reporte.id ? { ...r, descargado: true } : r
      )
    );
    
    alert(`Descargando: ${reporte.tipo} - ${reporte.periodo}`);
  };

  const forzarGeneracionReporte = () => {
    // En producción, esto llamaría a una API para generar reportes inmediatamente
    alert('Generando reportes automáticos... Esto puede tomar unos minutos.');
  };

  // Filtrar reportes
  const reportesFiltrados = reportesAutomaticos.filter(reporte => {
    const coincideModulo = !filtroModulo || reporte.modulo === filtroModulo;
    const coincidePeriodo = !filtroPeriodo || 
      (filtroPeriodo === 'semanal' && reporte.tipo.includes('Semanales')) ||
      (filtroPeriodo === 'mensual' && reporte.tipo.includes('Mensual'));
    
    return coincideModulo && coincidePeriodo;
  });

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
              <ActionIcon 
                variant="light" 
                color="blue" 
                size="lg"
                onClick={forzarGeneracionReporte}
              >
                <IconRefresh size="1.2rem" />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Paper>

        {/* Filtros - MODIFICADO con estilo de Attributes */}
        <Paper withBorder p="md" shadow="xs">
          <Group align="flex-end" gap="xs">
            <Select
              placeholder="Todos los módulos"
              data={[
                { value: 'ventas', label: 'Ventas' },
                { value: 'inventario', label: 'Inventario' },
                { value: 'compras', label: 'Compras' },
                { value: 'pedidos', label: 'Pedidos' },
              ]}
              value={filtroModulo}
              onChange={setFiltroModulo}
              clearable
              size="md"
              style={{ flex: 2 }}
            />
            <Select
              placeholder="Todos los períodos"
              data={[
                { value: 'semanal', label: 'Semanal' },
                { value: 'mensual', label: 'Mensual' },
              ]}
              value={filtroPeriodo}
              onChange={setFiltroPeriodo}
              clearable
              size="md"
              style={{ flex: 2 }}
            />
            <Button 
              variant="subtle" 
              onClick={() => {
                setFiltroModulo(null);
                setFiltroPeriodo(null);
              }}
              size="md"
            >
              Limpiar
            </Button>
          </Group>
        </Paper>

        {/* Tabla de Reportes Automáticos */}
        <Paper withBorder p="md" shadow="xs">
          <Group justify="space-between" mb="md">
            <Title order={4}>Reportes Disponibles</Title>
            <Text c="dimmed" size="sm">
              Mostrando {reportesFiltrados.length} de {reportesAutomaticos.length} reportes
            </Text>
          </Group>
          
          <Table>
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
              {reportesFiltrados.map((reporte) => (
                <Table.Tr key={reporte.id}>
                  <Table.Td>{reporte.tipo}</Table.Td>
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
                    <Button 
                      size="xs" 
                      variant="light" 
                      color="red"
                      leftSection={<IconFileTypePdf size="0.8rem" />}
                      onClick={() => descargarReporte(reporte)}
                    >
                      Descargar PDF
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {reportesFiltrados.length === 0 && (
            <Paper withBorder p="xl" mt="md" style={{ textAlign: 'center' }}>
              <IconFileTypePdf size={48} color="var(--mantine-color-gray-4)" />
              <Text c="dimmed" mt="md">
                No hay reportes que coincidan con los filtros aplicados
              </Text>
            </Paper>
          )}
        </Paper>

        {/* Información de Programación */}
        <Paper withBorder p="md" shadow="xs" bg="blue.0">
          <Title order={4} mb="sm">Programación de Reportes Automáticos</Title>
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Text fw={500}>📊 Reportes Semanales</Text>
                  <Text size="sm" c="dimmed">
                Ventas y Pedidos - Domingos 23:59
              </Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Text fw={500}>📦 Reportes Mensuales</Text>
              <Text size="sm" c="dimmed">
                Inventario y Compras - Último día del mes 23:59
              </Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 12 }}>
              <Text fw={500}>🔄 Actualización</Text>
              <Text size="sm" c="dimmed">
                Los reportes se generan automáticamente
              </Text>
            </Grid.Col>
          </Grid>
        </Paper>
      </Stack>
    </Container>
  );
}