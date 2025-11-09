// PaymentModal.tsx

import React, { useState, useEffect } from 'react';
import { 
    Modal, 
    Title, 
    Text, 
    Button, 
    Group, 
    Stack, 
    Box,
    Paper,
    Grid,
    ActionIcon,
} from '@mantine/core';
import { 
    IconX,
} from '@tabler/icons-react';
// import Keypad from './Keypad'; 

// Tipos de datos para el pago
interface Payment {
    method: 'Cash' | 'Card' | 'Customer Account';
    amount: number;
}

interface PaymentModalProps {
    opened: boolean;
    onClose: () => void;
    totalAmount: number;
    onPaymentComplete: (payments: Payment[]) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
    opened, 
    onClose, 
    totalAmount, 
    onPaymentComplete,
}) => {
    // Monto actual ingresado en el Keypad (Dinero Recibido)
    const [inputAmount, setInputAmount] = useState<string>('');
    
    // Convertir el input a un número para cálculos
    const receivedAmount = parseFloat(inputAmount) || 0;

    // Cálculos Derivados
    // NOTA: Como solo es efectivo, el pago es directamente el monto recibido
    const changeDue = Math.max(0, receivedAmount - totalAmount);
    const isPaymentSufficient = receivedAmount >= totalAmount;

    // CÁLCULO: Monto que falta por cubrir
    const remainingAmount = Math.max(0, totalAmount - receivedAmount);
    const remainingColor = remainingAmount > 0 ? 'red.7' : 'green.7';
    
    // Función para manejar la entrada del Keypad
    const handleKeypadInput = (value: string) => {
        if (value === 'DEL') {
            setInputAmount((current) => current.slice(0, -1) || '');
        } else if (value === 'C') { // Botón para limpiar (Clear)
            setInputAmount('');
        } else if (value === '.') {
            // Asegura que solo haya un punto decimal
            if (!inputAmount.includes('.')) {
                setInputAmount((current) => current + '.');
            }
        } else if (!isNaN(parseInt(value))) {
            // Limitar la longitud y evitar ceros iniciales
            if (inputAmount === '0') {
                setInputAmount(value);
            } else if (inputAmount.length < 10) { // Límite arbitrario para evitar desbordamiento
                setInputAmount((current) => current + value);
            }
        }
    };
    
    // Función para procesar el pago al presionar "Validar"
    const handleValidate = () => {
        if (!isPaymentSufficient) {
            alert('El monto introducido es insuficiente.');
            return;
        }

        // El pago registrado es el monto recibido
        const payment: Payment = {
            method: 'Cash',
            amount: receivedAmount,
        };

        // Llama a la función de completado de la venta con el pago de efectivo
        onPaymentComplete([payment]);
        
        // El cierre del modal se gestiona en POS.tsx a través de onPaymentComplete
    };
    
    // Resetear estados al abrir el modal
    useEffect(() => {
        if (opened) {
            setInputAmount('');
        }
    }, [opened]);

    // Botones del Keypad (Ajustados para el modo de pago)
    const keypadButtons = [
        ['7', '8', '9'],
        ['4', '5', '6'],
        ['1', '2', '3'],
        ['C', '0', '.'], // 'C' para Clear
    ];
    

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={<Title order={3}>Pago</Title>}
            size="lg"
            closeOnClickOutside={false}
            overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        >
            <Grid gutter="xl">
                {/* Columna Izquierda: Teclado Numérico */}
                <Grid.Col span={6}>
                    <Stack gap="md">
                        {/* Indicador de Monto Recibido */}
                        <Paper withBorder p="md" shadow="sm" radius="md" bg="blue.0">
                            <Text size="lg" fw={700} c="dimmed">Dinero Recibido:</Text>
                            <Text size="xl" fw={700} c="blue.7" style={{ fontFamily: 'monospace' }}>
                                ${receivedAmount.toFixed(2)}
                            </Text>
                        </Paper>

                        {/* Teclado Numérico */}
                        <Stack gap="xs">
                            {keypadButtons.map((row, index) => (
                                <Group key={index} grow gap="xs">
                                    {row.map((btn) => (
                                        <Button
                                            key={btn}
                                            variant='light'
                                            color={btn === 'C' ? 'red' : btn === '.' ? 'orange' : 'gray'}
                                            size="xl"
                                            onClick={() => handleKeypadInput(btn)}
                                            style={{ fontSize: '20px' }}
                                        >
                                            {btn === 'C' ? <IconX size="1.2rem" /> : btn}
                                        </Button>
                                    ))}
                                </Group>
                            ))}
                            <Group grow gap="xs">
                                <Button size="xl" color="red" onClick={() => handleKeypadInput('DEL')}>Borrar</Button>
                                <Button 
                                    size="xl" 
                                    color="green" 
                                    onClick={handleValidate}
                                    disabled={!isPaymentSufficient}
                                >
                                    Validar
                                </Button>
                            </Group>
                        </Stack>
                    </Stack>
                </Grid.Col>

                {/* Columna Derecha: Resumen de Pago */}
                <Grid.Col span={6}>
                    <Stack gap="md" h="100%">
                        
                        {/* TOTAL DE LA VENTA */}
                        <Paper withBorder p="xl" shadow="sm" radius="md" bg="red.1">
                            <Title order={2} ta="center" c="red.7">
                                ${totalAmount.toFixed(2)}
                            </Title>
                            <Text ta="center" size="sm" c="dimmed">Total de la Venta</Text>
                        </Paper>
                        
                        {/* DINERO RESTANTE */}
                        <Paper withBorder p="md" shadow="sm" radius="md" mt="auto">
                            <Group justify="space-between">
                                <Text fw={700}>Monto Pendiente:</Text>
                                <Text fw={700} size="xl" c={remainingColor}>
                                    ${remainingAmount.toFixed(2)}
                                </Text>
                            </Group>
                        </Paper>
                        
                        {/* CAMBIO A ENTREGAR (Cálculo en tiempo real) */}
                        <Paper withBorder p="xl" shadow="sm" radius="md" bg={isPaymentSufficient ? 'green.1' : 'gray.0'}>
                            <Text ta="center" size="sm" c="dimmed">CAMBIO</Text>
                            <Title order={2} ta="center" c={isPaymentSufficient ? 'green.7' : 'red.7'}>
                                ${changeDue.toFixed(2)}
                            </Title>
                        </Paper>
                    </Stack>
                </Grid.Col>
            </Grid>
        </Modal>
    );
};

export default PaymentModal;