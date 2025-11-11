// POS.tsx (VERSIÓN CON MISMOS MÁRGENES QUE ATTRIBUTES)
import { TextInput } from '@mantine/core';
import { useState, useEffect, useRef, useMemo } from 'react';
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
} from '@mantine/core';

import { 
    IconLock, 
    IconDoorExit, 
    IconCheck, 
    IconTrash, 
} from '@tabler/icons-react';

// Importar componentes
import PaymentModal from '../../components/PaymentModal'; 
import { ConfirmationScreen } from '../../components/ConfirmationScreen'; 

// ------------------------------------------------------------
// DEFINICIÓN DE TIPOS DE DATOS
// ------------------------------------------------------------
interface SaleItem {
    id: number;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

interface Payment {
    method: 'Cash' | 'Card' | 'Transfer';
    amount: number;
}

type CheckoutStage = 'cart' | 'payment' | 'confirmation'; 

// Datos de prueba actualizados con nombres que incluyen atributos
const DUMMY_PRODUCTS = [
    { id: 1, name: 'Bolígrafo BIC Azul', unitPrice: 5.50 },
    { id: 2, name: 'Cuaderno Profesional Rayas', unitPrice: 35.50 },
    { id: 3, name: 'Lápiz Grafito HB Paquete 12', unitPrice: 15.00 },
    { id: 4, name: 'Caja de Colores 12 Unidades', unitPrice: 89.90 },
    { id: 5, name: 'Borrador Blanco Premium', unitPrice: 3.50 },
    { id: 6, name: 'Tijeras Punta Roma Metal', unitPrice: 15.00 },
    { id: 7, name: 'Pluma Negra Tinta Permanente', unitPrice: 8.00 },
    { id: 8, name: 'Block de Notas 100 Hojas', unitPrice: 12.00 },
    { id: 9, name: 'Cinta Adhesiva Transparente', unitPrice: 10.50 },
    { id: 10, name: 'Goma de Borrar Suave', unitPrice: 4.00 },
    { id: 11, name: 'Marcador Rojo Punto Fino', unitPrice: 6.50 },
    { id: 12, name: 'Sacapuntas Metal Doble', unitPrice: 9.00 },
    { id: 13, name: 'Papel Bond A4 500 Hojas', unitPrice: 75.00 },
    { id: 14, name: 'Folder Manilla Tamaño Carta', unitPrice: 2.50 },
    { id: 15, name: 'Clips Metálicos Caja 100', unitPrice: 11.00 },
];

const POS_PIN = '1234'; 
const PIN_LENGTH = 4;

const STORAGE_KEYS = {
    SALE_ACTIVE: 'pos_sale_active',
    IS_LOCKED: 'pos_is_locked', 
    SALE_ID: 'pos_current_sale_id',
};

const getInitialState = (key: string, defaultValue: any): any => {
    try {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
        console.error("Error al leer localStorage:", error);
        return defaultValue;
    }
};

// ------------------------------------------------------------
// COMPONENTE MODAL REUTILIZABLE para Monto Inicial y Final 
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
                        >
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmit} size="lg" color="green">
                            {actionLabel}
                        </Button>
                    </Group>
                </Stack>
            </Box>
        </Box>
    );
};

