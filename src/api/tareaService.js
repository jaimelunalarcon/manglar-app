// src/api/tareaService.js
import axiosInstance from './axiosConfig';

const tareaService = {
  // --- CRUD básico de tareas ---

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

  crear: async (tarea) => {
    try {
      const response = await axiosInstance.post('/tareas', tarea);
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data ||
        'Error al crear la tarea';
      throw new Error(mensaje);
    }
  },

  actualizar: async (id, tarea) => {
    try {
      const response = await axiosInstance.put(`/tareas/${id}`, tarea);
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data ||
        'Error al actualizar la tarea';
      throw new Error(mensaje);
    }
  },

  eliminar: async (id) => {
    try {
      await axiosInstance.delete(`/tareas/${id}`);
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data ||
        'Error al eliminar la tarea';
      throw new Error(mensaje);
    }
  },

  // --- Asignaciones de tareas ---

  /**
   * Tomar una tarea para un día específico
   * backend: POST /api/tareas/{id}/tomar
   * body: { dia, usuarioId, usuarioNombre }
   */
  tomarTarea: async (tareaId, { dia, usuarioId, usuarioNombre }) => {
    try {
      const response = await axiosInstance.post(`/tareas/${tareaId}/tomar`, {
        dia,
        usuarioId,
        usuarioNombre,
      });
      // devuelve AsignacionTarea
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data ||
        'Error al tomar la tarea';
      throw new Error(mensaje);
    }
  },

  /**
   * Liberar / eliminar una asignación
   * backend: DELETE /api/tareas/asignaciones/{asignacionId}
   */
  liberarAsignacion: async (asignacionId) => {
    try {
      await axiosInstance.delete(`/tareas/asignaciones/${asignacionId}`);
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data ||
        'Error al liberar la tarea';
      throw new Error(mensaje);
    }
  },

  obtenerAsignaciones: async () => {
    try {
      const response = await axiosInstance.get('/tareas/asignaciones');
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data ||
        'Error al obtener asignaciones';
      throw new Error(mensaje);
    }
  },

  /**
   * (Para más adelante) Obtener tareas pendientes de aprobación
   * backend: GET /api/tareas/pendientes-aprobacion
   */
  obtenerPendientesAprobacion: async () => {
    try {
      const response = await axiosInstance.get('/tareas/pendientes-aprobacion');
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data ||
        'Error al obtener tareas pendientes';
      throw new Error(mensaje);
    }
  },
};

export default tareaService;