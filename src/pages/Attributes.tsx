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
  Flex,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconAlertCircle,
  IconCheck,
  IconEye,
  IconX,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

import { useAttributes } from '../hooks/useAttributes';
import type { Attribute, AttributeValue, AttributeFormData } from '../types/attribute.types';
import { attributeService } from '../services/attribute.service';

export default function AttributesPage() {
  const {
    filteredAttributes,
    loading,
    searchInput,
    setSearchInput,
    filtersApplied,
    loadAttributes,
    createAttribute,
    updateAttribute,
    deleteAttribute,
    createTempValue,
    updateValueInList,
    removeValueFromList,
    handleSearch,
    handleClearFilters,
  } = useAttributes();

  const [formModalOpened, { open: openFormModal, close: closeFormModal }] = useDisclosure(false);
  const [viewModalOpened, { open: openViewModal, close: closeViewModal }] = useDisclosure(false);
  const [deleteAttributeModalOpened, { open: openDeleteAttributeModal, close: closeDeleteAttributeModal }] = useDisclosure(false);
  const [deleteValueModalOpened, { open: openDeleteValueModal, close: closeDeleteValueModal }] = useDisclosure(false);
  const [confirmModalOpened, { open: openConfirmModal, close: closeConfirmModal }] = useDisclosure(false);

  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(null);
  const [viewingAttribute, setViewingAttribute] = useState<Attribute | null>(null);
  const [deletingValue, setDeletingValue] = useState<AttributeValue | null>(null);
  const [currentValues, setCurrentValues] = useState<AttributeValue[]>([]);
  const [newValueInput, setNewValueInput] = useState('');
  const [editingValueId, setEditingValueId] = useState<number | null>(null);
  const [tempEditValue, setTempEditValue] = useState('');

  // Formulario
  const form = useForm<{ name: string }>({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) => attributeService.validateName(value, selectedAttribute?.id_attribute),
    },
  });

  useEffect(() => {
    loadAttributes();
  }, [loadAttributes]);

  // Handlers
  const handleOpenCreateModal = () => {
    setSelectedAttribute(null);
    form.reset();
    setCurrentValues([]);
    setNewValueInput('');
    setEditingValueId(null);
    openFormModal();
  };

  const handleOpenEditModal = (attribute: Attribute) => {
    setSelectedAttribute(attribute);
    form.setValues({ name: attribute.name });
    setCurrentValues([...attribute.values]);
    setEditingValueId(null);
    openFormModal();
  };

  const handleViewAttribute = (attribute: Attribute) => {
    setViewingAttribute(attribute);
    openViewModal();
  };

  const handleAddValue = () => {
    const trimmedValue = newValueInput.trim();
    if (!trimmedValue) return;

    // Validar duplicado
    const validationError = attributeService.validateValue(trimmedValue, currentValues);
    if (validationError) {
      notifications.show({
        title: 'Valor Duplicado',
        message: validationError,
        color: 'red',
      });
      return;
    }

    const newValue = createTempValue(trimmedValue);
    setCurrentValues([...currentValues, newValue]);
    setNewValueInput('');
  };

  const startEditValue = (value: AttributeValue) => {
    if (editingValueId !== null) {
      handleSaveEdit();
    }
    setEditingValueId(value.id_value);
    setTempEditValue(value.value);
  };

  const handleSaveEdit = (): boolean => {
    if (editingValueId === null) return false;
    
    const trimmedValue = tempEditValue.trim();
    if (!trimmedValue) {
      notifications.show({
        title: 'Valor Requerido',
        message: 'El valor no puede estar vacío',
        color: 'orange',
      });
      return false;
    }

    // Validar duplicado
    const validationError = attributeService.validateValue(
      trimmedValue, 
      currentValues, 
      editingValueId
    );
    if (validationError) {
      notifications.show({
        title: 'Valor Duplicado',
        message: validationError,
        color: 'red',
      });
      return false;
    }

    const updatedValues = updateValueInList(currentValues, editingValueId, trimmedValue);
    setCurrentValues(updatedValues);
    setEditingValueId(null);
    setTempEditValue('');
    return true;
  };

  const handleRemoveValue = (value: AttributeValue) => {
    setDeletingValue(value);
    openDeleteValueModal();
  };

  const confirmDeleteValue = () => {
    if (deletingValue) {
      const updatedValues = removeValueFromList(currentValues, deletingValue.id_value);
      setCurrentValues(updatedValues);
    }
    closeDeleteValueModal();
    setDeletingValue(null);
  };

  const handleSaveAttribute = async () => {
    // Guardar cualquier edición pendiente
    if (editingValueId !== null) {
      if (!handleSaveEdit()) {
        return;
      }
    }

    // Validar formulario
    const validation = form.validate();
    if (validation.hasErrors) {
      return;
    }

    // Filtrar valores vacíos
    const filteredValues = currentValues.filter(v => v.value.trim() !== '');
    const formData: AttributeFormData = {
      name: form.values.name.trim(),
      values: filteredValues,
    };

    try {
      if (selectedAttribute) {
        await updateAttribute(selectedAttribute.id_attribute, formData);
      } else {
        await createAttribute(formData);
      }
      closeFormModal();
      resetModalState();
    } catch (error) {
      // Error ya manejado en el hook
    }
  };

  const handleDeleteAttribute = (attribute: Attribute) => {
    setSelectedAttribute(attribute);
    openDeleteAttributeModal();
  };

  const confirmDeleteAttribute = async () => {
    if (selectedAttribute) {
      try {
        await deleteAttribute(selectedAttribute.id_attribute, selectedAttribute.name);
        closeDeleteAttributeModal();
        setSelectedAttribute(null);
      } catch (error) {
        // Error ya manejado en el hook
      }
    }
  };

  const resetModalState = () => {
    form.reset();
    setCurrentValues([]);
    setSelectedAttribute(null);
    setNewValueInput('');
    setEditingValueId(null);
    setTempEditValue('');
  };

  const handleModalClose = () => {
    if (editingValueId !== null) {
      openConfirmModal();
    } else {
      closeFormModal();
      resetModalState();
    }
  };

  const confirmSaveAndClose = () => {
    if (handleSaveEdit()) {
      closeConfirmModal();
      handleSaveAttribute();
    }
  };

  const discardAndClose = () => {
    setEditingValueId(null);
    setTempEditValue('');
    closeConfirmModal();
    closeFormModal();
    resetModalState();
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    handleSaveAttribute();
  };

  // Table rows
  const rows = filteredAttributes.map((attribute) => (
    <Table.Tr key={attribute.id_attribute}>
      <Table.Td>
        <Text>{attribute.name}</Text>
        <Text c="dimmed" size="sm">
          {attribute.values.length} valor(es) definido(s)
        </Text>
      </Table.Td>
      <Table.Td style={{ width: 150, textAlign: 'center' }}>
        <Group gap="xs" justify="center">
          <Tooltip label="Ver valores" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => handleViewAttribute(attribute)}
              size="sm"
            >
              <IconEye size="1rem" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Editar atributo" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => handleOpenEditModal(attribute)}
              size="sm"
            >
              <IconEdit size="1rem" />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Eliminar atributo" position="bottom" withArrow>
            <ActionIcon
              variant="light"
              color="red"
              onClick={() => handleDeleteAttribute(attribute)}
              size="sm"
            >
              <IconTrash size="1rem" />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  const valueRows = currentValues.map((value) => (
    <Table.Tr key={value.id_value}>
      <Table.Td>
        {editingValueId === value.id_value ? (
          <TextInput
            value={tempEditValue}
            onChange={(e) => setTempEditValue(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
            }}
            autoFocus
            size="xs"
            placeholder="Nuevo valor"
          />
        ) : (
          <Text>{value.value}</Text>
        )}
      </Table.Td>
      <Table.Td style={{ width: '15%', textAlign: 'center' }}>
        <Group gap={4} justify="center">
          {editingValueId === value.id_value ? (
            <ActionIcon
              variant="light"
              color="green"
              onClick={handleSaveEdit}
              size="sm"
              disabled={!tempEditValue.trim()}
            >
              <IconCheck size="1rem" />
            </ActionIcon>
          ) : (
            <ActionIcon
              variant="light"
              color="orange"
              onClick={() => startEditValue(value)}
              size="sm"
            >
              <IconEdit size="1rem" />
            </ActionIcon>
          )}
          <ActionIcon
            variant="light"
            color="red"
            onClick={() => handleRemoveValue(value)}
            size="sm"
          >
            <IconTrash size="1rem" />
          </ActionIcon>
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
            <Title order={3}>Atributos de Productos</Title>
            <Text c="dimmed" size="sm">Gestión de atributos y sus valores para categorización de productos</Text>
          </div>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={handleOpenCreateModal}
            size="md"
          >
            Agregar Atributo
          </Button>
        </Group>
      </Paper>

      {/* Filtros */}
      <Paper withBorder p="md" mb="md" shadow="xs">
        <Group align="flex-end" gap="xs">
          <TextInput
            placeholder="Buscar atributo..."
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
        <Title order={4} mb="md">Lista de Atributos</Title>
        <Box style={{ flexGrow: 1, overflowY: 'auto' }}>
          <Table striped withColumnBorders withRowBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Atributo</Table.Th>
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
                        ? "No se encontraron atributos con los filtros aplicados" 
                        : "No hay atributos registrados"}
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
        onClose={handleModalClose}
        title={
          <Title order={4}>
            {selectedAttribute ? "Editar Atributo" : "Crear Nuevo Atributo"}
          </Title>
        }
        size="lg"
        centered
        closeOnClickOutside={false}
      >
        <form onSubmit={handleFormSubmit}>
          <Stack>
            <TextInput
              label="Nombre del Atributo"
              placeholder="Ej: Color, Tamaño, Material..."
              size="md"
              {...form.getInputProps('name')}
              withAsterisk
            />
            
            <Box>
              <Text fw={500} size="sm" mb="xs">Agregar Valor</Text>
              <Flex gap="xs">
                <TextInput
                  value={newValueInput}
                  onChange={(e) => setNewValueInput(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddValue();
                    }
                  }}
                  placeholder="Ej: Rojo"
                  style={{ flexGrow: 1 }}
                  size="md"
                  disabled={editingValueId !== null}
                />
                <Button
                  onClick={handleAddValue}
                  disabled={!newValueInput.trim() || editingValueId !== null}
                  leftSection={<IconPlus size={18} />}
                  size="md"
                >
                  Agregar
                </Button>
              </Flex>
            </Box>
            
            <Box>
              <Text fw={500} size="sm" mb="xs">Valores Actuales</Text>
              {currentValues.length > 0 ? (
                <Paper withBorder p="xs">
                  <Box style={{ maxHeight: 200, overflowY: 'auto' }}>
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Valor</Table.Th>
                          <Table.Th style={{ width: '15%', textAlign: 'center' }}>Acciones</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {valueRows}
                      </Table.Tbody>
                    </Table>
                  </Box>
                </Paper>
              ) : (
                <Text c="dimmed" py="sm" style={{ textAlign: 'center' }}>
                  Este atributo aún no tiene valores definidos.
                </Text>
              )}
            </Box>

            <Group justify="flex-end" gap="xs" mt="md">
              <Button
                type="button"
                variant="subtle"
                onClick={handleModalClose}
                size="md"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={editingValueId !== null}
                size="md"
              >
                {selectedAttribute ? "Actualizar" : "Crear"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Modal de Visualización */}
      <Modal
        opened={viewModalOpened}
        onClose={closeViewModal}
        title={
          <Title order={4}>
            Valores del Atributo: {viewingAttribute?.name}
          </Title>
        }
        size="md"
        centered
      >
        {viewingAttribute && (
          <Stack gap="md">
            <Paper withBorder p="md">
              <Box style={{ maxHeight: 300, overflowY: 'auto' }}>
                {viewingAttribute.values.length > 0 ? (
                  <Table striped>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Valor</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {viewingAttribute.values.map((value) => (
                        <Table.Tr key={value.id_value}>
                          <Table.Td>{value.value}</Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                ) : (
                  <Text c="dimmed" size="sm" py="md" style={{ textAlign: 'center' }}>
                    Este atributo no tiene valores definidos.
                  </Text>
                )}
              </Box>
            </Paper>
            <Group justify="flex-end">
              <Button variant="subtle" onClick={closeViewModal} size="md">
                Cerrar
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Modal de Confirmación para Edición Pendiente */}
      <Modal
        opened={confirmModalOpened}
        onClose={closeConfirmModal}
        title={<Title order={4}>Cambios Pendientes</Title>}
        centered
        size="sm"
        closeOnClickOutside={false}
      >
        <Text>Hay una edición de valor en curso. ¿Qué desea hacer con el cambio antes de cerrar?</Text>
        <Group justify="flex-end" gap="xs" mt="md">
          <Button variant="subtle" color="red" onClick={discardAndClose}>
            Descartar y Cerrar
          </Button>
          <Button onClick={confirmSaveAndClose} color="blue">
            Guardar y Continuar
          </Button>
        </Group>
      </Modal>

      {/* Modal de Confirmación de Eliminación de Atributo */}
      <Modal
        opened={deleteAttributeModalOpened}
        onClose={() => {
          closeDeleteAttributeModal();
          setSelectedAttribute(null);
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
            ¿Estás seguro de eliminar el atributo{" "}
            <Text span fw={600}>"{selectedAttribute?.name}"</Text>?
            Esta acción eliminará todos los valores asociados y es irreversible.
          </Alert>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => {
              closeDeleteAttributeModal();
              setSelectedAttribute(null);
            }}>
              Cancelar
            </Button>
            <Button color="red" onClick={confirmDeleteAttribute}>
              Sí, Eliminar
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal de Confirmación de Eliminación de Valor */}
      <Modal
        opened={deleteValueModalOpened}
        onClose={() => {
          closeDeleteValueModal();
          setDeletingValue(null);
        }}
        title={<Title order={4}>Confirmar Eliminación</Title>}
        centered
        size="sm"
      >
        <Stack gap="md">
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            title="Confirmar eliminación"
            color="orange"
          >
            ¿Estás seguro de eliminar el valor{" "}
            <Text span fw={600}>"{deletingValue?.value}"</Text>?
          </Alert>
          <Group justify="flex-end">
            <Button variant="subtle" onClick={() => {
              closeDeleteValueModal();
              setDeletingValue(null);
            }}>
              Cancelar
            </Button>
            <Button color="red" onClick={confirmDeleteValue}>
              Sí, Eliminar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}