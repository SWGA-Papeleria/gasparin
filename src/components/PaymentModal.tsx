// PaymentModal.tsx (CON TECLADO FÍSICO HABILITADO)

import React, { useState, useEffect, useCallback } from 'react';
import { 
    Modal, 
    Title, 
    Text, 
    Button, 
    Group, 
    Stack, 
    Paper,
    Grid,
    Badge,
    SegmentedControl,
} from '@mantine/core';
import { 
    IconX,
    IconCash,
    IconCreditCard,
    IconTransfer,
} from '@tabler/icons-react';

// IMPORTAR EL TIPO PAYMENT DEL HOOK - ASEGURARSE DE QUE LA RUTA ES CORRECTA
import type { Payment } from '../hooks/pos/useCheckout';

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
    
    // Tipo de pago seleccionado - USAR EL TIPO DEL HOOK
    const [paymentMethod, setPaymentMethod] = useState<Payment['method']>('Cash');
    
    // Convertir el input a un número para cálculos
    const receivedAmount = parseFloat(inputAmount) || 0;

    // Cálculos Derivados
    const changeDue = Math.max(0, receivedAmount - totalAmount);
    const isPaymentSufficient = paymentMethod === 'Cash' ? receivedAmount >= totalAmount : true;
    const isPaymentValid = paymentMethod === 'Cash' ? isPaymentSufficient : receivedAmount > 0;

    // CÁLCULO: Monto que falta por cubrir (solo para efectivo)
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

    // Función para manejar entrada del teclado físico
    const handlePhysicalKeyboard = useCallback((event: KeyboardEvent) => {
        // Solo procesar si el modal está abierto
        if (!opened) return;

        const { key } = event;
        
        // Prevenir comportamiento por defecto para las teclas que usamos
        if (
            /[0-9]/.test(key) || 
            key === '.' || 
            key === 'Backspace' || 
            key === 'Delete' || 
            key === 'Enter'
        ) {
            event.preventDefault();
        }

        // Manejar números
        if (/[0-9]/.test(key)) {
            handleKeypadInput(key);
        }
        // Manejar punto decimal
        else if (key === '.') {
            handleKeypadInput('.');
        }
        // Manejar borrado (Backspace y Delete)
        else if (key === 'Backspace' || key === 'Delete') {
            handleKeypadInput('DEL');
        }
        // Manejar Enter para validar
        else if (key === 'Enter' && isPaymentValid) {
            handleValidate();
        }
        // Manejar Escape para limpiar
        else if (key === 'Escape') {
            handleKeypadInput('C');
        }
    }, [opened, inputAmount, isPaymentValid, paymentMethod]);

    // Efecto para agregar y remover el event listener del teclado
    useEffect(() => {
        if (opened) {
            document.addEventListener('keydown', handlePhysicalKeyboard);
        } else {
            document.removeEventListener('keydown', handlePhysicalKeyboard);
        }

        return () => {
            document.removeEventListener('keydown', handlePhysicalKeyboard);
        };
    }, [opened, handlePhysicalKeyboard]);
    
    // Función para procesar el pago al presionar "Validar"
    const handleValidate = () => {
        if (!isPaymentValid) {
            if (paymentMethod === 'Cash') {
                alert('El monto introducido es insuficiente.');
            } else {
                alert('Por favor ingrese un monto válido.');
            }
            return;
        }

        // El pago registrado es el monto recibido (o el total para métodos electrónicos)
        const paymentAmount = paymentMethod === 'Cash' ? receivedAmount : totalAmount;
        
        const payment: Payment = {
            method: paymentMethod,
            amount: paymentAmount,
        };

        // Llama a la función de completado de la venta con el pago
        onPaymentComplete([payment]);
    };

    // Efecto para resetear el monto cuando cambia el método de pago
    useEffect(() => {
        if (paymentMethod === 'Card' || paymentMethod === 'Transfer') {
            setInputAmount(totalAmount.toFixed(2));
        } else {
            setInputAmount('');
        }
    }, [paymentMethod, totalAmount]);
    
    // Resetear estados al abrir el modal
    useEffect(() => {
        if (opened) {
            setPaymentMethod('Cash');
            setInputAmount('');
        }
    }, [opened]);

    // Botones del Keypad (Ajustados para el modo de pago)
    const keypadButtons = [
        ['7', '8', '9'],
        ['4', '5', '6'],
        ['1', '2', '3'],
        ['C', '0', '.'],
    ];

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={<Title order={3}>Procesar Pago</Title>}
            size="lg"
            closeOnClickOutside={false}
            overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
        >
            <Stack gap="lg">
                {/* SELECTOR DE MÉTODO DE PAGO */}
                <Paper withBorder p="md" radius="md">
                    <Text fw={600} mb="sm">Método de Pago</Text>
                    <SegmentedControl
                        value={paymentMethod}
                        onChange={(value) => setPaymentMethod(value as Payment['method'])}
                        data={[
                            {
                                value: 'Cash',
                                label: (
                                    <Group>
                                        <IconCash size="1rem" />
                                        <Text>Efectivo</Text>
                                    </Group>
                                ),
                            },
                            {
                                value: 'Card',
                                label: (
                                    <Group>
                                        <IconCreditCard size="1rem" />
                                        <Text>Tarjeta</Text>
                                    </Group>
                                ),
                            },
                            {
                                value: 'Transfer',
                                label: (
                                    <Group>
                                        <IconTransfer size="1rem" />
                                        <Text>Transferencia</Text>
                                    </Group>
                                ),
                            },
                        ]}
                        fullWidth
                    />
                </Paper>

                <Grid gutter="xl">
                    {/* Columna Izquierda: Teclado Numérico */}
                    <Grid.Col span={6}>
                        <Stack gap="md">
                            {/* Indicador de Monto */}
                            <Paper withBorder p="md" shadow="sm" radius="md" bg="blue.0">
                                <Text size="lg" fw={700} c="dimmed">
                                    {paymentMethod === 'Cash' ? 'Dinero Recibido:' : 'Monto a Pagar:'}
                                </Text>
                                <Text size="xl" fw={700} c="blue.7" style={{ fontFamily: 'monospace' }}>
                                    ${receivedAmount.toFixed(2)}
                                </Text>
                                {paymentMethod === 'Cash' && inputAmount && (
                                    <Text size="xs" c="blue.6" mt={4}>
                                        Presiona [Enter] para validar
                                    </Text>
                                )}
                            </Paper>

                            {/* Teclado Numérico (solo para efectivo) */}
                            {paymentMethod === 'Cash' && (
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
                                        <Button 
                                            size="xl" 
                                            color="red" 
                                            onClick={() => handleKeypadInput('DEL')}
                                        >
                                            Borrar
                                        </Button>
                                        <Button 
                                            size="xl" 
                                            color="green" 
                                            onClick={handleValidate}
                                            disabled={!isPaymentValid}
                                        >
                                            Validar
                                        </Button>
                                    </Group>
                                </Stack>
                            )}

                            {/* Botón de confirmar para métodos electrónicos */}
                            {(paymentMethod === 'Card' || paymentMethod === 'Transfer') && (
                                <Button 
                                    size="xl" 
                                    color="green" 
                                    onClick={handleValidate}
                                    fullWidth
                                    style={{ height: '60px', fontSize: '18px' }}
                                >
                                    Confirmar Pago
                                </Button>
                            )}
                        </Stack>
                    </Grid.Col>

                    {/* Columna Derecha: Resumen de Pago */}
                    <Grid.Col span={6}>
                        <Stack gap="md" h="100%">
                            
                            {/* TOTAL DE LA VENTA */}
                            <Paper withBorder p="xl" shadow="sm" radius="md" bg="green.1">
                                <Title order={2} ta="center" c="green.7">
                                    ${totalAmount.toFixed(2)}
                                </Title>
                                <Text ta="center" size="sm" c="dimmed">Total de la Venta</Text>
                            </Paper>
                            
                            {/* INFORMACIÓN ADICIONAL SEGÚN MÉTODO DE PAGO */}
                            {paymentMethod === 'Cash' ? (
                                <>
                                    {/* DINERO RESTANTE (solo efectivo) */}
                                    <Paper withBorder p="md" shadow="sm" radius="md">
                                        <Group justify="space-between">
                                            <Text fw={700}>Monto Pendiente:</Text>
                                            <Text fw={700} size="xl" c={remainingColor}>
                                                ${remainingAmount.toFixed(2)}
                                            </Text>
                                        </Group>
                                    </Paper>
                                    
                                    {/* CAMBIO A ENTREGAR (solo efectivo) */}
                                    <Paper withBorder p="xl" shadow="sm" radius="md" bg={isPaymentSufficient ? 'green.1' : 'gray.0'}>
                                        <Text ta="center" size="sm" c="dimmed">CAMBIO</Text>
                                        <Title order={2} ta="center" c={isPaymentSufficient ? 'green.7' : 'red.7'}>
                                            ${changeDue.toFixed(2)}
                                        </Title>
                                    </Paper>
                                </>
                            ) : (
                                /* INFORMACIÓN PARA MÉTODOS ELECTRÓNICOS */
                                <Paper withBorder p="xl" shadow="sm" radius="md" bg="blue.1">
                                    <Stack align="center" gap="xs">
                                        <Badge color="blue" size="lg" variant="filled">
                                            {paymentMethod === 'Card' ? 'Pago con Tarjeta' : 'Pago por Transferencia'}
                                        </Badge>
                                        <Text ta="center" size="sm" c="dimmed">
                                            El pago se procesará por el monto total de la venta
                                        </Text>
                                    </Stack>
                                </Paper>
                            )}
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Stack>
        </Modal>
    );
};

export default PaymentModal;