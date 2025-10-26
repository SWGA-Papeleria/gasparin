// POS.tsx (VERSIÓN CON FUNCIONALIDAD DE BLOQUEO COMENTADA)
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
// COMENTADO: Desactiva el Keypad
// import Keypad from './Keypad'; 
import PaymentModal from '../../components/PaymentModal'; 
import { ConfirmationScreen } from '../../components/ConfirmationScreen'; 

// ------------------------------------------------------------
// DEFINICIÓN DE TIPOS DE DATOS (sin cambios)
// ------------------------------------------------------------
interface SaleItem {
    id: number;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

interface Payment {
    method: 'Cash' | 'Card' | 'Customer Account';
    amount: number;
}

type CheckoutStage = 'cart' | 'payment' | 'confirmation'; 


// Datos de prueba (sin cambios)
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


// Parámetros de configuración (sin cambios)
const POS_PIN = '1234'; 
const PIN_LENGTH = 4;

// CLAVES DE ALMACENAMIENTO (Temporal)
const STORAGE_KEYS = {
    SALE_ACTIVE: 'pos_sale_active',
    IS_LOCKED: 'pos_is_locked', // Mantenemos la clave, pero el efecto estará comentado
    SALE_ID: 'pos_current_sale_id',
};

// Función de inicialización simplificada y robusta (sin cambios)
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
// COMPONENTE MODAL REUTILIZABLE para Monto Inicial y Final (sin cambios)
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
    // COMENTADO: Estado de bloqueo
    /*const [isLocked, setIsLocked] = useState<boolean>(() => 
        getInitialState(STORAGE_KEYS.IS_LOCKED, false)
    );*/
    const [currentSaleId, setCurrentSaleId] = useState<number | null>(() => 
        getInitialState(STORAGE_KEYS.SALE_ID, null)
    );
    
    // ESTADOS PARA MODALES DE MONTO Y VALORES DE CAJA (sin cambios)
    const [isInitialAmountModalOpen, setIsInitialAmountModalOpen] = useState(false);
    const [isClosingAmountModalOpen, setIsClosingAmountModalOpen] = useState(false);
    const [initialCashAmount, setInitialCashAmount] = useState<number | null>(null);
    const [closingCashAmount, setClosingCashAmount] = useState<number | null>(null);

    // ESTADOS DE LA VENTA (sin cambios)
    const [saleItems, setSaleItems] = useState<SaleItem[]>([]); 
    const [checkoutStage, setCheckoutStage] = useState<CheckoutStage>('cart');
    const [payments, setPayments] = useState<Payment[]>([]); 
    const [changeDue, setChangeDue] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>(''); 

    // --- FILTRADO DE PRODUCTOS --- (sin cambios)
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

    // CALCULAR EL TOTAL DE LA VENTA (sin cambios)
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

    // COMENTADO: Persistencia del estado de bloqueo
    // useEffect(() => {
    //     localStorage.setItem(STORAGE_KEYS.IS_LOCKED, JSON.stringify(isLocked));
    // }, [isLocked]);

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
        // COMENTADO: Inicializa isLocked
        // setIsLocked(false);
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
        // COMENTADO: Remueve el estado de bloqueo
        // localStorage.removeItem(STORAGE_KEYS.IS_LOCKED);
        localStorage.removeItem(STORAGE_KEYS.SALE_ID);
        
