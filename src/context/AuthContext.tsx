// AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react'; 

interface User {
  name: string;
  email: string;
  role: 'Administrador' | 'Empleado' | 'Superusuario';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('erp_user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    
    const isAuthenticated = !!user;

    useEffect(() => {
        if (user) {
            localStorage.setItem('erp_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('erp_user');
        }
    }, [user]);

  // CAMBIO: Ahora verifica Email O Nombre de Usuario para CADA ROL
  const login = (identifier: string, password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let loggedUser: User | null = null;
        
        // 1. Superusuario (Email O Nombre de Usuario 'ana_super')
        if ((identifier === 'propietaria@papeleria.com' || identifier === 'ana_super') && password === '1234') {
          loggedUser = { name: 'Propietaria (Ana)', email: 'propietaria@papeleria.com', role: 'Superusuario' };
        
        // 2. Administrador (Email O Nombre de Usuario 'juan_admin')
        } else if ((identifier === 'admin@papeleria.com' || identifier === 'juan_admin') && password === '1234') { 
            loggedUser = { name: 'Administrador (Juan)', email: 'admin@papeleria.com', role: 'Administrador' };
            
        // 3. Empleado (Email O Nombre de Usuario 'luis_emp')
        } else if ((identifier === 'empleado@papeleria.com' || identifier === 'luis_emp') && password === '1234') {
          loggedUser = { name: 'Empleado (Luis)', email: 'empleado@papeleria.com', role: 'Empleado' };
        }

        if (loggedUser) {
          setUser(loggedUser); 
          resolve(true);
        } else {
          setUser(null);
          resolve(false);
        }
      }, 500); 
    });
  };

  const logout = () => {
    setUser(null); 
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};