// src/services/pos.service.ts - Todos los servicios del módulo POS en un solo archivo
import type { Product, SaleItem, Payment } from '../types/pos.types';

// =============================================
// TIPOS ESPECÍFICOS DEL SERVICIO
// =============================================

export interface CreateSaleDto {
  items: SaleItem[];
  payments: Payment[];
  customerId?: number;
  customerName?: string;
  tax?: number;
  discount?: number;
  notes?: string;
}

export interface Sale {
  id: number;
  invoiceNumber: string;
  items: SaleItem[];
  payments: Payment[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  changeDue: number;
  customerName?: string;
  createdAt: string;
  status: 'completed' | 'pending' | 'cancelled';
}

// =============================================
// MOCK DATA (Temporal - reemplazar con API real)
// =============================================

const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Bolígrafo BIC Azul', unitPrice: 5.50, stock: 45, sku: 'SKU-0001', barcode: '123456789012' },
  { id: 2, name: 'Cuaderno Profesional Rayas', unitPrice: 35.50, stock: 32, sku: 'SKU-0002', barcode: '123456789013' },
  { id: 3, name: 'Lápiz Grafito HB Paquete 12', unitPrice: 15.00, stock: 28, sku: 'SKU-0003', barcode: '123456789014' },
  { id: 4, name: 'Caja de Colores 12 Unidades', unitPrice: 89.90, stock: 15, sku: 'SKU-0004', barcode: '123456789015' },
  { id: 5, name: 'Borrador Blanco Premium', unitPrice: 3.50, stock: 67, sku: 'SKU-0005', barcode: '123456789016' },
  { id: 6, name: 'Tijeras Punta Roma Metal', unitPrice: 15.00, stock: 23, sku: 'SKU-0006', barcode: '123456789017' },
  { id: 7, name: 'Pluma Negra Tinta Permanente', unitPrice: 8.00, stock: 38, sku: 'SKU-0007', barcode: '123456789018' },
  { id: 8, name: 'Block de Notas 100 Hojas', unitPrice: 12.00, stock: 42, sku: 'SKU-0008', barcode: '123456789019' },
  { id: 9, name: 'Cinta Adhesiva Transparente', unitPrice: 10.50, stock: 56, sku: 'SKU-0009', barcode: '123456789020' },
  { id: 10, name: 'Goma de Borrar Suave', unitPrice: 4.00, stock: 89, sku: 'SKU-0010', barcode: '123456789021' },
  { id: 11, name: 'Marcador Rojo Punto Fino', unitPrice: 6.50, stock: 34, sku: 'SKU-0011', barcode: '123456789022' },
  { id: 12, name: 'Sacapuntas Metal Doble', unitPrice: 9.00, stock: 41, sku: 'SKU-0012', barcode: '123456789023' },
  { id: 13, name: 'Papel Bond A4 500 Hojas', unitPrice: 75.00, stock: 18, sku: 'SKU-0013', barcode: '123456789024' },
  { id: 14, name: 'Folder Manilla Tamaño Carta', unitPrice: 2.50, stock: 92, sku: 'SKU-0014', barcode: '123456789025' },
  { id: 15, name: 'Clips Metálicos Caja 100', unitPrice: 11.00, stock: 37, sku: 'SKU-0015', barcode: '123456789026' },
];

let mockSaleId = 1000;
const mockSales: Sale[] = [];

// =============================================
// FUNCIONES DE SIMULACIÓN DE API (Temporal)
// =============================================

const simulateApiDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// =============================================
// SERVICIOS DE PRODUCTOS
// =============================================