// ------------------------------------------------------------
// COMPONENTE PRINCIPAL POS 
// ------------------------------------------------------------
export default function POS() {
    const posRef = useRef<HTMLDivElement>(null); 

    // INICIALIZACIÓN DE ESTADOS CON PERSISTENCIA
    const [isSaleActive, setIsSaleActive] = useState<boolean>(() => 
        getInitialState(STORAGE_KEYS.SALE_ACTIVE, false)
    );
    const [currentSaleId, setCurrentSaleId] = useState<number | null>(() => 
        getInitialState(STORAGE_KEYS.SALE_ID, null)
    );
    
    // ESTADOS PARA MODALES DE MONTO Y VALORES DE CAJA 
    const [isInitialAmountModalOpen, setIsInitialAmountModalOpen] = useState(false);
    const [isClosingAmountModalOpen, setIsClosingAmountModalOpen] = useState(false);
    const [initialCashAmount, setInitialCashAmount] = useState<number | null>(null);
    const [closingCashAmount, setClosingCashAmount] = useState<number | null>(null);

    // ESTADOS DE LA VENTA 
    const [saleItems, setSaleItems] = useState<SaleItem[]>([]); 
    const [checkoutStage, setCheckoutStage] = useState<CheckoutStage>('cart');
    const [payments, setPayments] = useState<Payment[]>([]); 
    const [changeDue, setChangeDue] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>(''); 

    // --- FILTRADO DE PRODUCTOS --- 
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return DUMMY_PRODUCTS;

        // Normaliza y quita acentos de la búsqueda
        const normalizedSearch = searchTerm
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ''); 

        return DUMMY_PRODUCTS.filter(p => {
            const normalizedName = p.name
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, ''); 
            return normalizedName.includes(normalizedSearch);
        });
    }, [searchTerm]);

    // CALCULAR EL TOTAL DE LA VENTA 
    const saleTotal = useMemo(() => 
        saleItems.reduce((acc, item) => acc + item.subtotal, 0),
        [saleItems]
    );

    // ------------------------------------------------------------
    // EFECTOS (Persistencia de Estado)
    // ------------------------------------------------------------
    
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.SALE_ACTIVE, JSON.stringify(isSaleActive));
    }, [isSaleActive]);

    useEffect(() => {
        if (currentSaleId !== null) {
            localStorage.setItem(STORAGE_KEYS.SALE_ID, JSON.stringify(currentSaleId));
        } else {
            localStorage.removeItem(STORAGE_KEYS.SALE_ID);
        }
    }, [currentSaleId]);

    // ------------------------------------------------------------
    // Lógica del Estado y Modales
    // ------------------------------------------------------------

    const startNewSale = () => {
        setIsInitialAmountModalOpen(true);
    };

    const handleInitialAmountSubmit = (amount: number) => {
        setInitialCashAmount(amount); 
        setIsInitialAmountModalOpen(false); 

        if (currentSaleId === null) {
            setCurrentSaleId(Math.floor(Date.now() / 1000)); 
        }
        setIsSaleActive(true);
        setCheckoutStage('cart'); 
        setSaleItems([]); 
        setPayments([]); 
    };
    
    const endSaleSession = () => {
        setIsClosingAmountModalOpen(true);
    };

    const handleClosingAmountSubmit = (amount: number) => {
        setClosingCashAmount(amount); 
        setIsClosingAmountModalOpen(false); 

        console.log(`Sesión de Venta ${currentSaleId} cerrada. Inicial: $${initialCashAmount}. Final: $${amount}.`);

        localStorage.removeItem(STORAGE_KEYS.SALE_ACTIVE);
        localStorage.removeItem(STORAGE_KEYS.SALE_ID);
        
        setCurrentSaleId(null);
        setInitialCashAmount(null);
        setClosingCashAmount(null);
        setIsSaleActive(false);
        setCheckoutStage('cart'); 
    };

    // ------------------------------------------------------------
    // Lógica del Carrito (Detalle de Venta)
    // ------------------------------------------------------------

    const addItemToSale = (product: typeof DUMMY_PRODUCTS[0], quantity: number = 1) => {
        const existingItemIndex = saleItems.findIndex(item => item.id === product.id);

        if (existingItemIndex > -1) {
            // Si ya existe, actualiza la cantidad
            setSaleItems(current => current.map((item, index) => {
                if (index === existingItemIndex) {
                    const newQuantity = item.quantity + quantity;
                    return {
                        ...item,
                        quantity: newQuantity,
                        subtotal: newQuantity * item.unitPrice,
                    };
                }
                return item;
            }));
        } else {
            // Si no existe, agrégalo
            setSaleItems(current => [
                ...current,
                {
                    id: product.id,
                    name: product.name,
                    quantity: quantity,
                    unitPrice: product.unitPrice,
                    subtotal: quantity * product.unitPrice,
                }
            ]);
        }
    };
    
    const updateItemQuantity = (id: number, newQuantity: number) => {
        setSaleItems(current => current.map(item => {
            if (item.id === id) {
                const updatedQuantity = Math.max(1, newQuantity); 
                return {
                    ...item,
                    quantity: updatedQuantity,
                    subtotal: updatedQuantity * item.unitPrice,
                };
            }
            return item;
        }).filter(item => item.quantity > 0)); 
    };

    const removeItem = (id: number) => {
        setSaleItems(current => current.filter(item => item.id !== id));
    };

    // ------------------------------------------------------------
    // Lógica del Flujo de Pago 
    // ------------------------------------------------------------
    
    const handleStartPayment = () => {
        if (saleItems.length === 0) {
            alert('Agrega al menos un artículo para pagar.');
            return;
        }
        setCheckoutStage('payment');
    };

    const handlePaymentComplete = (paidPayments: Payment[]) => {
        const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
        const calculatedChange = totalPaid - saleTotal;

        setPayments(paidPayments);
        setChangeDue(calculatedChange);
        setCheckoutStage('confirmation');
    };

    const handleNewOrder = () => {
        setSaleItems([]);
        setPayments([]);
        setChangeDue(0);
        setCheckoutStage('cart');
    };

    // ------------------------------------------------------------
    // RENDERIZADO CONDICIONAL DE ETAPAS
    // ------------------------------------------------------------

    // 1. VISTA INICIAL (Pantalla de "Iniciar caja") 
    if (!isSaleActive) {
        return (
            <Container size="xl"> {/* Mismo Container que Attributes */}
                {/* CABECERA CON ESTILO DE ATTRIBUTES */}
                <Paper withBorder p="md" mb="md" shadow="xs" style={{ flexShrink: 0 }}>
                    <Group justify="space-between">
                        <div>
                            <Title order={3}>Punto de Venta (POS)</Title>
                            <Text c="dimmed" size="sm">Terminal de venta para registro de transacciones</Text>
                        </div>
                    </Group>
                </Paper>

                {/* CONTENIDO PRINCIPAL - TAMAÑO ORIGINAL */}
                <Paper withBorder p="xl" shadow="sm">
                    <Group justify="space-between" align="flex-start">
                        <Stack>
                            <Text size="lg" fw={700}>
                                Terminal de Venta
                            </Text>
                            <Text c="dimmed">
                                Presiona "Iniciar Sesión de Venta" para comenzar a registrar ventas.
                            </Text>
                        </Stack>
                        
                        <Button 
                            onClick={startNewSale} 
                            size="md" 
                        >
                            Iniciar Sesión de Venta
                        </Button>
                    </Group>
                </Paper>

                <AmountModal
                    opened={isInitialAmountModalOpen}
                    onClose={() => setIsInitialAmountModalOpen(false)}
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
        <Container size="xl"> {/* Mismo Container que Attributes */}
            <Box 
                ref={posRef}
                style={{ 
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
                                    onClick={endSaleSession}
                                >
                                    <IconDoorExit size="1.2rem" />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    </Group>
                </Paper>

                {/* LAYOUT PRINCIPAL DE VENTA */}
                <Grid gutter="md" style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
                    
                    {/* LISTADO Y BÚSQUEDA DE PRODUCTOS */}
                    <Grid.Col span={8}>
                        <Paper 
                            withBorder 
                            p="md" 
                            shadow="xs" 
                            style={{ height: '400px', display: 'flex', flexDirection: 'column' }} 
                        >
                            {/* CABECERA CON ESTILO DE ATTRIBUTES */}
                            <Group justify="space-between" mb="md" style={{ flexShrink: 0 }}>
                                <div>
                                    <Title order={4}>Productos Disponibles</Title>
                                </div>
                            </Group>

                            <TextInput
                                placeholder="Buscar producto por nombre, SKU o atributos..."
                                mb="sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.currentTarget.value)}
                            />
                            
                            {/* CONTENEDOR DE TABLA CON SCROLL */}
                            <Box style={{ flexGrow: 1, overflowY: 'auto' }}>
                                <Table striped withColumnBorders withRowBorders>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>SKU</Table.Th>
                                            <Table.Th>Nombre</Table.Th>
                                            <Table.Th style={{ textAlign: 'right' }}>Precio Unitario</Table.Th>
                                            <Table.Th style={{ textAlign: 'right' }}>Stock</Table.Th>
                                            <Table.Th style={{ textAlign: 'center' }}>Acción</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {filteredProducts.map((product) => (
                                            <Table.Tr key={product.id}>
                                                <Table.Td>SKU-{product.id.toString().padStart(4, '0')}</Table.Td>
                                                <Table.Td>{product.name}</Table.Td>
                                                <Table.Td style={{ textAlign: 'right' }}>${product.unitPrice.toFixed(2)}</Table.Td>
                                                <Table.Td style={{ textAlign: 'right' }}>
                                                    {Math.floor(Math.random() * 50) + 10}
                                                </Table.Td>
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

                    {/* DETALLE DE VENTA (CARRITO) */}
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
                
                {/* MODAL DE CIERRE DE CAJA */}
                <AmountModal
                    opened={isClosingAmountModalOpen}
                    onClose={() => setIsClosingAmountModalOpen(false)}
                    onSubmit={handleClosingAmountSubmit}
                    title="Cierre de caja"
                    actionLabel="Cerrar caja"
                />
                
                {/* MODAL DE PAGO */}
                <PaymentModal
                    opened={checkoutStage === 'payment'}
                    onClose={() => setCheckoutStage('cart')} 
                    totalAmount={saleTotal}
                    onPaymentComplete={handlePaymentComplete}
                />
            </Box>
        </Container>
    );
}