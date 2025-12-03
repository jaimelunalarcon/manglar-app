// src/api/tareaService.js
import axiosInstance from './axiosConfig';

const tareaService = {
  /**
   * Obtener todas las tareas
   * @returns {Promise<Array>} - Lista de tareas
   */
  obtenerTodas: async () => {
    try {
      const response = await axiosInstance.get('/tareas');
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data ||
        'Error al obtener tareas';
      throw new Error(mensaje);
    }
  },

  /**
   * Obtener una tarea por ID
   * @param {number} id - ID de la tarea
   * @returns {Promise<Object>} - Tarea
   */
  obtenerPorId: async (id) => {
    try {
      const response = await axiosInstance.get(`/tareas/${id}`);
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data ||
        'Error al obtener la tarea';
      throw new Error(mensaje);
    }
  },

  /**
   * Crear una nueva tarea
   * @param {Object} tarea - { nombre, puntos, disponibilidad, reglas }
   * @returns {Promise<Object>} - Tarea creada
   */
  crear: async (tarea) => {
    try {
      const response = await axiosInstance.post('/tareas', tarea);
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data ||
        'Error al crear tarea';
      throw new Error(mensaje);
    }
  },

  /**
   * Actualizar una tarea existente
   * @param {number} id - ID de la tarea
   * @param {Object} tarea - Datos actualizados
   * @returns {Promise<Object>} - Tarea actualizada
   */
  actualizar: async (id, tarea) => {
    try {
      const response = await axiosInstance.put(`/tareas/${id}`, tarea);
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data ||
        'Error al actualizar tarea';
      throw new Error(mensaje);
    }
  },

  /**
   * Eliminar una tarea
   * @param {number} id - ID de la tarea
   * @returns {Promise<void>}
   */
  eliminar: async (id) => {
    try {
      await axiosInstance.delete(`/tareas/${id}`);
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data ||
        'Error al eliminar tarea';
      throw new Error(mensaje);
    }
  },

  /**
   * Tomar una tarea para un día específico
   * @param {number} tareaId
   * @param {string} dia - 'LUNES', 'MARTES', etc.
   * @param {string} usuarioId
   * @param {string} usuarioNombre
   * @returns {Promise<Object>} - Asignación creada
   */
  tomarTarea: async (tareaId, { dia, usuarioId, usuarioNombre }) => {
    try {
      const body = { dia, usuarioId, usuarioNombre };
      const response = await axiosInstance.post(`/tareas/${tareaId}/tomar`, body);
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data ||
        'Error al tomar tarea';
      throw new Error(mensaje);
    }
  },

  /**
   * Marcar tarea como completada (subir foto)
   * @param {number} asignacionId
   * @param {string} fotoUri
   * @returns {Promise<Object>}
   */
  completarTarea: async (asignacionId, fotoUri) => {
    try {
      const response = await axiosInstance.put(
        `/tareas/asignaciones/${asignacionId}/completar`,
        { fotoUri }
      );
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data ||
        'Error al completar tarea';
      throw new Error(mensaje);
    }
  },

  /**
   * Aprobar tarea (admin)
   * @param {number} asignacionId
   * @returns {Promise<Object>}
   */
  aprobarTarea: async (asignacionId) => {
    try {
      const response = await axiosInstance.put(
        `/tareas/asignaciones/${asignacionId}/aprobar`
      );
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data ||
        'Error al aprobar tarea';
      throw new Error(mensaje);
    }
  },

  /**
   * Rechazar tarea (admin)
   * @param {number} asignacionId
   * @param {string} comentario
   * @returns {Promise<Object>}
   */
  rechazarTarea: async (asignacionId, comentario) => {
    try {
      const response = await axiosInstance.put(
        `/tareas/asignaciones/${asignacionId}/rechazar`,
        { comentario }
      );
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data ||
        'Error al rechazar tarea';
      throw new Error(mensaje);
    }
  },

  /**
   * Obtener tareas pendientes de aprobación (para dashboard admin)
   * @returns {Promise<Array>}
   */
  obtenerPendientesAprobacion: async () => {
    try {
      const response = await axiosInstance.get('/tareas/pendientes-aprobacion');
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data ||
        'Error al obtener tareas pendientes de aprobación';
      throw new Error(mensaje);
    }
  },

  /**
   * Liberar / eliminar una asignación (quitar una tarea tomada)
   * @param {number} asignacionId
   * @returns {Promise<void>}
   */
  liberarAsignacion: async (asignacionId) => {
    try {
      await axiosInstance.delete(`/tareas/asignaciones/${asignacionId}`);
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data ||
        'Error al liberar asignación de tarea';
      throw new Error(mensaje);
    }
  },
};

export default tareaService;