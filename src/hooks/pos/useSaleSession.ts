import { useState } from 'react';

// ------------------------------------------------------------
// HOOK PRINCIPAL
// ------------------------------------------------------------
export const useSaleSession = () => {
    // ESTADOS PARA MODALES DE MONTO Y VALORES DE CAJA 
    const [isInitialAmountModalOpen, setIsInitialAmountModalOpen] = useState(false);
    const [isClosingAmountModalOpen, setIsClosingAmountModalOpen] = useState(false);
    const [initialCashAmount, setInitialCashAmount] = useState<number | null>(null);
    const [closingCashAmount, setClosingCashAmount] = useState<number | null>(null);

    // ------------------------------------------------------------
    // ACCIONES DE SESIÓN
    // ------------------------------------------------------------
    const openInitialAmountModal = () => {
        setIsInitialAmountModalOpen(true);
    };

    const closeInitialAmountModal = () => {
        setIsInitialAmountModalOpen(false);
    };

    const openClosingAmountModal = () => {
        setIsClosingAmountModalOpen(true);
    };

    const closeClosingAmountModal = () => {
        setIsClosingAmountModalOpen(false);
    };

    const submitInitialAmount = (amount: number) => {
        setInitialCashAmount(amount);
        setIsInitialAmountModalOpen(false);
    };

    const submitClosingAmount = (amount: number) => {
        setClosingCashAmount(amount);
        setIsClosingAmountModalOpen(false);
    };

    const resetSession = () => {
        setInitialCashAmount(null);
        setClosingCashAmount(null);
    };

    // ------------------------------------------------------------
    // RETORNO DEL HOOK
    // ------------------------------------------------------------
    return {
        // Estados
        isInitialAmountModalOpen,
        isClosingAmountModalOpen,
        initialCashAmount,
        closingCashAmount,
        
        // Acciones
        openInitialAmountModal,
        closeInitialAmountModal,
        openClosingAmountModal,
        closeClosingAmountModal,
        submitInitialAmount,
        submitClosingAmount,
        resetSession,
        
        // Setters
        setInitialCashAmount,
        setClosingCashAmount,
    };
};