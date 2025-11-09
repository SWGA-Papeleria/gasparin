// src/hooks/pos/usePOSState.ts (CORREGIDO)
import { useState, useEffect } from 'react';

// ------------------------------------------------------------
// UTILITIES (AGREGAR ESTAS FUNCIONES)
// ------------------------------------------------------------
const getInitialState = (key: string, defaultValue: any): any => {
    try {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
        console.error("Error al leer localStorage:", error);
        return defaultValue;
    }
};

// NUEVO: Agregar usuario a las claves
const getStorageKey = (key: string, userId?: string) => {
    return userId ? `pos_${userId}_${key}` : `pos_${key}`;
};

// ------------------------------------------------------------
// TIPOS Y CONSTANTES
// ------------------------------------------------------------
interface POSState {
    isSaleActive: boolean;
    currentSaleId: number | null;
}

// ------------------------------------------------------------
// HOOK PRINCIPAL
// ------------------------------------------------------------
export const usePOSState = (currentUserId?: string) => {
    // ESTADOS PRINCIPALES
    const [isSaleActive, setIsSaleActive] = useState<boolean>(() => 
        getInitialState(getStorageKey('sale_active', currentUserId), false)
    );
    
    const [currentSaleId, setCurrentSaleId] = useState<number | null>(() => 
        getInitialState(getStorageKey('current_sale_id', currentUserId), null)
    );

    // ------------------------------------------------------------
    // EFECTOS DE PERSISTENCIA
    // ------------------------------------------------------------
    useEffect(() => {
        localStorage.setItem(
            getStorageKey('sale_active', currentUserId), 
            JSON.stringify(isSaleActive)
        );
    }, [isSaleActive, currentUserId]);

    useEffect(() => {
        const key = getStorageKey('current_sale_id', currentUserId);
        if (currentSaleId !== null) {
            localStorage.setItem(key, JSON.stringify(currentSaleId));
        } else {
            localStorage.removeItem(key);
        }
    }, [currentSaleId, currentUserId]);

    // ------------------------------------------------------------
    // ACCIONES
    // ------------------------------------------------------------
    const startNewSale = () => {
        const newSaleId = Math.floor(Date.now() / 1000);
        setCurrentSaleId(newSaleId);
        setIsSaleActive(true);
        return newSaleId;
    };

    const endSaleSession = () => {
        clearAllData(currentUserId);
        setCurrentSaleId(null);
        setIsSaleActive(false);
    };

    // NUEVO: Función para cambiar de usuario
    const switchUser = (newUserId: string) => {
        // Limpiar datos del usuario anterior
        clearAllData(currentUserId);
        // Cargar datos del nuevo usuario
        const newIsSaleActive = getInitialState(
            getStorageKey('sale_active', newUserId), 
            false
        );
        const newSaleId = getInitialState(
            getStorageKey('current_sale_id', newUserId), 
            null
        );
        
        setIsSaleActive(newIsSaleActive);
        setCurrentSaleId(newSaleId);
    };

    const clearAllData = (userId?: string) => {
        localStorage.removeItem(getStorageKey('sale_active', userId));
        localStorage.removeItem(getStorageKey('current_sale_id', userId));
        localStorage.removeItem(getStorageKey('sale_items', userId));
    };

    const clearCartData = (userId?: string) => {
        localStorage.removeItem(getStorageKey('sale_items', userId));
    };

    // ------------------------------------------------------------
    // RETORNO DEL HOOK
    // ------------------------------------------------------------
    return {
        // Estados
        isSaleActive,
        currentSaleId,
        
        // Setters básicos
        setIsSaleActive,
        setCurrentSaleId,
        
        // Acciones complejas
        startNewSale,
        endSaleSession,
        clearAllData,
        clearCartData,
        switchUser,
    };
};