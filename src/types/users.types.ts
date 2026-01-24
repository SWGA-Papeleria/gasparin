// types/users.types.ts
export interface User {
  id_usuario: number;
  nombre: string;
  apaterno: string;
  amaterno: string;
  usuario_login: string;
  correo: string;
  password_hash: string;
  telefono: string;
  estado: boolean;
  fk_rol: number;
  ultimo_acceso: string | null;
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type UserFormValues = {
  nombre: string;
  apaterno: string;
  amaterno: string;
  usuario_login: string;
  correo: string;
  telefono: string;
  fk_rol: number;
  estado: boolean;
};

export const ROLES = {
  1: { label: 'Superusuario', color: 'orange' },
  2: { label: 'Admin', color: 'red' },
  3: { label: 'Empleado', color: 'green' },
} as const;