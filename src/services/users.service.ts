// services/users.service.ts
import type { User, UserFormValues } from '../types/users.types';

// Datos iniciales de ejemplo
export const initialUsers: User[] = [
  {
    id_usuario: 1,
    nombre: 'Carlos',
    apaterno: 'López',
    amaterno: 'García',
    usuario_login: 'clopez',
    correo: 'carlos.lopez@empresa.com',
    password_hash: 'hashed_password',
    telefono: '+52 55 1234 5678',
    estado: true,
    fk_rol: 1,
    ultimo_acceso: '2024-01-15 10:30:00',
    created_by: 1,
    updated_by: 1,
    created_at: '2024-01-01 08:00:00',
    updated_at: '2024-01-15 10:30:00',
    deleted_at: null
  },
  {
    id_usuario: 2,
    nombre: 'Ana',
    apaterno: 'Martínez',
    amaterno: 'Rodríguez',
    usuario_login: 'amartinez',
    correo: 'ana.martinez@empresa.com',
    password_hash: 'hashed_password',
    telefono: '+52 55 8765 4321',
    estado: true,
    fk_rol: 2,
    ultimo_acceso: '2024-01-14 15:45:00',
    created_by: 1,
    updated_by: 1,
    created_at: '2024-01-01 08:00:00',
    updated_at: '2024-01-14 15:45:00',
    deleted_at: null
  },
  {
    id_usuario: 3,
    nombre: 'Miguel',
    apaterno: 'Hernández',
    amaterno: 'Pérez',
    usuario_login: 'mhernandez',
    correo: 'miguel.hernandez@empresa.com',
    password_hash: 'hashed_password',
    telefono: '+52 33 5555 8888',
    estado: true,
    fk_rol: 3,
    ultimo_acceso: '2024-01-13 09:20:00',
    created_by: 1,
    updated_by: 2,
    created_at: '2024-01-01 08:00:00',
    updated_at: '2024-01-13 09:20:00',
    deleted_at: null
  }
];

export const simulateApiCall = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
};

export const getRoleLabel = (rolId: number): string => {
  const roles: Record<number, { label: string; color: string }> = {
    1: { label: 'Superusuario', color: 'orange' },
    2: { label: 'Admin', color: 'red' },
    3: { label: 'Empleado', color: 'green' },
  };
  return roles[rolId]?.label || 'Desconocido';
};

export const getRoleColor = (rolId: number): string => {
  const roles: Record<number, { label: string; color: string }> = {
    1: { label: 'Superusuario', color: 'orange' },
    2: { label: 'Admin', color: 'red' },
    3: { label: 'Empleado', color: 'green' },
  };
  return roles[rolId]?.color || 'gray';
};