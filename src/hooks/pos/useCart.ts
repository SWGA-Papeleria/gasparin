// src/hooks/pos/useCart.ts (CORREGIDO)
import { useState, useMemo, useEffect } from 'react';

// ------------------------------------------------------------
// UTILITIES (AGREGAR)
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

const getStorageKey = (key: string, userId?: string) => {
    return userId ? `pos_${userId}_${key}` : `pos_${key}`;
};

// ------------------------------------------------------------
// TIPOS
// ------------------------------------------------------------
export interface SaleItem {
    id: number;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

// ------------------------------------------------------------
// HOOK PRINCIPAL
// ------------------------------------------------------------
export const useCart = (currentUserId?: string) => {
    const [saleItems, setSaleItems] = useState<SaleItem[]>(() => 
        getInitialState(getStorageKey('sale_items', currentUserId), [])
    );

    // PERSISTIR CARRITO EN LOCALSTORAGE
    useEffect(() => {
        localStorage.setItem(
            getStorageKey('sale_items', currentUserId), 
            JSON.stringify(saleItems)
        );
    }, [saleItems, currentUserId]);

    // CALCULAR EL TOTAL DE LA VENTA 
    const saleTotal = useMemo(() => 
        saleItems.reduce((acc, item) => acc + item.subtotal, 0),
        [saleItems]
    );

    // ------------------------------------------------------------
    // ACCIONES DEL CARRITO
    // ------------------------------------------------------------
    const addItemToSale = (product: { id: number; name: string; unitPrice: number }, quantity: number = 1) => {
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

    const clearCart = () => {
        setSaleItems([]);
    };

    // ------------------------------------------------------------
    // RETORNO DEL HOOK
    // ------------------------------------------------------------
    return {
        // Estado
        saleItems,
        saleTotal,
        
        // Acciones
        addItemToSale,
        updateItemQuantity,
        removeItem,
        clearCart,
        setSaleItems,
    };
};