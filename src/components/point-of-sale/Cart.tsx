// src/components/point-of-sale/Cart.tsx
import React from 'react';
import { Paper, Title, Text, Button, Stack, Group, Box, NumberInput, ActionIcon } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import type { CartProps } from '../../types/pos.types';

const Cart: React.FC<CartProps> = ({
  items,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onStartPayment,
}) => {
  return (
    <Paper 
      withBorder 
      p="md" 
      shadow="xs" 
      style={{ height: '400px', display: 'flex', flexDirection: 'column' }}
    >
      <Title order={4} mb="md">Detalle de Venta</Title>
      
      <Box style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '15px' }}>
        {items.length === 0 ? (
          <Text c="dimmed">No hay artículos en la venta. Agrega un producto.</Text>
        ) : (
          <Stack gap="xs">
            {items.map((item) => (
              <Paper key={item.id} withBorder p="xs" shadow="xs">
                <Group justify="space-between" align="flex-start">
                  <Box style={{ flex: 1 }}>
                    <Text size="sm" fw={700}>{item.name}</Text>
                    <Text size="xs" c="dimmed">${item.unitPrice.toFixed(2)} c/u</Text>
                  </Box>

                  <Stack gap={2} align="flex-end">
                    <Text size="sm" fw={700}>
                      ${item.subtotal.toFixed(2)}
                    </Text>
                    <Group gap="xs">
                      <NumberInput
                        value={item.quantity}
                        onChange={(value) => onUpdateQuantity(item.id, Number(value))}
                        min={1}
                        step={1}
                        size="xs"
                        w={60}
                        hideControls
                      />
                      <ActionIcon 
                        size="sm" 
                        color="red" 
                        variant="light" 
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <IconTrash size="1rem" />
                      </ActionIcon>
                    </Group>
                  </Stack>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>

      <Stack gap="xs" pt="sm" style={{ borderTop: '1px solid var(--mantine-color-gray-3)', flexShrink: 0 }}>
        <Group justify="space-between">
          <Title order={4}>TOTAL:</Title>
          <Title order={3} c="green.7">${total.toFixed(2)}</Title>
        </Group>
        
        <Button 
          size="lg" 
          color="green"
          onClick={onStartPayment}
          disabled={items.length === 0}
        >
          Pagar
        </Button>
      </Stack>
    </Paper>
  );
};

export default Cart;