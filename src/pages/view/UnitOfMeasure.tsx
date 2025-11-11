// pages/view/UnitOfMeasure.tsx
import { useState } from 'react';
import {
  Table,
  TextInput,
  Button,
  Group,
  Paper,
  Title,
  Text,
  ActionIcon,
  Modal,
  Container,
  Box,
  Tooltip,
  Stack,
} from '@mantine/core';
import { IconEdit, IconTrash, IconPlus, IconSearch } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';

interface UnitOfMeasure {
  id_unidad: number;
  nombre: string;
}

export default function UnitOfMeasure() {
  const [units, setUnits] = useState<UnitOfMeasure[]>([
    { id_unidad: 1, nombre: 'Pieza' },
    { id_unidad: 2, nombre: 'Paquete' },
    { id_unidad: 3, nombre: 'Caja' },
    { id_unidad: 4, nombre: 'Metro' },
  ]);

  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  const [opened, { open, close }] = useDisclosure(false);
  const [editingUnit, setEditingUnit] = useState<UnitOfMeasure | null>(null);
  const [unitName, setUnitName] = useState('');

  // Filtrar unidades
  const filteredUnits = units.filter(unit =>
    unit.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (editingUnit) {
      setUnits(units.map(unit => 
        unit.id_unidad === editingUnit.id_unidad 
          ? { ...unit, nombre: unitName }
          : unit
      ));
    } else {
      const newUnit: UnitOfMeasure = {
        id_unidad: Math.max(...units.map(u => u.id_unidad)) + 1,
        nombre: unitName,
      };
      setUnits([...units, newUnit]);
    }
    close();
    setUnitName('');
    setEditingUnit(null);
  };

  const handleEdit = (unit: UnitOfMeasure) => {
    setEditingUnit(unit);
    setUnitName(unit.nombre);
    open();
  };

  const handleDelete = (id: number) => {
    setUnits(units.filter(unit => unit.id_unidad !== id));
  };

  const rows = filteredUnits.map((unit) => (
    <Table.Tr key={unit.id_unidad}>
      <Table.Td>
        <Text>{unit.nombre}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" justify="center">
          <Tooltip label="Editar unidad" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => handleEdit(unit)}
              size="sm"
            >
              <IconEdit size="1rem" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Eliminar unidad" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              color="red"
              onClick={() => handleDelete(unit.id_unidad)}
              size="sm"
            >
              <IconTrash size="1.2rem" />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="xl">
      {/* CABECERA - Estilo POS */}
      <Paper withBorder p="md" mb="md" shadow="xs" style={{ flexShrink: 0 }}>
        <Group justify="space-between">
          <div>
            <Title order={3}>Unidades de Medida</Title>
            <Text c="dimmed" size="sm">Gestión de unidades de medida del sistema</Text>
          </div>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => {
              setEditingUnit(null);
              setUnitName('');
              open();
            }}
            size="md"
          >
            Agregar Unidad
          </Button>
        </Group>
      </Paper>

      {/* FILTROS */}
      <Paper withBorder p="md" mb="md" shadow="xs">
        <Group align="flex-end" gap="xs">
          <TextInput
            placeholder="Buscar unidad de medida..."
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 2 }}
            size="md"
          />
          
          <Button 
            variant="subtle" 
            onClick={() => setSearchTerm('')}
            size="md"
          >
            Limpiar
          </Button>
        </Group>
      </Paper>

      {/* TABLA - Estilo POS */}
      <Paper withBorder p="md" shadow="xs" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
        <Title order={4} mb="md" style={{ flexShrink: 0 }}>Lista de Unidades</Title>
        <Box style={{ flexGrow: 1, overflowY: 'auto' }}>
          <Table striped withColumnBorders withRowBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Unidad de Medida</Table.Th>
                <Table.Th style={{ textAlign: 'center' }}>Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={2} style={{ textAlign: 'center' }}>
                    <Text c="dimmed" py="xl">
                      No se encontraron unidades con los filtros aplicados
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                rows
              )}
            </Table.Tbody>
          </Table>
        </Box>
      </Paper>

      {/* MODAL - Estilo POS */}
      <Modal
        opened={opened}
        onClose={close}
        title={
          <Title order={4}>
            {editingUnit ? "Editar unidad de medida" : "Crear nueva unidad de medida"}
          </Title>
        }
        size="md"
        centered
      >
        <Stack>
          <TextInput
            label="Nombre de la unidad"
            value={unitName}
            onChange={(event) => setUnitName(event.currentTarget.value)}
            placeholder="Ej: Pieza, Caja, Metro, Litro..."
            size="md"
          />
          <Group justify="flex-end" gap="xs">
            <Button variant="subtle" onClick={close} size="md">
              Cancelar
            </Button>
            <Button onClick={handleSave} size="md">
              {editingUnit ? "Actualizar" : "Crear"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}