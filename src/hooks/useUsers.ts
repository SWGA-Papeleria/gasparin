// hooks/useUsers.ts
import { useState, useMemo, useCallback } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import type { User, UserFormValues, ROLES } from '../types/users.types';
import { initialUsers, simulateApiCall, getRoleLabel, getRoleColor } from '../services/users.service';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filtrosAplicados, setFiltrosAplicados] = useState(false);
  
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [viewOpened, { open: openView, close: closeView }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const form = useForm({
    initialValues: {
      nombre: '',
      apaterno: '',
      amaterno: '',
      usuario_login: '',
      correo: '',
      telefono: '',
      fk_rol: 3,
      estado: true,
    },
    validate: {
      nombre: (value) => {
        if (!value.trim()) {
          return 'El nombre es requerido';
        }
        if (value.trim().length < 2) {
          return 'El nombre debe tener al menos 2 caracteres';
        }
        if (value.trim().length > 50) {
          return 'El nombre no puede tener más de 50 caracteres';
        }
        return null;
      },
      apaterno: (value) => {
        if (!value.trim()) {
          return 'El apellido paterno es requerido';
        }
        if (value.trim().length < 2) {
          return 'El apellido paterno debe tener al menos 2 caracteres';
        }
        if (value.trim().length > 50) {
          return 'El apellido paterno no puede tener más de 50 caracteres';
        }
        return null;
      },
      amaterno: (value) => {
        if (value.trim().length > 50) {
          return 'El apellido materno no puede tener más de 50 caracteres';
        }
        return null;
      },
      usuario_login: (value) => {
        if (!value.trim()) {
          return 'El usuario login es requerido';
        }
        if (value.trim().length < 3) {
          return 'El usuario login debe tener al menos 3 caracteres';
        }
        if (value.trim().length > 30) {
          return 'El usuario login no puede tener más de 30 caracteres';
        }
        if (!/^[a-zA-Z0-9_]+$/.test(value.trim())) {
          return 'El usuario solo puede contener letras, números y guiones bajos';
        }
        
        const loginNormalizado = value.trim().toLowerCase();
        const usuarioExistente = users.find(
          u => u.usuario_login.toLowerCase() === loginNormalizado && 
          (!editingUser || u.id_usuario !== editingUser.id_usuario)
        );
        
        if (usuarioExistente) {
          return 'Ya existe un usuario con ese login';
        }
        
        return null;
      },
      correo: (value) => {
        if (!value.trim()) {
          return 'El correo electrónico es requerido';
        }
        if (value.trim().length > 100) {
          return 'El correo no puede tener más de 100 caracteres';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return 'Ingrese un correo electrónico válido';
        }
        
        const correoNormalizado = value.trim().toLowerCase();
        const usuarioExistente = users.find(
          u => u.correo.toLowerCase() === correoNormalizado && 
          (!editingUser || u.id_usuario !== editingUser.id_usuario)
        );
        
        if (usuarioExistente) {
          return 'Ya existe un usuario con ese correo electrónico';
        }
        
        return null;
      },
      telefono: (value) => {
        if (value.trim() && value.trim().length > 20) {
          return 'El teléfono no puede tener más de 20 caracteres';
        }
        return null;
      },
    },
  });

  const filteredUsers = useMemo(() => {
    if (!filtrosAplicados) return users;
    
    return users.filter(user =>
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.apaterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.amaterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.usuario_login.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.correo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm, filtrosAplicados]);

  const handleBuscar = useCallback(async () => {
    if (searchInput.trim() === '') {
      return;
    }
    
    setIsLoading(true);
    await simulateApiCall();
    setSearchTerm(searchInput);
    setFiltrosAplicados(true);
    setIsLoading(false);
  }, [searchInput]);

  const handleLimpiar = useCallback(async () => {
    setIsLoading(true);
    await simulateApiCall();
    setSearchInput('');
    setSearchTerm('');
    setFiltrosAplicados(false);
    setIsLoading(false);
  }, []);

  const resetAndCloseModal = useCallback(() => {
    closeModal();
    form.reset();
    setEditingUser(null);
  }, [closeModal, form]);

  const handleOpenCreateModal = useCallback(() => {
    setEditingUser(null);
    form.reset();
    openModal();
  }, [form, openModal]);

  const handleOpenEditModal = useCallback((user: User) => {
    setEditingUser(user);
    form.setValues({
      nombre: user.nombre,
      apaterno: user.apaterno,
      amaterno: user.amaterno,
      usuario_login: user.usuario_login,
      correo: user.correo,
      telefono: user.telefono,
      fk_rol: user.fk_rol,
      estado: user.estado,
    });
    openModal();
  }, [form, openModal]);

  const handleSaveUser = useCallback((values: UserFormValues) => {
    const validation = form.validate();
    if (validation.hasErrors) {
      return;
    }

    if (editingUser) {
      setUsers(users.map(user =>
        user.id_usuario === editingUser.id_usuario
          ? {
              ...user,
              nombre: values.nombre.trim(),
              apaterno: values.apaterno.trim(),
              amaterno: values.amaterno.trim(),
              usuario_login: values.usuario_login.trim(),
              correo: values.correo.trim(),
              telefono: values.telefono.trim(),
              fk_rol: values.fk_rol,
              estado: values.estado,
              updated_at: new Date().toISOString(),
              updated_by: 1
            }
          : user
      ));
      
      notifications.show({
        title: 'Usuario actualizado',
        message: `El usuario "${values.nombre.trim()} ${values.apaterno.trim()}" se ha actualizado exitosamente`,
        color: 'green',
      });
    } else {
      const newUser: User = {
        id_usuario: Math.max(...users.map(u => u.id_usuario), 0) + 1,
        nombre: values.nombre.trim(),
        apaterno: values.apaterno.trim(),
        amaterno: values.amaterno.trim(),
        usuario_login: values.usuario_login.trim(),
        correo: values.correo.trim(),
        telefono: values.telefono.trim(),
        password_hash: 'temp_password',
        estado: values.estado,
        fk_rol: values.fk_rol,
        ultimo_acceso: null,
        created_by: 1,
        updated_by: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      };
      setUsers([...users, newUser]);
      
      notifications.show({
        title: 'Usuario creado',
        message: `El usuario "${values.nombre.trim()} ${values.apaterno.trim()}" se ha creado exitosamente`,
        color: 'green',
      });
    }
    
    resetAndCloseModal();
  }, [editingUser, form, resetAndCloseModal, users]);

  const handleView = useCallback((user: User) => {
    setViewingUser(user);
    openView();
  }, [openView]);

  const handleDelete = useCallback((user: User) => {
    setDeletingUser(user);
    openDeleteModal();
  }, [openDeleteModal]);

  const confirmDelete = useCallback(() => {
    if (deletingUser) {
      setUsers(users.filter(user => user.id_usuario !== deletingUser.id_usuario));
      
      notifications.show({
        title: 'Usuario eliminado',
        message: `El usuario "${deletingUser.nombre} ${deletingUser.apaterno}" se ha eliminado exitosamente`,
        color: 'green',
      });
    }
    closeDeleteModal();
    setDeletingUser(null);
  }, [deletingUser, users, closeDeleteModal]);

  const handleStatusChange = useCallback((id: number, newStatus: boolean) => {
    setUsers(users.map(user =>
      user.id_usuario === id
        ? {
            ...user,
            estado: newStatus,
            updated_at: new Date().toISOString(),
            updated_by: 1
          }
        : user
    ));
  }, [users]);

  return {
    users: filteredUsers,
    isLoading,
    searchInput,
    setSearchInput,
    filtrosAplicados,
    modalOpened,
    viewOpened,
    deleteModalOpened,
    editingUser,
    viewingUser,
    deletingUser,
    form,
    handleBuscar,
    handleLimpiar,
    resetAndCloseModal,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleSaveUser,
    handleView,
    handleDelete,
    confirmDelete,
    handleStatusChange,
    getRoleLabel,
    getRoleColor,
    closeView,
    closeDeleteModal,
  };
};