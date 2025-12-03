import axiosInstance from './axiosConfig';

const tareaService = {
  /**
   * Obtener todas las tareas (catálogo)
   */
  obtenerTodas: async () => {
    const response = await axiosInstance.get('/tareas');
    return response.data;
  },

  /**
   * Obtener tarea por ID
   */
  obtenerPorId: async (id) => {
    const response = await axiosInstance.get(`/tareas/${id}`); // ✅ Corregido
    return response.data;
  },

  /**
   * Crear nueva tarea (solo Admin)
   */
  crear: async (tarea) => {
    const response = await axiosInstance.post('/tareas', tarea);
    return response.data;
  },

  /**
   * Actualizar tarea (solo Admin)
   */
  actualizar: async (id, tarea) => {
    const response = await axiosInstance.put(`/tareas/${id}`, tarea); // ✅ Corregido
    return response.data;
  },

  /**
   * Eliminar tarea (solo Admin)
   */
  eliminar: async (id) => {
    await axiosInstance.delete(`/tareas/${id}`); // ✅ Corregido
  },

  /**
   * Tomar una tarea en un día específico
   * @param {number} tareaId - ID de la tarea
   * @param {object} data - { dia: 'LUNES', usuarioId: '11111111-1', usuarioNombre: 'Juan' }
   */
  tomarTarea: async (tareaId, data) => {
    const response = await axiosInstance.post(`/tareas/${tareaId}/tomar`, data); // ✅ Corregido
    return response.data;
  },

  /**
   * Completar una tarea con foto de evidencia
   * @param {number} asignacionId - ID de la asignación
   * @param {string} fotoUri - URL de la foto subida
   */
  completarTarea: async (asignacionId, fotoUri) => {
    const response = await axiosInstance.put(
      `/tareas/asignaciones/${asignacionId}/completar`,
      { fotoUri }
    );
    return response.data;
  },

  /**
   * Aprobar una tarea completada (Admin/Supervisor)
   */
  aprobarTarea: async (asignacionId) => {
    const response = await axiosInstance.put(
      `/tareas/asignaciones/${asignacionId}/aprobar`
    );
    return response.data;
  },

  /**
   * Rechazar una tarea completada (Admin/Supervisor)
   * @param {number} asignacionId - ID de la asignación
   * @param {string} comentario - Motivo del rechazo
   */
  rechazarTarea: async (asignacionId, comentario) => {
    const response = await axiosInstance.put(
      `/tareas/asignaciones/${asignacionId}/rechazar`,
      { comentario }
    );
    return response.data;
  },

  /**
   * Obtener tareas pendientes de aprobación (Admin/Supervisor)
   */
  obtenerPendientesAprobacion: async () => {
    const response = await axiosInstance.get('/tareas/pendientes-aprobacion');
    return response.data;
  },

  /**
   * Liberar una tarea asignada (cancelar asignación)
   */
  liberarTarea: async (asignacionId) => {
    await axiosInstance.delete(`/tareas/asignaciones/${asignacionId}`); // ✅ Corregido
  },

  /**
   * Obtener todas las asignaciones de tareas
   * (Este método depende de si tu backend lo tiene implementado)
   */
  obtenerTodasAsignaciones: async () => {
    // Si tu backend tiene este endpoint:
    // const response = await axiosInstance.get('/tareas/asignaciones');
    // return response.data;
    
    // Si NO lo tienes, puedes retornar un array vacío por ahora
    // y las asignaciones se irán llenando cuando el usuario tome tareas
    return [];
  },

  /**
   * Obtener mis tareas asignadas (como usuario actual)
   * Este método asume que el backend filtra por el usuario autenticado
   */
  obtenerMisTareas: async () => {
    // Si tu backend tiene este endpoint:
    // const response = await axiosInstance.get('/tareas/mis-tareas');
    // return response.data;
    
    // Si NO lo tienes, usa obtenerTodasAsignaciones y filtra en el frontend
    const todasAsignaciones = await tareaService.obtenerTodasAsignaciones();
    return todasAsignaciones;
  },
};

export default tareaService;