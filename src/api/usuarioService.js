import axiosInstance from './axiosConfig';

const usuarioService = {
  /**
   * Obtener todos los usuarios
   * @returns {Promise<Array>} - Lista de usuarios
   */
  obtenerTodos: async () => {
    try {
      const response = await axiosInstance.get('/usuarios');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data || 'Error al obtener usuarios'
      );
    }
  },

  /**
   * Obtener un usuario por RUT
   * @param {string} rut - RUT del usuario
   * @returns {Promise<Object>} - Datos del usuario
   */
  obtenerPorRut: async (rut) => {
    try {
      const rutEncoded = encodeURIComponent(rut);
      const response = await axiosInstance.get(`/usuarios/${rutEncoded}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data || 'Error al obtener el usuario'
      );
    }
  },

  /**
   * Crear un nuevo usuario
   * @param {Object} usuario - Datos del usuario
   * @returns {Promise<Object>} - Usuario creado
   */
  crear: async (usuario) => {
    try {
      const response = await axiosInstance.post('/usuarios', usuario);
      return response.data;
    } catch (error) {
      // El backend puede devolver un mensaje de error específico
      const mensaje = error.response?.data?.message || error.response?.data || 'Error al crear usuario';
      throw new Error(mensaje);
    }
  },

  /**
   * Actualizar un usuario existente
   * @param {string} rut - RUT del usuario a actualizar
   * @param {Object} usuario - Nuevos datos del usuario
   * @returns {Promise<Object>} - Usuario actualizado
   */
  actualizar: async (rut, usuario) => {
    try {
      const rutEncoded = encodeURIComponent(rut);
      const response = await axiosInstance.put(`/usuarios/${rutEncoded}`, usuario);
      return response.data;
    } catch (error) {
      const mensaje = error.response?.data?.message || error.response?.data || 'Error al actualizar usuario';
      throw new Error(mensaje);
    }
  },

  /**
   * Eliminar un usuario
   * @param {string} rut - RUT del usuario a eliminar
   * @returns {Promise<void>}
   */
  eliminar: async (rut) => {
    try {
      const rutEncoded = encodeURIComponent(rut);
      await axiosInstance.delete(`/usuarios/${rutEncoded}`);
    } catch (error) {
      const mensaje = error.response?.data?.message || error.response?.data || 'Error al eliminar usuario';
      throw new Error(mensaje);
    }
  },

  /**
   * Buscar usuarios por query
   * @param {string} query - Texto a buscar
   * @returns {Promise<Array>} - Lista de usuarios que coinciden
   */
  buscar: async (query) => {
    try {
      const response = await axiosInstance.get('/usuarios/buscar', {
        params: { query },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data || 'Error al buscar usuarios'
      );
    }
  },
};

export default usuarioService;