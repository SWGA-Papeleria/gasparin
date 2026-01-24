import { useState, useMemo } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import type { Customer, CustomerFormData } from '../types/customers.types';
import { customersService } from '../services/customers.service';

export const useCustomers = () => {
  // Estado para clientes
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filtrosAplicados, setFiltrosAplicados] = useState(false);
  
  // Estados para modales
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [viewOpened, { open: openView, close: closeView }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  
  // Estados para operaciones
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  // Formulario con validaciones
  const form = useForm<CustomerFormData>({
    initialValues: {
      nombre_cliente: '',
      telefono: '',
      correo: '',
      domicilio: '',
      notas: '',
    },
    validate: {
      nombre_cliente: (value) => {
        if (!value.trim()) {
          return 'El nombre del cliente es requerido';
        }
        if (value.trim().length < 3) {
          return 'El nombre debe tener al menos 3 caracteres';
        }
        if (value.trim().length > 100) {
          return 'El nombre no puede tener más de 100 caracteres';
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

  // Cargar clientes
  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await customersService.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar clientes
  const filteredCustomers = useMemo(() => {
    if (!filtrosAplicados) return customers;
    
    return customers.filter(customer =>
      customer.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.telefono.includes(searchTerm)
    );
  }, [customers, searchTerm, filtrosAplicados]);

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
    setEditingCustomer(null);
  };

  // Función para abrir modal en modo crear
  const handleOpenCreateModal = () => {
    setEditingCustomer(null);
    form.reset();
    openModal();
  };

  // Función para abrir modal en modo editar
  const handleOpenEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    form.setValues({
      nombre_cliente: customer.nombre_cliente,
      telefono: customer.telefono,
      correo: customer.correo,
      domicilio: customer.domicilio,
      notas: customer.notas,
    });
    openModal();
  };

  // Manejar guardar cliente (crear o editar)
  const handleSaveCustomer = async (values: CustomerFormData) => {
    const validation = form.validate();
    if (validation.hasErrors) {
      return;
    }

    try {
      if (editingCustomer) {
        const updatedCustomer = await customersService.updateCustomer(
          editingCustomer.id_cliente,
          {
            nombre_cliente: values.nombre_cliente.trim(),
            telefono: values.telefono.trim(),
            correo: values.correo.trim(),
            domicilio: values.domicilio.trim(),
            notas: values.notas.trim(),
          }
        );
        setCustomers(customers.map(customer =>
          customer.id_cliente === editingCustomer.id_cliente ? updatedCustomer : customer
        ));
      } else {
        const newCustomer = await customersService.createCustomer({
          nombre_cliente: values.nombre_cliente.trim(),
          telefono: values.telefono.trim(),
          correo: values.correo.trim(),
          domicilio: values.domicilio.trim(),
          notas: values.notas.trim(),
        });
        setCustomers([...customers, newCustomer]);
      }
      
      resetAndCloseModal();
      return true;
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      return false;
    }
  };

  // Manejar eliminar
  const handleDelete = (customer: Customer) => {
    setDeletingCustomer(customer);
    openDeleteModal();
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (deletingCustomer) {
      try {
        const success = await customersService.deleteCustomer(deletingCustomer.id_cliente);
        if (success) {
          setCustomers(customers.filter(c => c.id_cliente !== deletingCustomer.id_cliente));
        }
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
      }
    }
    closeDeleteModal();
    setDeletingCustomer(null);
  };

  // Inicializar cargando clientes
  useState(() => {
    loadCustomers();
  });

  return {
    // Estados
    customers,
    isLoading,
    searchInput,
    setSearchInput,
    filtrosAplicados,
    filteredCustomers,
    modalOpened,
    viewOpened,
    deleteModalOpened,
    editingCustomer,
    viewingCustomer,
    deletingCustomer,
    
    // Funciones
    handleBuscar,
    handleLimpiar,
    handleOpenCreateModal,
    handleOpenEditModal,
    handleSaveCustomer,
    handleDelete,
    confirmDelete,
    resetAndCloseModal,
    closeView,
    closeDeleteModal,
    setViewingCustomer,
    openView,
    
    // Form
    form,
  };
};