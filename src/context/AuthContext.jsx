import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isHydrating, setIsHydrating] = useState(true);

  // Cargar usuario al iniciar la aplicación
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      // Mapear el usuario del backend a la estructura del frontend
      const mappedUser = mapBackendUserToFrontend(currentUser);
      setUser(mappedUser);
    }
    setIsHydrating(false);
  }, []);

  /**
   * Mapear roles del backend a roles del frontend
   * Backend: ADMINISTRADOR, ARRENDATARIO, SUPERVISOR
   * Frontend: admin, arrendatario
   */
  const mapBackendUserToFrontend = (backendUser) => {
    let frontendRole = 'arrendatario'; // por defecto

    if (backendUser.rol === 'ADMINISTRADOR' || backendUser.rol === 'SUPERVISOR') {
      frontendRole = 'admin';
    } else if (backendUser.rol === 'ARRENDATARIO') {
      frontendRole = 'arrendatario';
    }

    return {
      rut: backendUser.rut,
      nombre: backendUser.nombre,
      email: backendUser.email,
      role: frontendRole, // Usa "role" en lugar de "rol" para compatibilidad con tu código
      rol: backendUser.rol, // Mantén también el rol original del backend
      estado: backendUser.estado,
    };
  };

  /**
   * Iniciar sesión
   * Acepta tanto { username, password } como { email, password }
   */
  const login = async (credentials) => {
    try {
      // Extraer email o username
      const email = credentials.email || credentials.username;
      const password = credentials.password;

      // Validaciones básicas
      if (!email || !password) {
        return {
          ok: false,
          errors: {
            username: !email ? 'El email es obligatorio' : '',
            password: !password ? 'La contraseña es obligatoria' : '',
          },
        };
      }

      // Llamar al servicio de autenticación
      const response = await authService.login(email, password);

      // Mapear usuario del backend al formato del frontend
      const mappedUser = mapBackendUserToFrontend({
        rut: response.rut,
        nombre: response.nombre,
        email: response.email,
        rol: response.rol,
        estado: response.estado,
      });

      setUser(mappedUser);

      // Retornar en el formato que espera tu Login.jsx
      return {
        ok: true,
        user: mappedUser,
      };
    } catch (error) {
      // Manejar errores y retornar en el formato que espera Login.jsx
      return {
        ok: false,
        error: error.message || 'Credenciales inválidas',
      };
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  /**
   * Verificar si el usuario está autenticado
   */
  const isAuthenticated = () => {
    return !!user && authService.isAuthenticated();
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isHydrating, // Necesario para HomeRedirect
    loading: isHydrating, // Alias para compatibilidad
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
