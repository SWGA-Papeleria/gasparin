// src/components/point-of-sale/ProductList.tsx
import React, { useEffect, useState } from 'react';
import { 
  Paper, 
  Title, 
  Table, 
  TextInput, 
  Button, 
  Box, 
  Group,
  Loader,
  Center
} from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import type { ProductListProps } from '../../types/pos.types';

const ProductList: React.FC<ProductListProps> = ({
  products,
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  onAddToCart,
  isSearching = false,
  isLoadingInitial = false, // Nueva prop para carga inicial
}) => {
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  
  // Efecto para manejar la carga inicial
  useEffect(() => {
    if (isLoadingInitial) {
      setIsInitialLoading(true);
    } else {
      // Pequeño delay para que se vea el loader
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoadingInitial]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearchSubmit();
    }
  };

  const handleClearSearch = () => {
    onSearchChange('');
    onSearchSubmit(); 
  };

  // Determinar si debe mostrar algún tipo de loader
  const showLoader = isInitialLoading || isSearching;

  return (
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
      <Title order={4} mb="md">Productos Disponibles</Title>
      
      <Group mb="sm" gap="xs">
        <TextInput
          placeholder="Buscar producto por nombre o SKU..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1 }}
          disabled={showLoader}
          rightSection={
            searchTerm.trim() ? (
              <IconX 
                size="0.8rem" 
                style={{ cursor: 'pointer' }} 
                onClick={handleClearSearch}
              />
            ) : null
          }
        />
        <Button 
          leftSection={<IconSearch size="1rem" />}
          onClick={onSearchSubmit}
          disabled={showLoader}
        >
          Buscar
        </Button>
      </Group>
      
      <Box style={{ flexGrow: 1, overflowY: 'auto', position: 'relative' }}>
        {showLoader ? (
          <Center style={{ 
            height: '100%', 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(255, 255, 255, 0.8)', 
            zIndex: 10 
          }}>
            <Loader size="lg" type="dots" />
          </Center>
        ) : null}
        
        <Table 
          striped 
          withColumnBorders 
          withRowBorders 
          style={{ opacity: showLoader ? 0.5 : 1 }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>SKU</Table.Th>
              <Table.Th>Producto</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Precio Unitario</Table.Th>
              <Table.Th style={{ textAlign: 'right' }}>Stock</Table.Th>
              <Table.Th style={{ textAlign: 'center' }}>Acción</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {products.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                  {showLoader 
                    ? 'Cargando productos...' 
                    : searchTerm.trim() 
                      ? 'No se encontraron productos con ese criterio' 
                      : 'No hay productos disponibles'}
                </Table.Td>
              </Table.Tr>
            ) : (
              products.map((product) => (
                <Table.Tr key={product.id}>
                  <Table.Td>SKU-{product.id.toString().padStart(4, '0')}</Table.Td>
                  <Table.Td>{product.name}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    ${product.unitPrice.toFixed(2)}
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    {Math.floor(Math.random() * 50) + 10}
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    <Button 
                      size="xs" 
                      variant="light" 
                      onClick={() => onAddToCart(product)}
                      disabled={showLoader}
                    >
                      Agregar
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Box>
    </Paper>
  );
};

export default ProductList;