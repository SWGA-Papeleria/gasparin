// POS.tsx (VERSIÓN FINAL LIMPIA)
import { TextInput } from '@mantine/core';
import { useState, useRef, useEffect } from 'react';
import { 
    Title, 
    Text, 
    Button, 
    Paper, 
    Group, 
    Grid, 
    Stack, 
    Box, 
    ActionIcon, 
    Container,
    Tooltip,
    Table,
    NumberInput, 
    Modal,
} from '@mantine/core';

import { 
    IconDoorExit, 
    IconTrash, 
} from '@tabler/icons-react';

// Importar componentes
import PaymentModal from '../../components/PaymentModal'; 
import { ConfirmationScreen } from '../../components/ConfirmationScreen'; 

// Importar hooks
import { usePOSState } from '../../hooks/pos/usePOSState';
import { useCart } from '../../hooks/pos/useCart';
import { useSaleSession } from '../../hooks/pos/useSaleSession';
import { useCheckout } from '../../hooks/pos/useCheckout';
import { useProductSearch } from '../../hooks/pos/useProductSearch';

// Importar contexto de autenticación
import { useAuth } from '../../context/AuthContext';

// Importar tipos
import type { SaleItem } from '../../hooks/pos/useCart';
import type { Payment, CheckoutStage } from '../../hooks/pos/useCheckout';

// ------------------------------------------------------------
// DATOS DE PRUEBA
// ------------------------------------------------------------
const DUMMY_PRODUCTS = [
    { id: 1, name: 'Cuaderno Profesional', unitPrice: 35.50 },
    { id: 2, name: 'Lápiz Grafito HB', unitPrice: 5.00 },
    { id: 3, name: 'Caja de Colores (12)', unitPrice: 89.90 },
    { id: 4, name: 'Borrador Blanco', unitPrice: 3.50 },
    { id: 5, name: 'Tijeras Punta Roma', unitPrice: 15.00 },
    { id: 6, name: 'Pluma Negra', unitPrice: 8.00 },
    { id: 7, name: 'Block de Notas', unitPrice: 12.00 },
    { id: 8, name: 'Cinta Adhesiva', unitPrice: 10.50 },
    { id: 9, name: 'Goma de Borrar', unitPrice: 4.00 },
    { id: 10, name: 'Marcador Rojo', unitPrice: 6.50 },
    { id: 11, name: 'Sacapuntas Metal', unitPrice: 9.00 },
    { id: 12, name: 'Papel Bond (500)', unitPrice: 75.00 },
    { id: 13, name: 'Folder Manilla', unitPrice: 2.50 },
    { id: 14, name: 'Clips (Caja)', unitPrice: 11.00 },
    { id: 15, name: 'Correctores Líquido', unitPrice: 18.00 },
];

// ------------------------------------------------------------
// COMPONENTE MODAL REUTILIZABLE
// ------------------------------------------------------------
interface AmountModalProps {
    opened: boolean;
    onClose: () => void;
    onSubmit: (amount: number) => void;
    title: string;
    actionLabel: string;
}

const AmountModal: React.FC<AmountModalProps> = ({ 
    opened, 
    onClose, 
    onSubmit, 
    title, 
    actionLabel, 
}) => {
    const [amount, setAmount] = useState<string>('');
    
    const fixedDescription = "Introduce la cantidad de efectivo que hay en caja en este momento.";

    const handleSubmit = () => {
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount < 0) {
            alert("Por favor, introduce una cantidad válida.");
            return;
        }
        onSubmit(numericAmount);
        setAmount('');
    };

    if (!opened) return null;

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title={<Title order={4}>{title}</Title>}
            size="md"
            centered
        >
            <Stack>
                <Text c="dimmed">{fixedDescription}</Text>
                
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    style={{ padding: '10px', fontSize: '18px', border: '1px solid #ccc', borderRadius: '4px' }}
                    min="0"
                    autoFocus
                />
                
                <Group justify="flex-end" gap="xs">
                    <Button 
                        onClick={onClose} 
                        variant="subtle"
                        size="md"
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} size="md" color="blue">
                        {actionLabel}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
};

