// ConfirmationScreen.tsx

import React from 'react'; // Aseguramos la importación de React
import { 
    Title, 
    Text, 
    Button, 
    Paper, 
    Group, 
    Stack, 
    Box, 
    Container,
    Divider,
    Grid
} from '@mantine/core';

import { 
    IconCheck, 
    IconPrinter, 
    IconShoppingCart, 
} from '@tabler/icons-react';

// Interfaces (Mantenidas del componente POS.tsx)
interface SaleItem {
    id: number;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

interface Payment {
    amount: number;
}

interface ConfirmationScreenProps {
    saleId: number;
    saleItems: SaleItem[];
    payments: Payment[];
    changeDue: number;
    totalAmount: number;
    onNewOrder: () => void;
}

// **CAMBIO CLAVE: Usamos export const en lugar de export default**
export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
    saleId,
    saleItems,
    payments,
    changeDue,
    totalAmount,
    onNewOrder,
}) => {
    
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    return (
        <Container 
            size="xl" 
            style={{ 
                paddingTop: '20px', 
                height: 'calc(100vh - 80px)', 
                display: 'flex', 
                flexDirection: 'column' 
            }}
        >
            <Grid gutter="xl" style={{ flexGrow: 1 }}>
                {/* Columna Izquierda: Acciones y Confirmación */}
                <Grid.Col span={6}>
                    <Stack gap="lg" style={{ height: '100%' }}>
                        
                        <Paper 
                            p="xl" 
                            shadow="md" 
                            radius="md" 
                            bg="green.1" 
                            style={{ textAlign: 'center' }}
                        >
                            <IconCheck size={48} style={{ color: 'var(--mantine-color-green-7)' }} />
                            <Title order={2} c="green.7">
                                Venta Exitosa
                            </Title>
                            <Text size="xl" fw={700} c="green.7" >
                                ${totalAmount.toFixed(2)}
                            </Text>
                        </Paper>
                        
                        {/* Botones de Acción */}
                        <Group grow mt="xl"> 
                            <Button 
                                leftSection={<IconPrinter size="1.2rem" />}
                                size="lg" 
                                variant="default"
                            >
                                Imprimir Recibo
                            </Button>

                            <Button 
                                leftSection={<IconShoppingCart size="1.2rem" />} 
                                size="lg" 
                                color="cyan.7" 
                                onClick={onNewOrder}
                            >
                                Nueva Venta
                            </Button>
                        </Group>
                        
                    </Stack>
                </Grid.Col>

                {/* Columna Derecha: Vista Previa del Recibo (Ticket) */}
                <Grid.Col 
                    span={6}
                    style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'flex-start'
                    }}
                >
                    <Paper 
                        withBorder 
                        p="md" 
                        shadow="lg" 
                        radius="md" 
                        style={{ 
                            width: '100%',
                            maxWidth: '320px', 
                            height: 'calc(100vh - 120px)', 
                            overflowY: 'auto', 
                        }}
                    >
                        <Stack gap="xs">
                            <Title order={4} ta="center">Papelería Gasparín</Title>
                            <Text size="xs" ta="center" c="dimmed">
                                Venta #{saleId} - Empleado: Usuario POS
                            </Text>
                            
                            <Divider my="sm" />

                            {/* Detalle de Artículos */}
                            {saleItems.map((item) => (
                                <Group key={item.id} justify="space-between">
                                    <Box style={{ flexShrink: 1, minWidth: 0 }}>
                                        <Text size="sm" fw={500} style={{ whiteSpace: 'normal' }}>{item.name}</Text>
                                        <Text size="xs" c="dimmed">
                                            {item.quantity.toFixed(0)} x ${item.unitPrice.toFixed(2)}
                                        </Text>
                                    </Box>
                                    <Text size="sm" fw={500} style={{ flexShrink: 0 }}>${item.subtotal.toFixed(2)}</Text>
                                </Group>
                            ))}
                            
                            <Divider my="sm" />

                            {/* Totales */}
                            <Group justify="space-between">
                                <Text fw={700}>TOTAL:</Text>
                                <Text fw={700} size="lg">${totalAmount.toFixed(2)}</Text>
                            </Group>

                            <Divider my="sm" />

                            {/* Pagos y Cambio */}
                            <Stack gap={2}>
                                <Group justify="space-between">
                                    <Text size="sm" fw={700} c="dimmed">Efectivo:</Text>
                                    <Text size="sm" fw={700} c="dimmed">${payments[0]?.amount.toFixed(2) || "0.00"}</Text>
                                </Group>

                                <Group justify="space-between" mt="xs">
                                    <Text fw={700} c="black">CAMBIO:</Text>
                                    <Text fw={700} size="lg" c="black">${changeDue.toFixed(2)}</Text>
                                </Group>
                            </Stack>
                            
                            <Text size="xs" ta="center" c="dimmed" mt="xl">
                                ¡Gracias por su compra!
                            </Text>
                        </Stack>
                    </Paper>
                </Grid.Col>
            </Grid>
        </Container>
    );
};
