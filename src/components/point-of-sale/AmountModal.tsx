// src/components/point-of-sale/AmountModal.tsx
import React, { useState } from 'react';
import { Title, Text, Button, Stack, Group, Box, NumberInput } from '@mantine/core';
import type { AmountModalProps } from '../../types/pos.types';

const AmountModal: React.FC<AmountModalProps> = ({ 
  opened, 
  onClose, 
  onSubmit, 
  title, 
  actionLabel, 
}) => {
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = () => {
    const numericAmount = parseFloat(amount);
    
    // Validaciones
    if (amount.trim() === '') {
      setError("Por favor, introduce una cantidad.");
      return;
    }
    
    if (isNaN(numericAmount)) {
      setError("La cantidad debe ser un número válido.");
      return;
    }
    
    if (numericAmount < 0) {
      setError("La cantidad no puede ser negativa.");
      return;
    }
    
    setError(null);
    onSubmit(numericAmount);
    setAmount('');
  };

  const handleAmountChange = (value: string | number) => {
    // Convertir siempre a string para manejar consistentemente
    const stringValue = typeof value === 'number' ? value.toString() : value;
    setAmount(stringValue);
    
    // Limpiar error cuando el usuario empieza a escribir
    if (error) setError(null);
  };

  if (!opened) return null;

  return (
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <Box
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
        }}
      >
        <Title order={4} mb="md">{title}</Title>
        <Stack>
          <Text c="dimmed">Introduce la cantidad de efectivo que hay en caja en este momento.</Text>
          
          {/* NumberInput de Mantine con validación integrada */}
          <NumberInput
            value={amount}
            onChange={handleAmountChange}
            placeholder="0.00"
            size="lg"
            min={0}
            max={999999.99}
            decimalScale={2}
            allowNegative={false}
            error={error} // Esto mostrará el error debajo del campo en rojo
            withAsterisk
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit();
              }
            }}
            styles={{
              input: {
                fontSize: '18px',
                padding: '12px',
              }
            }}
          />
          
          <Group justify="flex-end" gap="xs">
            <Button 
              onClick={onClose} 
              variant="subtle"
              size="md"
            >
              Cancelar
            </Button>
            <Button onClick={handleSubmit} size="md">
              {actionLabel}
            </Button>
          </Group>
        </Stack>
      </Box>
    </Box>
  );
};

export default AmountModal;