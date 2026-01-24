// services/auth.service.ts
// SOLO exporta User primero

export interface User {
  name: string;
  email: string;
  role: 'Administrador' | 'Empleado' | 'Superusuario';
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<User | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { identifier, password } = credentials;
        let loggedUser: User | null = null;

        if ((identifier === 'propietaria@papeleria.com' || identifier === 'ana_super') && password === '1234') {
          loggedUser = { name: 'Propietaria (Ana)', email: 'propietaria@papeleria.com', role: 'Superusuario' };
        } else if ((identifier === 'admin@papeleria.com' || identifier === 'juan_admin') && password === '1234') { 
          loggedUser = { name: 'Administrador (Juan)', email: 'admin@papeleria.com', role: 'Administrador' };
        } else if ((identifier === 'empleado@papeleria.com' || identifier === 'luis_emp') && password === '1234') {
          loggedUser = { name: 'Empleado (Luis)', email: 'empleado@papeleria.com', role: 'Empleado' };
        }

        resolve(loggedUser);
      }, 500);
    });
  }
}

export const authService = new AuthService();