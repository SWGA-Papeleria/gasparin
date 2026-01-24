export interface Customer {
  id_cliente: number;
  nombre_cliente: string;
  telefono: string;
  correo: string;
  domicilio: string;
  notas: string;
}

export interface CustomerFormData {
  nombre_cliente: string;
  telefono: string;
  correo: string;
  domicilio: string;
  notas: string;
}