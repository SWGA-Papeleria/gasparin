import { useState, useMemo } from 'react';

// ------------------------------------------------------------
// TIPOS
// ------------------------------------------------------------
export interface Product {
    id: number;
    name: string;
    unitPrice: number;
}

// ------------------------------------------------------------
// HOOK PRINCIPAL
// ------------------------------------------------------------
export const useProductSearch = (products: Product[]) => {
    const [searchTerm, setSearchTerm] = useState<string>('');

    // --- FILTRADO DE PRODUCTOS --- 
    const filteredProducts = useMemo(() => {
        if (!searchTerm) return products;

        // Normaliza y quita acentos de la búsqueda
        const normalizedSearch = searchTerm
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, ''); 

        return products.filter(p => {
            const normalizedName = p.name
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, ''); 
            return normalizedName.includes(normalizedSearch);
        });
    }, [searchTerm, products]);

    // ------------------------------------------------------------
    // ACCIONES DE BÚSQUEDA
    // ------------------------------------------------------------
    const clearSearch = () => {
        setSearchTerm('');
    };

    const searchProducts = (term: string) => {
        setSearchTerm(term);
    };

    // ------------------------------------------------------------
    // RETORNO DEL HOOK
    // ------------------------------------------------------------
    return {
        // Estado
        searchTerm,
        filteredProducts,
        
        // Acciones
        setSearchTerm,
        clearSearch,
        searchProducts,
    };
};