import { useState, useEffect } from 'react';
import { authService, type User } from '../services/auth.service';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    // Recuperar usuario del localStorage al iniciar
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [loading, setLoading] = useState(true); // Inicialmente true para verificar
  const [error, setError] = useState<string | null>(null);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const loggedUser = await authService.login({ identifier, password });
      
      if (loggedUser) {
        setUser(loggedUser);
        // Guardar en localStorage
        localStorage.setItem('user', JSON.stringify(loggedUser));
        return true;
      } else {
        setError('Credenciales incorrectas');
        return false;
      }
    } catch (err) {
      setError('Error en el inicio de sesión');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    // Limpiar localStorage
    localStorage.removeItem('user');
  };

  useEffect(() => {
    // Verificar si hay sesión guardada al montar el componente
    const verifyStoredSession = async () => {
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Aquí podrías validar el token con el backend si fuera real
          setUser(parsedUser);
        } catch (err) {
          // Si hay error parseando, limpiar
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };

    verifyStoredSession();
  }, []);

  const isAuthenticated = !!user;

  return {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    logout,
  };
};