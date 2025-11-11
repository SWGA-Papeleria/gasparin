import { useState } from 'react';

// ------------------------------------------------------------
// TIPOS
// ------------------------------------------------------------
export interface Payment {
    method: 'Cash' | 'Card' | 'Transfer';
    amount: number;
}

export type CheckoutStage = 'cart' | 'payment' | 'confirmation';

// ------------------------------------------------------------
// HOOK PRINCIPAL
// ------------------------------------------------------------
export const useCheckout = () => {
    const [checkoutStage, setCheckoutStage] = useState<CheckoutStage>('cart');
    const [payments, setPayments] = useState<Payment[]>([]); 
    const [changeDue, setChangeDue] = useState<number>(0);

    // ------------------------------------------------------------
    // ACCIONES DEL CHECKOUT
    // ------------------------------------------------------------
    const startPayment = (hasItems: boolean) => {
        if (!hasItems) {
            alert('Agrega al menos un artículo para pagar.');
            return false;
        }
        setCheckoutStage('payment');
        return true;
    };

    const completePayment = (paidPayments: Payment[], saleTotal: number) => {
        const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
        const calculatedChange = totalPaid - saleTotal;

        setPayments(paidPayments);
        setChangeDue(calculatedChange);
        setCheckoutStage('confirmation');
    };

    const startNewOrder = () => {
        setPayments([]);
        setChangeDue(0);
        setCheckoutStage('cart');
    };

    const cancelPayment = () => {
        setCheckoutStage('cart');
    };

    // ------------------------------------------------------------
    // RETORNO DEL HOOK
    // ------------------------------------------------------------
    return {
        // Estado
        checkoutStage,
        payments,
        changeDue,
        
        // Acciones
        startPayment,
        completePayment,
        startNewOrder,
        cancelPayment,
        
        // Setters
        setCheckoutStage,
        setPayments,
        setChangeDue,
    };
};