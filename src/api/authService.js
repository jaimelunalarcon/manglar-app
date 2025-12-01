 import axiosInstance from './axiosConfig';;

const authService = {
  /**
   * Iniciar sesión
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise} - Promesa con la respuesta del login
   */
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });

      // Guardar token y datos del usuario en localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // Guardar información del usuario
        const userData = {
          rut: response.data.rut,
          nombre: response.data.nombre,
          email: response.data.email,
          rol: response.data.rol,
          estado: response.data.estado,
        };
        localStorage.setItem('user', JSON.stringify(userData));
      }

      return response.data;
    } catch (error) {
      // Manejar diferentes tipos de errores
      if (error.response) {
        // El servidor respondió con un código de error
        throw new Error(error.response.data || 'Credenciales inválidas');
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        throw new Error('No se pudo conectar con el servidor');
      } else {
        // Algo sucedió al configurar la petición
        throw new Error('Error al procesar la solicitud');
      }
    }
  },

  /**
   * Cerrar sesión
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Obtener usuario actual desde localStorage
   * @returns {Object|null} - Datos del usuario o null
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  /**
   * Verificar si el usuario está autenticado
   * @returns {boolean} - true si está autenticado
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  /**
   * Obtener el token actual
   * @returns {string|null} - Token JWT o null
   */
  getToken: () => {
    return localStorage.getItem('token');
  },
};

export default authService;