export const productService = {
  /**
   * Obtener productos para POS con filtro de búsqueda
   */
  getProductsForPOS: async (searchTerm?: string): Promise<Product[]> => {
    await simulateApiDelay(200);
    
    if (!searchTerm) {
      return MOCK_PRODUCTS;
    }
    
    const normalizedSearch = searchTerm.toLowerCase();
    return MOCK_PRODUCTS.filter(product => 
      product.name.toLowerCase().includes(normalizedSearch) ||
      (product.sku?.toLowerCase().includes(normalizedSearch) ?? false) ||
      (product.barcode && product.barcode.includes(normalizedSearch))
    );
  },

  /**
   * Buscar producto por código de barras
   */
  getProductByBarcode: async (barcode: string): Promise<Product | null> => {
    await simulateApiDelay(150);
    
    const product = MOCK_PRODUCTS.find(p => p.barcode === barcode);
    return product || null;
  },

  /**
   * Obtener producto por ID
   */
  getProductById: async (id: number): Promise<Product | null> => {
    await simulateApiDelay(100);
    return MOCK_PRODUCTS.find(p => p.id === id) || null;
  },

  /**
   * Verificar disponibilidad de stock
   */
  checkStockAvailability: async (productId: number, requestedQuantity: number): Promise<boolean> => {
    await simulateApiDelay(50);
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    return product ? (product.stock ?? 0) >= requestedQuantity : false;
  },

  /**
   * Actualizar stock después de venta
   * Nota: En implementación real, esto sería una llamada a la API
   */
  updateStockAfterSale: async (productId: number, quantitySold: number): Promise<boolean> => {
    console.log(`[Mock API] Actualizando stock: Producto ${productId}, -${quantitySold} unidades`);
    
    // En implementación real:
    // return api.patch(`/products/${productId}/stock`, { quantity: -quantitySold });
    
    await simulateApiDelay(300);
    return true;
  },

  /**
   * Obtener productos con bajo stock
   */
  getLowStockProducts: async (threshold: number = 10): Promise<Product[]> => {
    await simulateApiDelay(250);
    return MOCK_PRODUCTS.filter(product => (product.stock ?? 0) <= threshold);
  },
};

// =============================================
// SERVICIOS DE VENTAS
// =============================================

export const saleService = {
  /**
   * Crear una nueva venta
   */
  createSale: async (saleData: CreateSaleDto): Promise<Sale> => {
    await simulateApiDelay(500);
    
    // Calcular totales
    const subtotal = saleData.items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = saleData.tax || 0;
    const discount = saleData.discount || 0;
    const total = subtotal + tax - discount;
    
    // Calcular cambio
    const totalPaid = saleData.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const changeDue = Math.max(0, totalPaid - total);
    
    // Generar número de factura
    const now = new Date();
    const invoiceNumber = `FAC-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${mockSaleId.toString().padStart(4, '0')}`;
    
    const newSale: Sale = {
      id: mockSaleId++,
      invoiceNumber,
      items: saleData.items,
      payments: saleData.payments,
      subtotal,
      tax,
      discount,
      total,
      changeDue,
      customerName: saleData.customerName,
      createdAt: new Date().toISOString(),
      status: 'completed'
    };
    
    // Guardar en "base de datos" mock
    mockSales.push(newSale);
    
    console.log('[Mock API] Venta creada:', {
      invoiceNumber: newSale.invoiceNumber,
      total: newSale.total,
      items: newSale.items.length
    });
    
    // En implementación real:
    // return api.post('/sales', saleData);
    
    return newSale;
  },

  /**
   * Obtener venta por ID
   */
  getSaleById: async (id: number): Promise<Sale | null> => {
    await simulateApiDelay(300);
    return mockSales.find(sale => sale.id === id) || null;
  },

  /**
   * Obtener venta por número de factura
   */
  getSaleByInvoice: async (invoiceNumber: string): Promise<Sale | null> => {
    await simulateApiDelay(250);
    return mockSales.find(sale => sale.invoiceNumber === invoiceNumber) || null;
  },

  /**
   * Obtener ventas del día actual
   */
  getTodaySales: async (): Promise<Sale[]> => {
    await simulateApiDelay(400);
    
    const today = new Date().toISOString().split('T')[0];
    return mockSales.filter(sale => sale.createdAt.startsWith(today));
  },

  /**
   * Cancelar una venta
   */
  cancelSale: async (saleId: number, reason?: string): Promise<boolean> => {
    await simulateApiDelay(350);
    
    const saleIndex = mockSales.findIndex(sale => sale.id === saleId);
    if (saleIndex !== -1) {
      mockSales[saleIndex].status = 'cancelled';
      console.log(`[Mock API] Venta ${saleId} cancelada. Razón: ${reason || 'No especificada'}`);
      return true;
    }
    
    return false;
  },

  /**
   * Generar número de factura único
   */
  generateInvoiceNumber: async (): Promise<string> => {
    await simulateApiDelay(100);
    
    const now = new Date();
    const randomNum = Math.floor(Math.random() * 10000);
    return `FAC-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${randomNum.toString().padStart(4, '0')}`;
  },

  /**
   * Simular impresión de recibo
   */
  printReceipt: async (sale: Sale): Promise<boolean> => {
    console.log('[Mock API] Imprimiendo recibo:', {
      invoice: sale.invoiceNumber,
      total: sale.total,
      date: sale.createdAt
    });
    
    await simulateApiDelay(800);
    
    // Aquí integrarías con API de impresión térmica
    // Ejemplo: window.print() o API específica de impresora
    
    return true;
  },

  /**
   * Obtener estadísticas de ventas del día
   */
  getTodayStats: async (): Promise<{
    totalSales: number;
    totalAmount: number;
    averageTicket: number;
    itemsSold: number;
  }> => {
    await simulateApiDelay(300);
    
    const todaySales = await saleService.getTodaySales();
    const totalSales = todaySales.length;
    const totalAmount = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const itemsSold = todaySales.reduce((sum, sale) => 
      sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);
    
    return {
      totalSales,
      totalAmount,
      averageTicket: totalSales > 0 ? totalAmount / totalSales : 0,
      itemsSold
    };
  },
};

