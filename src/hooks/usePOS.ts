// src/hooks/usePOS.ts
import { useState, useEffect, useMemo } from 'react';
import { productService, saleService, cashRegisterService } from '../services/pos.service';
import type { Product, SaleItem, Payment, CheckoutStage } from '../types/pos.types';

// Datos de prueba
const DUMMY_PRODUCTS: Product[] = [
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

// Claves de almacenamiento
const STORAGE_KEYS = {
  SALE_ACTIVE: 'pos_sale_active',
  SALE_ID: 'pos_current_sale_id',
};

// Utilidad para localStorage
const getStoredValue = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const usePOS = () => {
  // Estados de sesión
  const [isSaleActive, setIsSaleActive] = useState<boolean>(
    () => getStoredValue(STORAGE_KEYS.SALE_ACTIVE, false)
  );
  const [currentSaleId, setCurrentSaleId] = useState<number | null>(
    () => getStoredValue(STORAGE_KEYS.SALE_ID, null)
  );
  
  // Estados de la venta
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [checkoutStage, setCheckoutStage] = useState<CheckoutStage>('cart');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [changeDue, setChangeDue] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Nuevos estados para búsqueda con botón
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(DUMMY_PRODUCTS);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  
  // Estados de caja
  const [initialCashAmount, setInitialCashAmount] = useState<number | null>(null);
  const [isInitialModalOpen, setIsInitialModalOpen] = useState(false);
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);

  // Persistencia
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

  // Función para realizar búsqueda de productos - MODIFICADA
  const handleSearchProducts = async () => {
    // Permitir búsqueda incluso con campo vacío
    setIsSearching(true);
    
    // Simular delay para mostrar el loader
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const trimmedSearch = searchTerm.trim();
    
    if (!trimmedSearch) {
      // Si está vacío, mostrar todos los productos
      setFilteredProducts(DUMMY_PRODUCTS);
      setIsSearching(false);
      return;
    }

    const normalizedSearch = trimmedSearch
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const filtered = DUMMY_PRODUCTS.filter(p => {
      const normalizedName = p.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return normalizedName.includes(normalizedSearch);
    });
    
    setFilteredProducts(filtered);
    setIsSearching(false);
  };

  // Cálculo del total
  const saleTotal = useMemo(() => 
    saleItems.reduce((acc, item) => acc + item.subtotal, 0),
    [saleItems]
  );

  // Manejo de sesión
  const startNewSale = () => setIsInitialModalOpen(true);

  const handleInitialAmountSubmit = (amount: number) => {
    setInitialCashAmount(amount);
    setIsInitialModalOpen(false);

    if (currentSaleId === null) {
      setCurrentSaleId(Math.floor(Date.now() / 1000));
    }
    setIsSaleActive(true);
    setCheckoutStage('cart');
    setSaleItems([]);
    setPayments([]);
  };

  const endSaleSession = () => setIsClosingModalOpen(true);

  const handleClosingAmountSubmit = (amount: number) => {
    setIsClosingModalOpen(false);
    console.log(`Sesión ${currentSaleId} cerrada. Inicial: $${initialCashAmount}. Final: $${amount}.`);

    localStorage.removeItem(STORAGE_KEYS.SALE_ACTIVE);
    localStorage.removeItem(STORAGE_KEYS.SALE_ID);
    
    setCurrentSaleId(null);
    setInitialCashAmount(null);
    setIsSaleActive(false);
    setCheckoutStage('cart');
  };

  // Manejo del carrito
  const addItemToSale = (product: Product, quantity: number = 1) => {
    const existingItemIndex = saleItems.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
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

  // Flujo de pago
  const handleStartPayment = () => {
    if (saleItems.length === 0) {
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

  return {
    // Estados
    isSaleActive,
    currentSaleId,
    saleItems,
    checkoutStage,
    payments,
    changeDue,
    searchTerm,
    filteredProducts,
    saleTotal,
    initialCashAmount,
    isInitialModalOpen,
    isClosingModalOpen,
    isSearching,
    
    // Setters
    setSearchTerm,
    setIsInitialModalOpen,
    setIsClosingModalOpen,
    
    // Funciones
    startNewSale,
    handleInitialAmountSubmit,
    endSaleSession,
    handleClosingAmountSubmit,
    addItemToSale,
    updateItemQuantity,
    removeItem,
    handleStartPayment,
    handlePaymentComplete,
    handleNewOrder,
    handleSearchProducts,
  };
};