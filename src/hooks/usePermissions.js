import { useAuth } from '../context/authContext';

/**
 * Hook personalizado para verificar permisos de usuario
 * 
 * Uso:
 * const { canView, canEdit, canDelete, isAdmin, isSupervisor, isArrendatario } = usePermissions();
 */
export const usePermissions = () => {
  const { user } = useAuth();

  if (!user) {
    return {
      canView: () => false,
      canEdit: () => false,
      canDelete: () => false,
      isAdmin: false,
      isSupervisor: false,
      isArrendatario: false,
    };
  }

  const isAdmin = user.role === 'admin' && (user.rol === 'ADMINISTRADOR');
  const isSupervisor = user.role === 'admin' && (user.rol === 'SUPERVISOR');
  const isArrendatario = user.role === 'arrendatario';

  // Permisos para USUARIOS
  const usuariosPermisos = {
    view: isAdmin || isSupervisor, // Admin y Supervisor pueden ver
    edit: isAdmin,                  // Solo Admin puede editar
    delete: isAdmin,                // Solo Admin puede eliminar
    create: isAdmin,                // Solo Admin puede crear
  };

  // Permisos para TAREAS
  const tareasPermisos = {
    view: true,                     // Todos pueden ver
    create: isAdmin,                // Solo Admin puede crear
    edit: isAdmin,                  // Solo Admin puede editar
    delete: isAdmin,                // Solo Admin puede eliminar
    tomar: true,                    // Todos pueden tomar tareas
    completar: true,                // Todos pueden completar
    aprobar: isAdmin || isSupervisor, // Admin y Supervisor pueden aprobar
    rechazar: isAdmin || isSupervisor, // Admin y Supervisor pueden rechazar
  };

  // Permisos para FINANZAS
  const finanzasPermisos = {
    view: true,                     // Todos pueden ver (restringido a sus datos)
    viewAll: isAdmin || isSupervisor, // Admin y Supervisor ven todo
    edit: isAdmin,                  // Solo Admin puede editar
    delete: isAdmin,                // Solo Admin puede eliminar
    create: isAdmin,                // Solo Admin puede crear
  };

  return {
    // Verificadores generales
    isAdmin,
    isSupervisor,
    isArrendatario,

    // Permisos específicos por módulo
    usuarios: usuariosPermisos,
    tareas: tareasPermisos,
    finanzas: finanzasPermisos,

    // Funciones helper
    canView: (modulo) => {
      switch(modulo) {
        case 'usuarios':
          return usuariosPermisos.view;
        case 'tareas':
          return tareasPermisos.view;
        case 'finanzas':
          return finanzasPermisos.view;
        default:
          return false;
      }
    },

    canEdit: (modulo) => {
      switch(modulo) {
        case 'usuarios':
          return usuariosPermisos.edit;
        case 'tareas':
          return tareasPermisos.edit;
        case 'finanzas':
          return finanzasPermisos.edit;
        default:
          return false;
      }
    },

    canDelete: (modulo) => {
      switch(modulo) {
        case 'usuarios':
          return usuariosPermisos.delete;
        case 'tareas':
          return tareasPermisos.delete;
        case 'finanzas':
          return finanzasPermisos.delete;
        default:
          return false;
      }
    },

    canCreate: (modulo) => {
      switch(modulo) {
        case 'usuarios':
          return usuariosPermisos.create;
        case 'tareas':
          return tareasPermisos.create;
        case 'finanzas':
          return finanzasPermisos.create;
        default:
          return false;
      }
    },
  };
};

export default usePermissions;