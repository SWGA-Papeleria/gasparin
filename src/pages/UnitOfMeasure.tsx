import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Group,
  Table,
  Box,
  TextInput,
  Modal,
  ActionIcon,
  Tooltip,
  Alert,
  Stack,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';

import { useUnitOfMeasure } from '../hooks/useUnitOfMeasure';
import type { UnitOfMeasure, UnitOfMeasureFormData } from '../types/unit-of-measure.types';
import { unitOfMeasureService } from '../services/unit-of-measure.service';

export default function UnitOfMeasurePage() {
  const {
    filteredUnits,
    loading,
    searchInput,
    setSearchInput,
    filtersApplied,
    loadUnits,
    createUnit,
    updateUnit,
    deleteUnit,
    handleSearch,
    handleClearFilters,
  } = useUnitOfMeasure();

  const [formModalOpened, { open: openFormModal, close: closeFormModal }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitOfMeasure | null>(null);

  // Formulario
  const form = useForm<UnitOfMeasureFormData>({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => unitOfMeasureService.validateName(value, selectedUnit?.id_unit),
    },
  });

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  // Handlers
  const handleOpenCreateModal = () => {
    setSelectedUnit(null);
    form.reset();
    openFormModal();
  };

  const handleOpenEditModal = (unit: UnitOfMeasure) => {
    setSelectedUnit(unit);
    form.setValues({ name: unit.name });
    openFormModal();
  };

  const handleSaveUnit = async (values: UnitOfMeasureFormData) => {
    try {
      if (selectedUnit) {
        await updateUnit(selectedUnit.id_unit, values);
      } else {
        await createUnit(values);
      }
      closeFormModal();
      form.reset();
      setSelectedUnit(null);
    } catch (error) {
      // El error ya se maneja en el hook
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedUnit) {
      try {
        await deleteUnit(selectedUnit.id_unit, selectedUnit.name);
        closeDeleteModal();
        setSelectedUnit(null);
      } catch (error) {
        // El error ya se maneja en el hook
      }
    }
  };

  // Tabla rows
  const rows = filteredUnits.map((unit) => (
    <Table.Tr key={unit.id_unit}>
      <Table.Td>
        <Text>{unit.name}</Text>
      </Table.Td>
      <Table.Td style={{ width: 150, textAlign: 'center' }}>
        <Group gap="xs" justify="center">
          <Tooltip label="Editar unidad" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => handleOpenEditModal(unit)}
              size="sm"
            >
              <IconEdit size="1rem" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Eliminar unidad" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              color="red"
              onClick={() => {
                setSelectedUnit(unit);
                openDeleteModal();
              }}
              size="sm"
            >
              <IconTrash size="1rem" />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="xl">
      {/* Header */}
      <Paper withBorder p="md" mb="md" shadow="xs">
        <Group justify="space-between">
          <div>
            <Title order={3}>Unidades de Medida</Title>
            <Text c="dimmed" size="sm">Gestión de unidades de medida del sistema</Text>
          </div>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={handleOpenCreateModal}
            size="md"
          >
            Agregar Unidad
          </Button>
        </Group>
      </Paper>

      {/* Filtros */}
      <Paper withBorder p="md" mb="md" shadow="xs">
        <Group align="flex-end" gap="xs">
          <TextInput
            placeholder="Buscar unidad de medida..."
            leftSection={<IconSearch size={16} />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ flex: 2 }}
            size="md"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button
            variant="subtle"
            onClick={handleClearFilters}
            size="md"
          >
            Limpiar
          </Button>
          <Button
            onClick={handleSearch}
            size="md"
          >
            Buscar
          </Button>
        </Group>
      </Paper>

      {/* Tabla */}
      <Paper 
        withBorder 
        p="md" 
        shadow="xs" 
        style={{ 
          height: '400px', 
          display: 'flex', 
          flexDirection: 'column' 
        }}
      >
        <Title order={4} mb="md">Lista de Unidades</Title>
        <Box style={{ flexGrow: 1, overflowY: 'auto' }}>
          <Table striped withColumnBorders withRowBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Unidad de Medida</Table.Th>
                <Table.Th style={{ width: 150, textAlign: 'center' }}>Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                <Table.Tr>
                  <Table.Td colSpan={2} style={{ textAlign: 'center' }}>
                    <Text c="dimmed" py="xl">Cargando...</Text>
                  </Table.Td>
                </Table.Tr>
              ) : rows.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={2} style={{ textAlign: 'center' }}>
                    <Text c="dimmed" py="xl">
                      {filtersApplied 
                        ? "No se encontraron unidades con los filtros aplicados" 
                        : "No hay unidades registradas"}
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

      {/* Modal de Formulario */}
      <Modal
        opened={formModalOpened}
        onClose={() => {
          closeFormModal();
          form.reset();
          setSelectedUnit(null);
        }}
        title={
          <Title order={4}>
            {selectedUnit ? "Editar Unidad de Medida" : "Crear Nueva Unidad de Medida"}
          </Title>
        }
        size="md"
        centered
        closeOnClickOutside={false}
      >
        <form onSubmit={form.onSubmit(handleSaveUnit)}>
          <Stack>
            <TextInput
              label="Nombre de la Unidad"
              placeholder="Ej: Pieza, Caja, Metro, Litro..."
              size="md"
              {...form.getInputProps('name')}
              withAsterisk
            />
            <Group justify="flex-end" gap="xs" mt="md">
              <Button
                type="button"
                variant="subtle"
                onClick={() => {
                  closeFormModal();
                  form.reset();
                  setSelectedUnit(null);
                }}
                size="md"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="md"
              >
                {selectedUnit ? "Actualizar" : "Crear"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        opened={deleteModalOpened}
        onClose={() => {
          closeDeleteModal();
          setSelectedUnit(null);
        }}
        title={<Title order={4}>Confirmar Eliminación</Title>}
        centered
      >
        <Stack gap="md">
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            title="Confirmar eliminación"
            color="red"
          >
            ¿Estás seguro de eliminar la unidad{" "}
            <Text span fw={600}>"{selectedUnit?.name}"</Text>?
            Esta acción no se puede deshacer.
          </Alert>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => {
              closeDeleteModal();
              setSelectedUnit(null);
            }}>
              Cancelar
            </Button>
            <Button color="red" onClick={handleConfirmDelete}>
              Sí, Eliminar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}