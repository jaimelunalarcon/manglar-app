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
      return response.data; // AsignacionTarea
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

  /**
   * Obtener todas las asignaciones (admin + filtrado en front)
   * backend: GET /api/tareas/asignaciones
   */
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
   * Marcar una asignación como completada (envío de "evidencia")
   * backend: PUT /api/tareas/asignaciones/{asignacionId}/completar
   * body: { fotoUri }
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
        'Error al completar la tarea';
      throw new Error(mensaje);
    }
  },

  /**
   * Aprobar una asignación (admin)
   * backend: PUT /api/tareas/asignaciones/{id}/aprobar
   */
  aprobarAsignacion: async (id) => {
    try {
      const response = await axiosInstance.put(
        `/tareas/asignaciones/${id}/aprobar`
      );
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data ||
        'Error al aprobar asignación';
      throw new Error(mensaje);
    }
  },

  /**
   * Marcar como no cumplida / rechazada (admin)
   * backend: PUT /api/tareas/asignaciones/{id}/rechazar
   * body: { comentario }
   */
  marcarNoCumplida: async (id) => {
    try {
      const response = await axiosInstance.put(
        `/tareas/asignaciones/${id}/rechazar`,
        { comentario: 'Marcada como no cumplida por el administrador.' }
      );
      return response.data;
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.response?.data ||
        'Error al marcar como no cumplida';
      throw new Error(mensaje);
    }
  },
};

export default tareaService;