// ------------------------------------------------------------
// COMPONENTE PRINCIPAL POS
// ------------------------------------------------------------
export default function POS() {
    const posRef = useRef<HTMLDivElement>(null); 

    // Obtener usuario para identificar sesión
    const { user } = useAuth();
    const userId = user?.email || user?.name || 'anonymous';

    // USAR TODOS LOS HOOKS CON USER ID
    const {
        isSaleActive,
        currentSaleId,
        startNewSale,
        endSaleSession,
    } = usePOSState(userId);
    
    const {
        saleItems,
        saleTotal,
        addItemToSale,
        updateItemQuantity,
        removeItem,
        clearCart,
    } = useCart(userId);

    const {
        isInitialAmountModalOpen,
        isClosingAmountModalOpen,
        openInitialAmountModal,
        closeInitialAmountModal,
        openClosingAmountModal,
        closeClosingAmountModal,
        submitInitialAmount,
        submitClosingAmount,
        resetSession,
    } = useSaleSession();

    const {
        checkoutStage,
        payments,
        changeDue,
        startPayment,
        completePayment,
        startNewOrder,
        cancelPayment,
    } = useCheckout();

    const {
        searchTerm,
        filteredProducts,
        setSearchTerm,
    } = useProductSearch(DUMMY_PRODUCTS);

    // Efecto para manejar cambio de usuario
    useEffect(() => {
        console.log(`POS cargado para usuario: ${userId}`);
    }, [userId]);

    // ------------------------------------------------------------
    // MANEJADORES DE EVENTOS
    // ------------------------------------------------------------
    const handleStartNewSale = () => {
        openInitialAmountModal();
    };

    const handleInitialAmountSubmit = (amount: number) => {
        submitInitialAmount(amount);
        startNewSale();
        clearCart();
        startNewOrder();
    };
    
    const handleEndSaleSession = () => {
        openClosingAmountModal();
    };

    const handleClosingAmountSubmit = (amount: number) => {
        console.log(`Sesión de Venta ${currentSaleId} cerrada. Final: $${amount}.`);
        submitClosingAmount(amount);
        endSaleSession();
        resetSession();
    };

    const handleStartPayment = () => {
        startPayment(saleItems.length > 0);
    };

    const handlePaymentComplete = (paidPayments: Payment[]) => {
        completePayment(paidPayments, saleTotal);
    };

    const handleNewOrder = () => {
        startNewOrder();
        clearCart();
    };

    // ------------------------------------------------------------
    // RENDERIZADO CONDICIONAL DE ETAPAS
    // ------------------------------------------------------------

    // 1. VISTA INICIAL (Pantalla de "Iniciar caja") 
    if (!isSaleActive) {
        return (
            <Container size="xl"> 
                <Title order={1} mb="md">Punto de Venta (POS)</Title>
                <Paper withBorder p="xl" shadow="sm">
                    
                    <Group justify="space-between" align="flex-start" mb="xl">
                        <Stack>
                            <Text size="lg" fw={700}>
                                Terminal de Venta
                            </Text>
                            <Text c="dimmed">
                                Presiona "Iniciar Sesión de Venta" para comenzar a registrar ventas.
                            </Text>
                        </Stack>
                        
                        <Button 
                            onClick={handleStartNewSale} 
                            size="md" 
                        >
                            Iniciar Sesión de Venta
                        </Button>
                    </Group>
                </Paper>
                <AmountModal
                    opened={isInitialAmountModalOpen}
                    onClose={closeInitialAmountModal}
                    onSubmit={handleInitialAmountSubmit}
                    title="Apertura de caja"
                    actionLabel="Confirmar Apertura"
                />
            </Container>
        );
    }
    
    // 2. PANTALLA DE CONFIRMACIÓN
    if (checkoutStage === 'confirmation' && currentSaleId !== null) {
        return (
            <ConfirmationScreen 
                saleId={currentSaleId}
                saleItems={saleItems}
                payments={payments}
                changeDue={changeDue}
                totalAmount={saleTotal}
                onNewOrder={handleNewOrder}
            />
        );
    }

    // 3. VISTA DE TPV ACTIVO (LAYOUT PRINCIPAL)
    return (
        <Container size="xl">
            <Box 
                ref={posRef}
                style={{ 
                    position: 'relative', 
                    display: 'flex',
                    flexDirection: 'column'
                }}
            > 
                
                {/* CABECERA */}
                <Paper withBorder p="md" mb="md" shadow="xs" style={{ flexShrink: 0 }}>
                    <Group justify="space-between">
                        <Title order={3}>Sesión de Venta Activa #{currentSaleId}</Title>
                        <Group gap="xs">
                            <Tooltip label="Finalizar Sesión de Venta" position="bottom" withArrow>
                                <ActionIcon 
                                    size="lg" 
                                    variant="filled" 
                                    color="red" 
                                    onClick={handleEndSaleSession}
                                >
                                    <IconDoorExit size="1.2rem" />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    </Group>
                </Paper>

                {/* LAYOUT PRINCIPAL DE VENTA */}
                <Grid grow gutter="md" style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
                    
                    {/* LISTADO Y BÚSQUEDA DE PRODUCTOS */}
                    <Grid.Col span={8}>
                        <Paper 
                            withBorder 
                            p="md" 
                            shadow="xs" 
                            style={{ height: '400px', display: 'flex', flexDirection: 'column' }} 
                        >
                            <Title order={4} mb="md" style={{ flexShrink: 0 }}>Productos</Title>
                            <TextInput
                                placeholder="Buscar producto..."
                                mb="sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.currentTarget.value)}
                            />
                            <Box style={{ flexGrow: 1, overflowY: 'auto' }}>
                                <Table striped withColumnBorders withRowBorders>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>SKU</Table.Th>
                                            <Table.Th>Nombre</Table.Th>
                                            <Table.Th style={{ textAlign: 'right' }}>Precio Unitario</Table.Th>
                                            <Table.Th style={{ textAlign: 'center' }}>Acción</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {filteredProducts.map((product) => (
                                            <Table.Tr key={product.id}>
                                                <Table.Td>{product.id}</Table.Td>
                                                <Table.Td>{product.name}</Table.Td>
                                                <Table.Td style={{ textAlign: 'right' }}>${product.unitPrice.toFixed(2)}</Table.Td>
                                                <Table.Td style={{ textAlign: 'center' }}>
                                                    <Button 
                                                        size="xs" 
                                                        variant="light" 
                                                        onClick={() => addItemToSale(product)}
                                                    >
                                                        Agregar
                                                    </Button>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </Box>
                        </Paper>
                    </Grid.Col>

                    {/* DETALLE DE VENTA */}
                    <Grid.Col span={4}>
                        <Paper 
                            withBorder 
                            p="md" 
                            shadow="xs" 
                            style={{ height: '400px', display: 'flex', flexDirection: 'column' }} 
                        >
                            <Title order={4} mb="md" style={{ flexShrink: 0 }}>Detalle de Venta</Title>
                            
                            {/* LISTA DE ARTÍCULOS EN VENTA */}
                            <Box style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '15px' }}>
                                {saleItems.length === 0 ? (
                                    <Text c="dimmed">No hay artículos en la venta. Agrega un producto.</Text>
                                ) : (
                                    <Stack gap="xs">
                                        {saleItems.map((item) => (
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
                                                                onChange={(value) => updateItemQuantity(item.id, Number(value))}
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
                                                                onClick={() => removeItem(item.id)}
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

                            {/* TOTAL Y BOTÓN PAGAR */}
                            <Stack gap="xs" pt="sm" style={{ borderTop: '1px solid var(--mantine-color-gray-3)', flexShrink: 0 }}>
                                <Group justify="space-between">
                                    <Title order={4}>TOTAL:</Title>
                                    <Title order={3} c="green.7">${saleTotal.toFixed(2)}</Title>
                                </Group>
                                
                                <Button 
                                    size="lg" 
                                    color="green"
                                    onClick={handleStartPayment}
                                    disabled={saleItems.length === 0}
                                >
                                    Pagar
                                </Button>
                            </Stack>
                        </Paper>
                    </Grid.Col>
                </Grid>
                
                {/* MODALES */}
                <AmountModal
                    opened={isClosingAmountModalOpen}
                    onClose={closeClosingAmountModal}
                    onSubmit={handleClosingAmountSubmit}
                    title="Cierre de caja"
                    actionLabel="Cerrar caja"
                />
                
                <PaymentModal
                    opened={checkoutStage === 'payment'}
                    onClose={cancelPayment}
                    totalAmount={saleTotal}
                    onPaymentComplete={handlePaymentComplete}
                />
            </Box>
        </Container>
    );
}