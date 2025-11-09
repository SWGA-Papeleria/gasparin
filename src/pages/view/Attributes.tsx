// pages/view/Attributes.tsx
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

interface Attribute {
  id_atributo: number;
  nombre: string;
}

export default function Attributes() {
  const [attributes, setAttributes] = useState<Attribute[]>([
    { id_atributo: 1, nombre: 'Color' },
    { id_atributo: 2, nombre: 'Tamaño' },
    { id_atributo: 3, nombre: 'Material' },
    { id_atributo: 4, nombre: 'Marca' },
    { id_atributo: 5, nombre: 'Modelo' },
  ]);

  // Estado para búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  const [opened, { open, close }] = useDisclosure(false);
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(null);
  const [attributeName, setAttributeName] = useState('');

  // Filtrar atributos
  const filteredAttributes = attributes.filter(attribute =>
    attribute.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (editingAttribute) {
      setAttributes(attributes.map(attr => 
        attr.id_atributo === editingAttribute.id_atributo 
          ? { ...attr, nombre: attributeName }
          : attr
      ));
    } else {
      const newAttribute: Attribute = {
        id_atributo: Math.max(...attributes.map(a => a.id_atributo)) + 1,
        nombre: attributeName,
      };
      setAttributes([...attributes, newAttribute]);
    }
    close();
    setAttributeName('');
    setEditingAttribute(null);
  };

  const handleEdit = (attribute: Attribute) => {
    setEditingAttribute(attribute);
    setAttributeName(attribute.nombre);
    open();
  };

  const handleDelete = (id: number) => {
    setAttributes(attributes.filter(attribute => attribute.id_atributo !== id));
  };

  const rows = filteredAttributes.map((attribute) => (
    <Table.Tr key={attribute.id_atributo}>
      <Table.Td>
        <Text>{attribute.nombre}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" justify="center">
          <Tooltip label="Editar atributo" position="bottom" withArrow>
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
              onClick={() => handleDelete(attribute.id_atributo)}
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
            <Title order={3}>Atributos de Productos</Title>
            <Text c="dimmed" size="sm">Gestión de atributos para categorización de productos</Text>
          </div>
          <Button
            leftSection={<IconPlus size={18} />}
            onClick={() => {
              setEditingAttribute(null);
              setAttributeName('');
              open();
            }}
            size="md"
          >
            Agregar Atributo
          </Button>
        </Group>
      </Paper>

      {/* FILTROS */}
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
                <Table.Th>Atributo</Table.Th>
                <Table.Th style={{ textAlign: 'center' }}>Acciones</Table.Th>
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

      {/* MODAL - Estilo POS */}
      <Modal
        opened={opened}
        onClose={close}
        title={
          <Title order={4}>
            {editingAttribute ? "Editar atributo" : "Crear nuevo atributo"}
          </Title>
        }
        size="md"
        centered
      >
        <Stack>
          <TextInput
            label="Nombre del atributo"
            value={attributeName}
            onChange={(event) => setAttributeName(event.currentTarget.value)}
            placeholder="Ej: Color, Tamaño, Material..."
            size="md"
          />
          <Group justify="flex-end" gap="xs">
            <Button variant="subtle" onClick={close} size="md">
              Cancelar
            </Button>
            <Button onClick={handleSave} size="md">
              {editingAttribute ? "Actualizar" : "Crear"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}