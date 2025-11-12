// pages/view/Attributes.tsx
import { useState, useMemo } from 'react';
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
  Flex,
  List,
} from '@mantine/core';
import { 
  IconEdit, 
  IconTrash, 
  IconPlus, 
  IconSearch, 
  IconCheck, 
  IconEye, // Ícono para la visualización
  IconX,   // Para notificaciones de error
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications'; // Importar notificaciones

interface AttributeValue {
  id_valor: number;
  valor: string;
}

interface Attribute {
  id_atributo: number;
  nombre: string;
  valores: AttributeValue[];
}

export default function Attributes() {
  const [attributes, setAttributes] = useState<Attribute[]>([
    {
      id_atributo: 1,
      nombre: 'Color',
      valores: [
        { id_valor: 1, valor: 'Rojo' },
        { id_valor: 2, valor: 'Azul' },
        { id_valor: 3, valor: 'Verde' },
      ]
    },
    {
      id_atributo: 2,
      nombre: 'Tamaño',
      valores: [
        { id_valor: 4, valor: 'S' },
        { id_valor: 5, valor: 'M' },
        { id_valor: 6, valor: 'L' },
      ]
    },
    {
      id_atributo: 3,
      nombre: 'Material',
      valores: [
        { id_valor: 7, valor: 'Algodón' },
        { id_valor: 8, valor: 'Poliéster' },
        // Simulando una lista larga para probar el nuevo modal
        ...Array.from({ length: 15 }).map((_, i) => ({ id_valor: 100 + i, valor: `Extra Valor ${i + 1}` })),
      ]
    },
    {
      id_atributo: 4,
      nombre: 'Marca',
      valores: []
    },
    {
      id_atributo: 5,
      nombre: 'Modelo',
      valores: []
    },
  ]);

  // Estado para búsqueda de atributos (tabla principal)
  const [searchTerm, setSearchTerm] = useState('');

  // Modales
  const [attributeModalOpened, { open: openAttributeModal, close: closeAttributeModal }] = useDisclosure(false);
  const [confirmModalOpened, { open: openConfirmModal, close: closeConfirmModal }] = useDisclosure(false);
  
  // NUEVOS ESTADOS para el Modal de Visualización
  const [viewValuesModalOpened, { open: openViewValuesModal, close: closeViewValuesModal }] = useDisclosure(false);
  const [viewingAttribute, setViewingAttribute] = useState<Attribute | null>(null);
  const [viewValueSearchTerm, setViewValueSearchTerm] = useState('');

  // NUEVOS ESTADOS para el Modal de Confirmación de ELIMINACIÓN
  const [deleteConfirmModalOpened, { open: openDeleteConfirmModal, close: closeDeleteConfirmModal }] = useDisclosure(false);
  const [deletingAttribute, setDeletingAttribute] = useState<Attribute | null>(null);


  // Estados para atributos
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);
  const [attributeName, setAttributeName] = useState('');
  const [currentValues, setCurrentValues] = useState<AttributeValue[]>([]);
  const [newValueInput, setNewValueInput] = useState('');
  
  // Edición en línea
  const [editingValueId, setEditingValueId] = useState<number | null>(null);
  const [tempEditValue, setTempEditValue] = useState('');

  // Búsqueda de valores dentro del modal de edición
  const [valueSearchTerm, setValueSearchTerm] = useState('');

  // **Funcionalidad: Generar nuevo ID único para valores temporales**
  const getNextTempId = () => {
    const allIds = attributes.flatMap(attr => attr.valores.map(v => v.id_valor))
      .concat(currentValues.map(v => v.id_valor));
    const maxGlobalId = allIds.length > 0 ? Math.max(...allIds) : 0;
    
    return maxGlobalId >= 0 ? -(maxGlobalId + 1) : maxGlobalId - 1;
  };
  
  // **Funcionalidad: Agregar Valor (Individual)**
  const handleAddValue = () => {
    const trimmedValue = newValueInput.trim();
    if (!trimmedValue) return;

    // Evita duplicados
    if (currentValues.some(v => v.valor.toLowerCase() === trimmedValue.toLowerCase())) {
        notifications.show({
            title: 'Valor Duplicado',
            message: `El valor "${trimmedValue}" ya existe en la lista.`,
            color: 'red',
            icon: <IconX size="1rem" />,
        });
        return;
    }

    const newValues: AttributeValue = {
      id_valor: getNextTempId(),
      valor: trimmedValue
    };
    
    setCurrentValues([...currentValues, newValues]);
    setNewValueInput('');
    // Limpiar búsqueda si se agrega un nuevo valor para que sea visible
    setValueSearchTerm(''); 
  };

  // **Funcionalidad: Eliminar Valor Individual**
  const handleRemoveValue = (id_valor: number) => {
    setCurrentValues(currentValues.filter(val => val.id_valor !== id_valor));
  };

  // **Funcionalidad: Iniciar Edición de Valor**
  const startEditValue = (val: AttributeValue) => {
    if (editingValueId !== null) {
        handleSaveEdit();
    }
    setEditingValueId(val.id_valor);
    setTempEditValue(val.valor);
  };
  
  // **Funcionalidad: Guardar Edición de Valor (Botón de Palomita)**
  const handleSaveEdit = () => {
    const idToSave = editingValueId;
    const trimmedValue = tempEditValue.trim();
    
    if (idToSave === null) return;
    
    if (!trimmedValue) {
        notifications.show({
            title: 'Valor Requerido',
            message: 'El valor no puede estar vacío. Por favor, ingrese un texto o use el icono de basura para eliminar.',
            color: 'orange',
            icon: <IconX size="1rem" />,
        });
        return false;
    } else {
        const isDuplicate = currentValues.some(val => 
            val.id_valor !== idToSave && val.valor.toLowerCase() === trimmedValue.toLowerCase()
        );

        if (isDuplicate) {
            notifications.show({
                title: 'Valor Duplicado',
                message: `El valor "${trimmedValue}" ya existe en la lista.`,
                color: 'red',
                icon: <IconX size="1rem" />,
            });
            return false;
        }

        setCurrentValues(currentValues.map(val =>
            val.id_valor === idToSave ? { ...val, valor: trimmedValue } : val
        ));
    }
    
    setEditingValueId(null);
    setTempEditValue('');
    return true;
  };

  // Filtrar atributos (Tabla principal)
  const filteredAttributes = useMemo(() => attributes.filter(attribute =>
    attribute.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  ), [attributes, searchTerm]);

  // Filtrar valores (Dentro del modal de edición)
  const filteredValues = useMemo(() => {
    if (!valueSearchTerm.trim()) {
        return currentValues;
    }
    return currentValues.filter(val =>
        val.valor.toLowerCase().includes(valueSearchTerm.toLowerCase())
    );
  }, [currentValues, valueSearchTerm]);

  // Filtrar valores para el Modal de Visualización
  const filteredViewValues = useMemo(() => {
    if (!viewingAttribute || !viewValueSearchTerm.trim()) {
        return viewingAttribute?.valores || [];
    }
    return viewingAttribute.valores.filter(val =>
        val.valor.toLowerCase().includes(viewValueSearchTerm.toLowerCase())
    );
  }, [viewingAttribute, viewValueSearchTerm]);


  // Limpiar estados y cerrar modal principal
  const resetAndCloseModal = () => {
    closeAttributeModal();
    setAttributeName('');
    setCurrentValues([]);
    setEditingAttribute(null);
    setNewValueInput('');
    setEditingValueId(null);
    setTempEditValue('');
    setValueSearchTerm(''); 
  };
  
  // Manejar guardar atributo
  const handleSaveAttribute = () => {
    if (editingValueId !== null) {
        if (!handleSaveEdit()) {
            return; 
        }
    }
    
    const valoresAFiltrar = currentValues.filter(v => v.valor.trim() !== '');

    if (editingAttribute) {
      setAttributes(attributes.map(attr => 
        attr.id_atributo === editingAttribute.id_atributo 
          ? { ...attr, nombre: attributeName, valores: valoresAFiltrar }
          : attr
      ));
    } else {
      const newAttribute: Attribute = {
        id_atributo: Math.max(...attributes.map(a => a.id_atributo), 0) + 1,
        nombre: attributeName,
        valores: valoresAFiltrar,
      };
      setAttributes([...attributes, newAttribute]);
    }
    
    resetAndCloseModal();
  };

  // Lógica de cierre del modal de edición
  const handleModalClose = () => {
    if (editingValueId !== null) {
      openConfirmModal();
    } else {
      resetAndCloseModal();
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
    resetAndCloseModal();
  };

  // Manejar editar atributo (Carga los datos al modal)
  const handleEdit = (attribute: Attribute) => {
    setEditingAttribute(attribute);
    setAttributeName(attribute.nombre);
    setCurrentValues(attribute.valores);
    setValueSearchTerm('');
    openAttributeModal();
  };

  // Manejar Ver Atributo
  const handleView = (attribute: Attribute) => {
    setViewingAttribute(attribute);
    setViewValueSearchTerm(''); // Limpiar búsqueda al abrir
    openViewValuesModal();
  };

  // Manejar eliminar atributo (MODIFICADO: Usa modal en lugar de window.confirm)
  const handleDelete = (attribute: Attribute) => {
     setDeletingAttribute(attribute);
     openDeleteConfirmModal();
  };
  
  // Nuevo: Confirma la eliminación
  const confirmDeleteAttribute = () => {
    if (deletingAttribute) {
        setAttributes(attributes.filter(attr => attr.id_atributo !== deletingAttribute.id_atributo));
    }
    closeDeleteConfirmModal();
    setDeletingAttribute(null);
  };


  const rows = filteredAttributes.map((attribute) => (
    <Table.Tr key={attribute.id_atributo}>
      {/* Columna de Atributo: ocupa el espacio restante (width: 'auto') */}
      <Table.Td> 
        <Text>{attribute.nombre}</Text>
        {/* CONTEO DE VALORES EN LA TABLA PRINCIPAL (ÚNICO LUGAR PERMITIDO) */}
        <Text c="dimmed" size="sm">
          {attribute.valores.length} valor(es) definido(s)
        </Text>
      </Table.Td>
      
      {/* Columna de Acciones: Ancho fijo y pequeño */}
      <Table.Td style={{ width: 150, textAlign: 'center' }}>
          <Group gap="xs" justify="center">
              {/* Botón de Visualización (IconEye) */}
              <Tooltip label="Ver valores" position="bottom" withArrow>
                  <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => handleView(attribute)}
                      size="sm"
                  >
                      <IconEye size="1rem" />
                  </ActionIcon>
              </Tooltip>

              <Tooltip label="Editar atributo y valores" position="bottom" withArrow>
                  <ActionIcon
                      variant="light"
                      color="orange"
                      onClick={() => handleEdit(attribute)}
                      size="sm"
                  >
                      <IconEdit size="1rem" />
                  </ActionIcon>
              </Tooltip>
              <Tooltip label="Eliminar atributo" position="bottom" withArrow>
                  <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleDelete(attribute)} // MODIFICADO: Llama a handleDelete con el objeto
                      size="sm"
                  >
                      <IconTrash size="1rem" />
                  </ActionIcon>
              </Tooltip>
          </Group>
      </Table.Td>
    </Table.Tr>
  ));
  
  // Renderizado de la tabla de valores editable
  const valueRows = filteredValues.map((val) => (
    <Table.Tr key={val.id_valor}>
      <Table.Td> 
        {editingValueId === val.id_valor ? (
          <TextInput
            value={tempEditValue}
            onChange={(e) => setTempEditValue(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSaveEdit();
              }
            }}
            autoFocus
            size="xs"
            placeholder="Nuevo valor"
          />
        ) : (
          <Text>{val.valor}</Text>
        )}
      </Table.Td>
      <Table.Td style={{ width: '15%', textAlign: 'center' }}> 
        <Group gap={4} justify="center">
          {editingValueId === val.id_valor ? (
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
              onClick={() => startEditValue(val)}
              size="sm"
            >
              <IconEdit size="1rem" />
            </ActionIcon>
          )}
          
          <ActionIcon
            variant="light"
            color="red"
            onClick={() => handleRemoveValue(val.id_valor)}
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
      {/* CABECERA - Estilo POS */}
      <Paper withBorder p="md" mb="md" shadow="xs" style={{ flexShrink: 0 }}>
        <Group justify="space-between">
          <div>
            <Title order={3}>Atributos de Productos</Title>
            <Text c="dimmed" size="sm">Gestión de atributos y sus valores para categorización de productos</Text>
          </div>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => {
              setEditingAttribute(null);
              setAttributeName('');
              setCurrentValues([]);
              setNewValueInput('');
              openAttributeModal();
            }}
            size="md"
          >
            Agregar Atributo
          </Button>
        </Group>
      </Paper>

      {/* FILTROS (Tabla Principal) */}
      <Paper withBorder p="md" mb="md" shadow="xs">
        <Group align="flex-end" gap="xs">
          <TextInput
            placeholder="Buscar atributo..."
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
        <Title order={4} mb="md" style={{ flexShrink: 0 }}>Lista de Atributos</Title>
        <Box style={{ flexGrow: 1, overflowY: 'auto' }}>
          <Table striped withColumnBorders withRowBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 'auto' }}>Atributo</Table.Th>
                <Table.Th style={{ width: 150, textAlign: 'center' }}>Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={2} style={{ textAlign: 'center' }}>
                    <Text c="dimmed" py="xl">
                      No se encontraron atributos con los filtros aplicados
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

      {/* MODAL PARA ATRIBUTOS Y VALORES (EDICIÓN/CREACIÓN) */}
      <Modal
        opened={attributeModalOpened}
        onClose={handleModalClose}
        title={
          <Title order={4}>
            {editingAttribute ? "Editar atributo" : "Crear nuevo atributo"}
          </Title>
        }
        size="lg"
        centered
        closeOnClickOutside={false} // AÑADIDO: No se cierra al hacer click fuera
      >
        <Stack>
          <TextInput
            label="Nombre del atributo"
            value={attributeName}
            onChange={(event) => setAttributeName(event.currentTarget.value)}
            placeholder="Ej: Color, Tamaño, Material..."
            size="md"
          />
          
          <Box>
            <Text fw={500} size="sm" mb="xs">Agregar valor</Text>
            <Flex gap="xs">
              <TextInput
                value={newValueInput}
                onChange={(event) => setNewValueInput(event.currentTarget.value)}
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
          
          {/* TABLA DE VALORES EDITABLE: Se quitó el conteo de (currentValues.length) */}
          <Box>
            <Text fw={500} size="sm" mb="xs">Valores actuales</Text> 
            
            <Group align="flex-end" gap="xs" mb="xs">
              <TextInput
                  placeholder="Buscar valor..."
                  leftSection={<IconSearch size={16} />}
                  value={valueSearchTerm}
                  onChange={(e) => setValueSearchTerm(e.target.value)}
                  style={{ flex: 2 }}
                  size="sm"
                  disabled={currentValues.length === 0}
              />
              <Button 
                  variant="subtle" 
                  onClick={() => setValueSearchTerm('')}
                  size="sm"
                  disabled={currentValues.length === 0}
              >
                  Limpiar
              </Button>
            </Group>
            
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
                      {valueRows.length > 0 ? (
                        valueRows
                      ) : (
                        <Table.Tr>
                          <Table.Td colSpan={2} style={{ textAlign: 'center' }}>
                            <Text c="dimmed" py="xs">
                              No se encontraron valores que coincidan con la búsqueda.
                            </Text>
                          </Table.Td>
                        </Table.Tr>
                      )}
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
            <Button variant="subtle" onClick={handleModalClose} size="md">
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveAttribute} 
              disabled={!attributeName.trim() || editingValueId !== null}
              size="md"
            >
              {editingAttribute ? "Actualizar" : "Crear"}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* MODAL DE CONFIRMACIÓN PARA EDICIÓN PENDIENTE */}
      <Modal
        opened={confirmModalOpened}
        onClose={closeConfirmModal}
        title={<Title order={4}>Cambios Pendientes</Title>}
        centered
        size="sm"
        closeOnClickOutside={false} // AÑADIDO: No se cierra al hacer click fuera
      >
        <Text>Hay una edición de valor en curso. ¿Qué desea hacer con el cambio antes de cerrar?</Text>
        <Group justify="flex-end" gap="xs" mt="md">
          <Button variant="subtle" color="red" onClick={discardAndClose}>
            Descartar y Cerrar
          </Button>
          <Button onClick={confirmSaveAndClose} color="blue"> {/* MODIFICADO: De verde a azul */}
            Guardar y Continuar
          </Button>
        </Group>
      </Modal>
      
      {/* MODAL DE VISUALIZACIÓN DE VALORES (IconEye) */}
      <Modal
        opened={viewValuesModalOpened}
        onClose={closeViewValuesModal}
        title={
          // Título uniforme
          <Title order={4} mb="md">
            Valores del Atributo: <Text component="span" fw={700} inherit>{viewingAttribute?.nombre || '...'}</Text>
          </Title>
        }
        size="md"
        centered
        closeOnClickOutside={false} // AÑADIDO: No se cierra al hacer click fuera
      >
        {viewingAttribute && (
          <Stack gap="lg">
            
            <Group align="flex-end" gap="xs">
              <TextInput
                  placeholder="Buscar valor..."
                  leftSection={<IconSearch size={16} />}
                  value={viewValueSearchTerm}
                  onChange={(e) => setViewValueSearchTerm(e.target.value)}
                  style={{ flex: 2 }}
                  size="sm"
              />
              <Button 
                  variant="subtle" 
                  onClick={() => setViewValueSearchTerm('')}
                  size="sm"
              >
                  Limpiar
              </Button>
            </Group>

            <Paper withBorder p="md" bg="gray.0">
              <Stack gap="md">
                
                <div>
                  {/* Etiqueta de la lista, sin conteo */}
                  <Text fw={600} size="sm" c="dimmed" mb={4}>Lista de Valores {viewValueSearchTerm && '(filtrada)'}</Text>
                  
                  {/* Valores en formato de Tabla */}
                  <Box style={{ maxHeight: 250, overflowY: 'auto', border: '1px solid var(--mantine-color-gray-3)' }}>
                      {filteredViewValues.length > 0 ? (
                          <Table striped>
                              <Table.Thead>
                                  <Table.Tr>
                                      <Table.Th>Valor</Table.Th>
                                  </Table.Tr>
                              </Table.Thead>
                              <Table.Tbody>
                                  {filteredViewValues.map(val => (
                                      <Table.Tr key={val.id_valor}>
                                          <Table.Td>{val.valor}</Table.Td>
                                      </Table.Tr>
                                  ))}
                              </Table.Tbody>
                          </Table>
                      ) : (
                          <Text c="dimmed" size="sm" py="md" style={{ textAlign: 'center' }}>
                              No se encontraron valores que coincidan con la búsqueda.
                          </Text>
                      )}
                  </Box>
                </div>
              </Stack>
            </Paper>

            <Group justify="flex-end">
              <Button variant="subtle" onClick={closeViewValuesModal} size="md">
                Cerrar
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
      
      {/* NUEVO: MODAL DE CONFIRMACIÓN PARA ELIMINACIÓN */}
      <Modal
        opened={deleteConfirmModalOpened}
        onClose={closeDeleteConfirmModal}
        title={<Title order={4} c="red">Confirmar Eliminación</Title>}
        centered
        size="sm"
        closeOnClickOutside={false} // AÑADIDO
      >
        <Text>¿Estás seguro de que deseas eliminar el atributo {deletingAttribute?.nombre}?</Text>
        <Text c="dimmed" size="sm" mt="xs">Esta acción eliminará también todos los valores asociados y es irreversible.</Text>
        <Group justify="flex-end" gap="xs" mt="md">
            <Button variant="subtle" onClick={closeDeleteConfirmModal}>
                Cancelar
            </Button>
            <Button onClick={confirmDeleteAttribute} color="red">
                Eliminar
            </Button>
        </Group>
      </Modal>
    </Container>
  );
}