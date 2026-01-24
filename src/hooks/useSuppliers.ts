import { useState, useMemo, useEffect } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import type { Supplier, SupplierFormData } from '../types/suppliers.types';
import { suppliersService } from '../services/suppliers.service';

export const useSuppliers = () => {
  // Estado para proveedores
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Inicialmente en true para cargar al inicio
  
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filtrosAplicados, setFiltrosAplicados] = useState(false);
  
  // Estados para modales
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [viewOpened, { open: openView, close: closeView }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  
  // Estados para operaciones
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

  // Formulario con validaciones
  const form = useForm<SupplierFormData>({
    initialValues: {
      nombre_proveedor: '',
      nombre_contacto: '',
      telefono: '',
      correo: '',
      domicilio: '',
      notas: '',
    },
    validate: {
      nombre_proveedor: (value) => {
        if (!value.trim()) {
          return 'El nombre del proveedor es requerido';
        }
        if (value.trim().length < 3) {
          return 'El nombre debe tener al menos 3 caracteres';
        }
        if (value.trim().length > 100) {
          return 'El nombre no puede tener más de 100 caracteres';
        }
        return null;
      },
      nombre_contacto: (value) => {
        if (value.trim().length > 100) {
          return 'El nombre de contacto no puede tener más de 100 caracteres';
        }
        return null;
      },
      telefono: (value) => {
        if (value.trim().length > 20) {
          return 'El teléfono no puede tener más de 20 caracteres';
        }
        return null;
      },
      correo: (value) => {
        if (value && !/^\S+@\S+$/.test(value)) {
          return 'Correo electrónico inválido';
        }
        if (value.trim().length > 100) {
          return 'El correo no puede tener más de 100 caracteres';
        }
        return null;
      },
      domicilio: (value) => {
        if (value.trim().length > 200) {
          return 'El domicilio no puede tener más de 200 caracteres';
        }
        return null;
      },
      notas: (value) => {
        if (value.trim().length > 500) {
          return 'Las notas no pueden tener más de 500 caracteres';
        }
        return null;
      },
    },
  });

  // Cargar proveedores
  const loadSuppliers = async () => {
    setIsLoading(true);
    try {
      const data = await suppliersService.getSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar proveedores
  const filteredSuppliers = useMemo(() => {
    if (!filtrosAplicados) return suppliers;
    
    return suppliers.filter(supplier =>
      supplier.nombre_proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.nombre_contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.correo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [suppliers, searchTerm, filtrosAplicados]);

  // Función para aplicar búsqueda
  const handleBuscar = () => {
    if (searchInput.trim() === '') {
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setSearchTerm(searchInput);
      setFiltrosAplicados(true);
      setIsLoading(false);
    }, 500);
  };

  // Función para limpiar filtros
  const handleLimpiar = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSearchInput('');
      setSearchTerm('');
      setFiltrosAplicados(false);
      setIsLoading(false);
    }, 300);
  };

  // Limpiar estados y cerrar modal
  const resetAndCloseModal = () => {
    closeModal();
    form.reset();
    setEditingSupplier(null);
  };

  // Función para abrir modal en modo crear
  const handleOpenCreateModal = () => {
    setEditingSupplier(null);
    form.reset();
    openModal();
  };

  // Función para abrir modal en modo editar
  const handleOpenEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    form.setValues({
      nombre_proveedor: supplier.nombre_proveedor,
      nombre_contacto: supplier.nombre_contacto,
      telefono: supplier.telefono,
      correo: supplier.correo,
      domicilio: supplier.domicilio,
      notas: supplier.notas,
    });
    openModal();
  };

  // Manejar guardar proveedor (crear o editar)
  const handleSaveSupplier = async (values: SupplierFormData) => {
    const validation = form.validate();
    if (validation.hasErrors) {
      return;
    }

    try {
      if (editingSupplier) {
        const updatedSupplier = await suppliersService.updateSupplier(
          editingSupplier.id_proveedor,
          {
            nombre_proveedor: values.nombre_proveedor.trim(),
            nombre_contacto: values.nombre_contacto.trim(),
            telefono: values.telefono.trim(),
            correo: values.correo.trim(),
            domicilio: values.domicilio.trim(),
            notas: values.notas.trim(),
          }
        );
        setSuppliers(suppliers.map(supplier =>
          supplier.id_proveedor === editingSupplier.id_proveedor ? updatedSupplier : supplier
        ));
      } else {
        const newSupplier = await suppliersService.createSupplier({
          nombre_proveedor: values.nombre_proveedor.trim(),
          nombre_contacto: values.nombre_contacto.trim(),
          telefono: values.telefono.trim(),
          correo: values.correo.trim(),
          domicilio: values.domicilio.trim(),
          notas: values.notas.trim(),
        });
        setSuppliers([...suppliers, newSupplier]);
      }
      
      resetAndCloseModal();
      return true;
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
      return false;
    }
  };

  // Manejar eliminar
  const handleDelete = (supplier: Supplier) => {
    setDeletingSupplier(supplier);
    openDeleteModal();
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (deletingSupplier) {
      try {
        const success = await suppliersService.deleteSupplier(deletingSupplier.id_proveedor);
        if (success) {
          setSuppliers(suppliers.filter(s => s.id_proveedor !== deletingSupplier.id_proveedor));
        }
      } catch (error) {
        console.error('Error al eliminar proveedor:', error);
      }
    }
    closeDeleteModal();
    setDeletingSupplier(null);
  };

  // Cargar proveedores al montar el componente
  useEffect(() => {
    loadSuppliers();
  }, []);

  return {
    // Estados
    suppliers,
    isLoading,
    searchInput,
    setSearchInput,
    filtrosAplicados,
    filteredSuppliers,
    modalOpened,
    viewOpened,
    deleteModalOpened,
    editingSupplier,
    viewingSupplier,
    deletingSupplier,
    
    // Funciones
    handleBuscar,
    handleLimpiar,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleSaveSupplier,
    handleDelete,
    confirmDelete,
    resetAndCloseModal,
    closeView,
    closeDeleteModal,
    setViewingSupplier,
    openView,
    
    // Form
    form,
  };
};