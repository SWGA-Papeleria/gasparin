import type { Supplier, SupplierFormData } from '../types/suppliers.types';

// Datos de ejemplo
const mockSuppliers: Supplier[] = [
  {
    id_proveedor: 1,
    nombre_proveedor: 'Distribuidora Industrial Mexicana',
    nombre_contacto: 'Ing. Roberto Martínez',
    telefono: '+52 55 1111 2222',
    correo: 'compras@dim.com.mx',
    domicilio: 'Av. de los Proveedores #123, Industrial, CDMX',
    notas: 'Entrega en 24 horas'
  },
  {
    id_proveedor: 2,
    nombre_proveedor: 'Alimentos y Bebidas del Norte',
    nombre_contacto: 'Lic. Ana García',
    telefono: '+52 81 3333 4444',
    correo: 'ventas@alimentosnorte.com',
    domicilio: 'Carretera Nacional Km 45.5, Monterrey',
    notas: 'Pedido mínimo $5,000'
  },
  {
    id_proveedor: 3,
    nombre_proveedor: 'Tecnología Avanzada S.A.',
    nombre_contacto: 'Ing. Carlos López',
    telefono: '+52 33 5555 6666',
    correo: 'soporte@tecnologiaavanzada.com',
    domicilio: 'Blvd. Tecnológico #789, Guadalajara',
    notas: 'Garantía de 1 año'
  }
];

class SuppliersService {
  // Obtener todos los proveedores
  async getSuppliers(): Promise<Supplier[]> {
    // Simulación de delay para API
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockSuppliers]), 800); // Aumentado para ver el loader
    });
  }

  // Crear un nuevo proveedor
  async createSupplier(supplierData: SupplierFormData): Promise<Supplier> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newSupplier: Supplier = {
          id_proveedor: Math.max(...mockSuppliers.map(s => s.id_proveedor), 0) + 1,
          ...supplierData
        };
        mockSuppliers.push(newSupplier);
        resolve(newSupplier);
      }, 300);
    });
  }

  // Actualizar un proveedor existente
  async updateSupplier(id: number, supplierData: SupplierFormData): Promise<Supplier> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockSuppliers.findIndex(s => s.id_proveedor === id);
        if (index !== -1) {
          mockSuppliers[index] = { id_proveedor: id, ...supplierData };
          resolve(mockSuppliers[index]);
        }
        throw new Error('Proveedor no encontrado');
      }, 300);
    });
  }

  // Eliminar un proveedor
  async deleteSupplier(id: number): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockSuppliers.findIndex(s => s.id_proveedor === id);
        if (index !== -1) {
          mockSuppliers.splice(index, 1);
          resolve(true);
        }
        resolve(false);
      }, 300);
    });
  }
}

export const suppliersService = new SuppliersService();