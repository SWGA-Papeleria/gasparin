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

import { useBrands } from '../hooks/useBrands';
import type { Brand, BrandFormData } from '../types/brand.types';
import { brandService } from '../services/brand.service';

export default function Brands() {
  const {
    filteredBrands,
    loading,
    searchInput,
    setSearchInput,
    filtersApplied,
    loadBrands,
    createBrand,
    updateBrand,
    deleteBrand,
    handleSearch,
    handleClearFilters,
  } = useBrands();

  const [formModalOpened, { open: openFormModal, close: closeFormModal }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  // Formulario
  const form = useForm<BrandFormData>({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => brandService.validateName(value, selectedBrand?.id_brand),
    },
  });

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  // Handlers
  const handleOpenCreateModal = () => {
    setSelectedBrand(null);
    form.reset();
    openFormModal();
  };

  const handleOpenEditModal = (brand: Brand) => {
    setSelectedBrand(brand);
    form.setValues({ name: brand.name });
    openFormModal();
  };

  const handleSaveBrand = async (values: BrandFormData) => {
    try {
      if (selectedBrand) {
        await updateBrand(selectedBrand.id_brand, values);
      } else {
        await createBrand(values);
      }
      closeFormModal();
      form.reset();
      setSelectedBrand(null);
    } catch (error) {
      // El error ya se maneja en el hook
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedBrand) {
      try {
        await deleteBrand(selectedBrand.id_brand, selectedBrand.name);
        closeDeleteModal();
        setSelectedBrand(null);
      } catch (error) {
        // El error ya se maneja en el hook
      }
    }
  };

  // Tabla rows
  const rows = filteredBrands.map((brand) => (
    <Table.Tr key={brand.id_brand}>
      <Table.Td>
        <Text>{brand.name}</Text>
      </Table.Td>
      <Table.Td style={{ width: 120, textAlign: 'center' }}>
        <Group gap="xs" justify="center">
          <Tooltip label="Editar marca" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => handleOpenEditModal(brand)}
              size="sm"
            >
              <IconEdit size="1rem" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Eliminar marca" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              color="red"
              onClick={() => {
                setSelectedBrand(brand);
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
            <Title order={3}>Marcas</Title>
            <Text c="dimmed" size="sm">Gestión de marcas para productos</Text>
          </div>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={handleOpenCreateModal}
            size="md"
          >
            Agregar Marca
          </Button>
        </Group>
      </Paper>

      {/* Filtros */}
      <Paper withBorder p="md" mb="md" shadow="xs">
        <Group align="flex-end" gap="xs">
          <TextInput
            placeholder="Buscar marca..."
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
        <Title order={4} mb="md">Lista de Marcas</Title>
        <Box style={{ flexGrow: 1, overflowY: 'auto' }}>
          <Table striped withColumnBorders withRowBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Marca</Table.Th>
                <Table.Th style={{ width: 120, textAlign: 'center' }}>Acciones</Table.Th>
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
                        ? "No se encontraron marcas con los filtros aplicados" 
                        : "No hay marcas registradas"}
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
          setSelectedBrand(null);
        }}
        title={
          <Title order={4}>
            {selectedBrand ? "Editar Marca" : "Crear Nueva Marca"}
          </Title>
        }
        size="md"
        centered
        closeOnClickOutside={false}
      >
        <form onSubmit={form.onSubmit(handleSaveBrand)}>
          <Stack>
            <TextInput
              label="Nombre de la Marca"
              placeholder="Ej: BIC, Norma, Faber-Castell..."
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
                  setSelectedBrand(null);
                }}
                size="md"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="md"
              >
                {selectedBrand ? "Actualizar" : "Crear"}
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
          setSelectedBrand(null);
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
            ¿Estás seguro de eliminar la marca{" "}
            <Text span fw={600}>"{selectedBrand?.name}"</Text>?
            Esta acción no se puede deshacer.
          </Alert>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => {
              closeDeleteModal();
              setSelectedBrand(null);
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