// =============================================
// SERVICIOS DE CAJA (CASH REGISTER)
// =============================================

export const cashRegisterService = {
  /**
   * Registrar apertura de caja
   */
  registerOpening: async (initialAmount: number, userId: number): Promise<boolean> => {
    await simulateApiDelay(400);
    
    const session = {
      id: Date.now(),
      userId,
      initialAmount,
      openingTime: new Date().toISOString(),
      status: 'open'
    };
    
    localStorage.setItem('cash_register_session', JSON.stringify(session));
    console.log('[Mock API] Caja abierta:', session);
    
    return true;
  },

  /**
   * Registrar cierre de caja
   */
  registerClosing: async (closingAmount: number, userId: number): Promise<{
    initialAmount: number;
    closingAmount: number;
    expectedAmount: number;
    difference: number;
  }> => {
    await simulateApiDelay(500);
    
    const sessionStr = localStorage.getItem('cash_register_session');
    if (!sessionStr) {
      throw new Error('No hay sesión de caja activa');
    }
    
    const session = JSON.parse(sessionStr);
    const expectedAmount = session.initialAmount;
    const difference = closingAmount - expectedAmount;
    
    const closingReport = {
      initialAmount: session.initialAmount,
      closingAmount,
      expectedAmount,
      difference,
      openingTime: session.openingTime,
      closingTime: new Date().toISOString(),
      userId
    };
    
    localStorage.removeItem('cash_register_session');
    console.log('[Mock API] Caja cerrada:', closingReport);
    
    return closingReport;
  },

  /**
   * Verificar estado de caja
   */
  getRegisterStatus: async (): Promise<{
    isOpen: boolean;
    session?: any;
    lastClosing?: any;
  }> => {
    await simulateApiDelay(100);
    
    const sessionStr = localStorage.getItem('cash_register_session');
    const isOpen = !!sessionStr;
    
    return {
      isOpen,
      session: isOpen ? JSON.parse(sessionStr) : null,
      lastClosing: localStorage.getItem('last_cash_register_closing')
        ? JSON.parse(localStorage.getItem('last_cash_register_closing')!)
        : null
    };
  },
};

// =============================================
// EXPORTACIÓN POR DEFECTO (opcional)
// =============================================

export default {
  productService,
  saleService,
  cashRegisterService,
};