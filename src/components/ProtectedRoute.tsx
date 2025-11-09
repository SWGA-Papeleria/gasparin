import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader, Center } from '@mantine/core'; 

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  // En una aplicación real, aquí se verificaría el estado de carga (loading) 
  // del contexto para evitar que la página "parpadee" antes de saber si está autenticado.
  // Por ahora, asumiremos que isAuthenticated es instantáneo después del chequeo inicial.

  if (!isAuthenticated) {
    // Si no está autenticado, redirigir al login
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderizar el componente hijo (Dashboard)
  return <>{children}</>;
};

export default ProtectedRoute;