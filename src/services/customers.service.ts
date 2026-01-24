import type { Customer, CustomerFormData } from '../types/customers.types';

// Datos de ejemplo - en una implementación real se reemplazaría con llamadas API
const mockCustomers: Customer[] = [
  {
    id_cliente: 1,
    nombre_cliente: 'Juan Pérez García',
    telefono: '+52 55 1234 5678',
    correo: 'juan.perez@email.com',
    domicilio: 'Av. Principal #123, Col. Centro, CDMX',
    notas: 'Cliente preferente'
  },
  {
    id_cliente: 2,
    nombre_cliente: 'Empresa ABC S.A. de C.V.',
    telefono: '+52 55 8765 4321',
    correo: 'ventas@empresaabc.com',
    domicilio: 'Blvd. Industrial #456, Parque Industrial, Monterrey',
    notas: 'Factura requerida'
  },
  {
    id_cliente: 3,
    nombre_cliente: 'María Rodríguez López',
    telefono: '+52 33 5555 8888',
    correo: 'maria.rodriguez@email.com',
    domicilio: 'Calle Secundaria #789, Guadalajara',
    notas: ''
  }
];

class CustomersService {
  // Obtener todos los clientes
  async getCustomers(): Promise<Customer[]> {
    // Simulación de delay para API
    return new Promise((resolve) => {
      setTimeout(() => resolve([...mockCustomers]), 300);
    });
  }

  // Crear un nuevo cliente
  async createCustomer(customerData: CustomerFormData): Promise<Customer> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newCustomer: Customer = {
          id_cliente: Math.max(...mockCustomers.map(c => c.id_cliente), 0) + 1,
          ...customerData
        };
        mockCustomers.push(newCustomer);
        resolve(newCustomer);
      }, 300);
    });
  }

  // Actualizar un cliente existente
  async updateCustomer(id: number, customerData: CustomerFormData): Promise<Customer> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockCustomers.findIndex(c => c.id_cliente === id);
        if (index !== -1) {
          mockCustomers[index] = { id_cliente: id, ...customerData };
          resolve(mockCustomers[index]);
        }
        throw new Error('Cliente no encontrado');
      }, 300);
    });
  }

  // Eliminar un cliente
  async deleteCustomer(id: number): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockCustomers.findIndex(c => c.id_cliente === id);
        if (index !== -1) {
          mockCustomers.splice(index, 1);
          resolve(true);
        }
        resolve(false);
      }, 300);
    });
  }
}

export const customersService = new CustomersService();