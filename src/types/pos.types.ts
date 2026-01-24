// src/types/pos.types.ts
export interface Product {
  id: number;
  name: string;
  unitPrice: number;
  stock?: number;
  sku?: string;
  barcode?: string;
  category?: string;
}

export interface SaleItem {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Payment {
  method: 'Cash' | 'Card' | 'Transfer';
  amount: number;
  reference?: string;
}

export type CheckoutStage = 'cart' | 'payment' | 'confirmation';

export interface AmountModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  title: string;
  actionLabel: string;
}

export interface CartProps {
  items: SaleItem[];
  total: number;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
  onStartPayment: () => void;
}

export interface ProductListProps {
  products: Product[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onAddToCart: (product: Product) => void;
  isSearching?: boolean;
  isLoadingInitial?: boolean; // Nueva prop para carga inicial
}

export interface PaymentModalProps {
  opened: boolean;
  onClose: () => void;
  totalAmount: number;
  onPaymentComplete: (payments: Payment[]) => void;
}

export interface ConfirmationScreenProps {
  saleId: number;
  saleItems: SaleItem[];
  payments: Payment[];
  changeDue: number;
  totalAmount: number;
  onNewOrder: () => void;
}