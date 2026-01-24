export interface Supplier {
  id_proveedor: number;
  nombre_proveedor: string;
  nombre_contacto: string;
  telefono: string;
  correo: string;
  domicilio: string;
  notas: string;
}

export interface SupplierFormData {
  nombre_proveedor: string;
  nombre_contacto: string;
  telefono: string;
  correo: string;
  domicilio: string;
  notas: string;
}