        setCurrentSaleId(null);
        setInitialCashAmount(null);
        setClosingCashAmount(null);
        setIsSaleActive(false);
        // COMENTADO: Desbloquea al cerrar sesión
        // setIsLocked(false);
        setCheckoutStage('cart'); 
    };

    // COMENTADO: Función para manejar el PIN (desbloqueo)
    const handlePinSubmit = (pin: string) => {
        if (pin === POS_PIN) {
            // setIsLocked(false);
        } else {
            alert('PIN incorrecto. Inténtalo de nuevo.');
        }
    };
    
    // ------------------------------------------------------------
    // Lógica del Carrito (Detalle de Venta) (sin cambios)
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
    // Lógica del Flujo de Pago (sin cambios)
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

    // 1. VISTA INICIAL (Pantalla de "Iniciar caja") (sin cambios)
    if (!isSaleActive) {
        return (
            <Container size="md"> 
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
                            onClick={startNewSale} 
                            size="md" 
                            color="cyan.5" 
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
    
    // 2. PANTALLA DE CONFIRMACIÓN (sin cambios)
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
        // Contenedor principal para manejar la altura total de la vista
        <Box 
            ref={posRef}
            style={{ 
                position: 'relative', 
                padding: '20px',
                display: 'flex',
                flexDirection: 'column'
            }}
        > 
            
            {/* CABECERA (Fixed height) */}
            <Paper withBorder p="md" mb="md" shadow="xs" style={{ flexShrink: 0 }}>
                <Group justify="space-between">
                    <Title order={3}>Sesión de Venta Activa #{currentSaleId}</Title>
                    <Group gap="xs">
                        {/* COMENTADO: Botón de Bloqueo */}
                        {/* <Tooltip label="Bloquear (Requiere PIN)" position="bottom" withArrow>
                            <ActionIcon 
                                size="lg" 
                                variant="filled" 
                                color="orange" 
                                onClick={() => setIsLocked(true)}
                            >
                                <IconLock size="1.2rem" />
                            </ActionIcon>
                        </Tooltip> */}

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

            {/* LAYOUT PRINCIPAL DE VENTA (Contenido con altura flexible) (sin cambios) */}
            <Grid grow gutter="md" style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
                
                {/* 3.1. LISTADO Y BÚSQUEDA DE PRODUCTOS (Tabla con Scroll) (sin cambios) */}
                <Grid.Col span={8} >
                    <Paper 
                        withBorder 
                        p="md" 
                        shadow="xs" 
                        style={{ height: '400px', display: 'flex', flexDirection: 'column' }} 
                    >
                        <Title order={4} mb="md" style={{ flexShrink: 0 }}>Productos    </Title>
                        <TextInput
                            placeholder="Buscar producto..."
                            mb="sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.currentTarget.value)}
                        />
                        {/* Contenedor de la Tabla con Scroll (Toma la altura restante) */}
                        <Box style={{ flexGrow: 1, overflowY: 'auto' }}>
                            <Table striped withColumnBorders withRowBorders>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>ID</Table.Th>
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

                {/* 3.2. DETALLE DE VENTA (Carrito con Scroll Interno y Footer Fijo) (sin cambios) */}
                <Grid.Col span={4}>
                    <Paper 
                        withBorder 
                        p="md" 
                        shadow="xs" 
                        style={{ height: '400px', display: 'flex', flexDirection: 'column' }} // Habilitar Flexbox
                    >
                        <Title order={4} mb="md" style={{ flexShrink: 0 }}>Detalle de Venta</Title>
                        
                        {/* LISTA DE ARTÍCULOS EN VENTA (SCROLLABLE) */}
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

                        {/* TOTAL Y BOTÓN PAGAR (FIXED FOOTER - NO SCROLL) */}
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
            
            {/* COMENTADO: OVERLAY DE BLOQUEO (Keypad) */}
            {/* {isLocked && (
                <Box
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        zIndex: 100,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: '#ffffff',
                    }} 
                >
                    <Keypad 
                        onPinSubmit={handlePinSubmit}
                        message="Ingresa tu PIN para desbloquear el Punto de Venta."
                        pinLength={PIN_LENGTH}
                    />
                </Box>
            )} */}
            
            {/* MODAL DE CIERRE DE CAJA (Mantenido) */}
            <AmountModal
                opened={isClosingAmountModalOpen}
                onClose={() => setIsClosingAmountModalOpen(false)}
                onSubmit={handleClosingAmountSubmit}
                title="Cierre de caja"
                actionLabel="Cerrar caja"
            />
            
            {/* MODAL DE PAGO (Mantenido) */}
            <PaymentModal
                opened={checkoutStage === 'payment'}
                onClose={() => setCheckoutStage('cart')} 
                totalAmount={saleTotal}
                onPaymentComplete={handlePaymentComplete}
            />

        </Box>
    );
}