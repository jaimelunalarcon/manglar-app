import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Modal, Form, Spinner, Alert, Badge, Card } from 'react-bootstrap';
import tareaService from '../../api/tareaService';
import { useAuth } from '../../context/authContext';

// Días de la semana
const DIAS = [
  { key: 'LUNES', label: 'Lunes' },
  { key: 'MARTES', label: 'Martes' },
  { key: 'MIERCOLES', label: 'Miércoles' },
  { key: 'JUEVES', label: 'Jueves' },
  { key: 'VIERNES', label: 'Viernes' },
  { key: 'SABADO', label: 'Sábado' },
  { key: 'DOMINGO', label: 'Domingo' },
];

function Tareas() {
  const { user } = useAuth();

  // Estado de tareas disponibles (catálogo)
  const [tareas, setTareas] = useState([]);
  const [loadingTareas, setLoadingTareas] = useState(true);
  const [alertMessage, setAlertMessage] = useState({ show: false, message: '', variant: '' });

  // Estado de mis tareas asignadas
  const [misTareas, setMisTareas] = useState([]);
  const [loadingMisTareas, setLoadingMisTareas] = useState(false);

  // Estado para toma de tareas semanal (desde backend)
  const [asignacionesSemana, setAsignacionesSemana] = useState({});

  // Modal de reglas
  const [showReglasModal, setShowReglasModal] = useState(false);
  const [tareaReglasActual, setTareaReglasActual] = useState(null);

  // Modal de completar tarea
  const [showCompletarModal, setShowCompletarModal] = useState(false);
  const [tareaACompletar, setTareaACompletar] = useState(null);
  const [fotoTarea, setFotoTarea] = useState(null);

  // Nombre del usuario actual
  const usuarioNombreActual = useMemo(() => {
    if (!user) return 'Anónimo';
    return user.nombre || user.name || user.username || user.email || 'Usuario';
  }, [user]);

  const usuarioIdActual = useMemo(() => {
    if (!user) return null;
    return user.rut || user.username || user.email || null;
  }, [user]);

  // Utilidades
  const mostrarAlerta = (message, variant = 'success') => {
    setAlertMessage({ show: true, message, variant });
    setTimeout(() => {
      setAlertMessage({ show: false, message: '', variant: '' });
    }, 3000);
  };

  // Cargar tareas disponibles
  const cargarTareas = async () => {
    try {
      setLoadingTareas(true);
      const data = await tareaService.obtenerTodas();
      setTareas(data);
    } catch (err) {
      console.error(err);
      mostrarAlerta('No se pudieron cargar las tareas', 'danger');
    } finally {
      setLoadingTareas(false);
    }
  };

  // Cargar mis tareas asignadas
  const cargarMisTareas = async () => {
    try {
      setLoadingMisTareas(true);
      // Este endpoint debería devolver las tareas asignadas al usuario actual
      // Ajusta según tu backend: puede ser /api/tareas/mis-tareas o filtrar por usuario
      
      // OPCIÓN 1: Si tienes un endpoint específico
      // const data = await tareaService.obtenerMisTareas();
      
      // OPCIÓN 2: Si no tienes endpoint, filtra del lado del cliente (temporal)
      const todasAsignaciones = await tareaService.obtenerTodasAsignaciones();
      const misAsignaciones = todasAsignaciones.filter(
        asig => asig.usuarioId === usuarioIdActual
      );
      
      setMisTareas(misAsignaciones);
    } catch (err) {
      console.error(err);
      // No mostrar error si es la primera vez
    } finally {
      setLoadingMisTareas(false);
    }
  };

  useEffect(() => {
    cargarTareas();
    cargarMisTareas();
  }, []);

  // Calcular disponibilidad restante de una tarea
  const disponibilidadRestante = (tarea) => {
    const porTarea = asignacionesSemana[tarea.id] || {};
    const usadas = Object.keys(porTarea).length;
    return Math.max(0, (tarea.disponibilidad || 0) - usadas);
  };

  // Tomar una tarea en un día específico
  const handleTomarTareaDia = async (tarea, diaKey) => {
    if (!user || !usuarioIdActual) {
      alert('Debes iniciar sesión para tomar una tarea');
      return;
    }

    // Verificar si ya está asignada ese día
    const porTarea = asignacionesSemana[tarea.id] || {};
    if (porTarea[diaKey]) {
      alert('Esta tarea ya está asignada en este día');
      return;
    }

    if (disponibilidadRestante(tarea) <= 0) {
      alert('No hay disponibilidad para esta tarea esta semana');
      return;
    }

    try {
      // Llamar al backend para tomar la tarea
      const response = await tareaService.tomarTarea(tarea.id, {
        dia: diaKey,
        usuarioId: usuarioIdActual,
        usuarioNombre: usuarioNombreActual,
      });

      // Actualizar estado local
      setAsignacionesSemana((prev) => {
        const copia = { ...prev };
        const actualPorTarea = copia[tarea.id] ? { ...copia[tarea.id] } : {};

        actualPorTarea[diaKey] = {
          asignacionId: response.id, // ID de la asignación del backend
          usuarioId: usuarioIdActual,
          usuarioNombre: usuarioNombreActual,
        };

        copia[tarea.id] = actualPorTarea;
        return copia;
      });

      mostrarAlerta('Tarea tomada exitosamente', 'success');
      cargarMisTareas(); // Recargar mis tareas
    } catch (err) {
      console.error(err);
      mostrarAlerta(err.response?.data?.message || 'No se pudo tomar la tarea', 'danger');
    }
  };

  // Liberar una tarea (solo las mías)
  const handleLiberarTareaDia = async (tareaId, diaKey, asignacionId) => {
    if (!window.confirm('¿Seguro que deseas liberar esta tarea?')) {
      return;
    }

    try {
      // Llamar al backend para liberar
      await tareaService.liberarTarea(asignacionId);

      // Actualizar estado local
      setAsignacionesSemana((prev) => {
        const copia = { ...prev };
        const porTarea = copia[tareaId];
        if (!porTarea || !porTarea[diaKey]) return prev;

        const nuevoPorTarea = { ...porTarea };
        delete nuevoPorTarea[diaKey];

        if (Object.keys(nuevoPorTarea).length === 0) {
          delete copia[tareaId];
        } else {
          copia[tareaId] = nuevoPorTarea;
        }
        return copia;
      });

      mostrarAlerta('Tarea liberada exitosamente', 'success');
      cargarMisTareas(); // Recargar mis tareas
    } catch (err) {
      console.error(err);
      mostrarAlerta('No se pudo liberar la tarea', 'danger');
    }
  };

  // Mostrar reglas de una tarea
  const handleMostrarReglas = (tarea) => {
    setTareaReglasActual(tarea);
    setShowReglasModal(true);
  };

  // Abrir modal para completar tarea
  const handleAbrirCompletarModal = (asignacion) => {
    setTareaACompletar(asignacion);
    setFotoTarea(null);
    setShowCompletarModal(true);
  };

  // Completar tarea con foto
  const handleCompletarTarea = async () => {
    if (!fotoTarea) {
      alert('Debes subir una foto de evidencia');
      return;
    }

    try {
      // Aquí deberías subir la foto a tu servidor/storage y obtener la URL
      // Por ahora simulamos con una URL
      const fotoUri = 'https://ejemplo.com/foto-tarea.jpg'; // Reemplazar con tu lógica de upload

      await tareaService.completarTarea(tareaACompletar.id, fotoUri);

      mostrarAlerta('Tarea completada exitosamente', 'success');
      setShowCompletarModal(false);
      cargarMisTareas();
    } catch (err) {
      console.error(err);
      mostrarAlerta('No se pudo completar la tarea', 'danger');
    }
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return <Badge bg="warning">Pendiente</Badge>;
      case 'COMPLETADA':
        return <Badge bg="info">En revisión</Badge>;
      case 'APROBADA':
        return <Badge bg="success">Aprobada</Badge>;
      case 'RECHAZADA':
        return <Badge bg="danger">Rechazada</Badge>;
      default:
        return <Badge bg="secondary">{estado}</Badge>;
    }
  };

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">
        <i className="bi bi-check2-square me-2"></i>
        Mis Tareas
      </h2>

      {/* Alertas */}
      {alertMessage.show && (
        <Alert
          variant={alertMessage.variant}
          dismissible
          onClose={() => setAlertMessage({ show: false, message: '', variant: '' })}
        >
          {alertMessage.message}
        </Alert>
      )}

      {/* Info del usuario */}
      <Alert variant="info" className="mb-4">
        <i className="bi bi-person-circle me-2"></i>
        Usuario: <strong>{usuarioNombreActual}</strong>
      </Alert>

      {/* Sección: Mis tareas asignadas */}
      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">
            <i className="bi bi-list-check me-2"></i>
            Mis Tareas Asignadas
          </h4>
        </Card.Header>
        <Card.Body>
          {loadingMisTareas ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" />
            </div>
          ) : misTareas.length === 0 ? (
            <Alert variant="secondary" className="mb-0">
              No tienes tareas asignadas actualmente.
            </Alert>
          ) : (
            <div className="row g-3">
              {misTareas.map((asignacion) => {
                const tarea = tareas.find(t => t.id === asignacion.tareaId);
                return (
                  <div key={asignacion.id} className="col-md-6 col-lg-4">
                    <Card>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Card.Title className="mb-0">
                            {tarea?.nombre || 'Tarea desconocida'}
                          </Card.Title>
                          {getEstadoBadge(asignacion.estado)}
                        </div>
                        <div className="mb-2">
                          <Badge bg="primary">{asignacion.dia}</Badge>
                          <span className="ms-2 text-muted small">
                            {tarea?.puntos || 0} puntos
                          </span>
                        </div>
                        <small className="text-muted">
                          Asignada: {new Date(asignacion.fechaAsignacion).toLocaleDateString()}
                        </small>

                        {asignacion.comentarioRechazo && (
                          <Alert variant="danger" className="mt-2 mb-0 small">
                            <strong>Rechazada:</strong> {asignacion.comentarioRechazo}
                          </Alert>
                        )}

                        <div className="mt-3 d-flex gap-2">
                          {asignacion.estado === 'PENDIENTE' && (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleAbrirCompletarModal(asignacion)}
                                className="flex-grow-1"
                              >
                                <i className="bi bi-check-circle me-1"></i>
                                Completar
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() => handleLiberarTareaDia(
                                  asignacion.tareaId,
                                  asignacion.dia,
                                  asignacion.id
                                )}
                              >
                                <i className="bi bi-x-circle"></i>
                              </Button>
                            </>
                          )}

                          {asignacion.estado === 'COMPLETADA' && (
                            <Badge bg="info" className="w-100 py-2">
                              Esperando aprobación
                            </Badge>
                          )}

                          {asignacion.estado === 'APROBADA' && (
                            <Badge bg="success" className="w-100 py-2">
                              <i className="bi bi-check-circle me-1"></i>
                              Aprobada
                            </Badge>
                          )}

                          {asignacion.estado === 'RECHAZADA' && (
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleAbrirCompletarModal(asignacion)}
                              className="w-100"
                            >
                              Volver a completar
                            </Button>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Sección: Tomar tareas disponibles */}
      <Card>
        <Card.Header className="bg-success text-white">
          <h4 className="mb-0">
            <i className="bi bi-calendar-week me-2"></i>
            Tareas Disponibles por Día
          </h4>
        </Card.Header>
        <Card.Body>
          {loadingTareas ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-2">Cargando tareas...</p>
            </div>
          ) : tareas.length === 0 ? (
            <Alert variant="secondary" className="mb-0">
              No hay tareas configuradas.
            </Alert>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover className="mb-0">
                <thead className="table-success">
                  <tr className="text-center">
                    <th>Tarea</th>
                    <th>Pts</th>
                    <th>Disponible</th>
                    {DIAS.map((d) => (
                      <th key={d.key}>{d.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tareas.map((t) => {
                    const dispRestante = disponibilidadRestante(t);
                    return (
                      <tr key={t.id} className="text-center align-middle">
                        <td className="text-start">
                          <button
                            type="button"
                            className="btn btn-link p-0 text-primary"
                            style={{ textDecoration: 'underline' }}
                            onClick={() => handleMostrarReglas(t)}
                          >
                            {t.nombre}
                          </button>
                        </td>
                        <td>{t.puntos}</td>
                        <td>
                          <Badge bg={dispRestante > 0 ? 'success' : 'secondary'}>
                            {dispRestante}
                          </Badge>
                        </td>

                        {DIAS.map((d) => {
                          const porTarea = asignacionesSemana[t.id] || {};
                          const asignacion = porTarea[d.key];

                          if (asignacion) {
                            const esMia = asignacion.usuarioId === usuarioIdActual;
                            return (
                              <td key={d.key}>
                                <Badge bg={esMia ? 'primary' : 'secondary'}>
                                  {asignacion.usuarioNombre}
                                  {esMia && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-link text-white ms-1 p-0"
                                      onClick={() => handleLiberarTareaDia(
                                        t.id,
                                        d.key,
                                        asignacion.asignacionId
                                      )}
                                      title="Liberar tarea"
                                    >
                                      ×
                                    </button>
                                  )}
                                </Badge>
                              </td>
                            );
                          }

                          const disabled = dispRestante <= 0;

                          return (
                            <td key={d.key}>
                              <input
                                className="form-check-input"
                                type="checkbox"
                                disabled={disabled}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    handleTomarTareaDia(t, d.key);
                                  }
                                }}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal: Ver reglas de tarea */}
      <Modal show={showReglasModal} onHide={() => setShowReglasModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-info-circle me-2"></i>
            Reglas: {tareaReglasActual?.nombre || ''}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {tareaReglasActual ? (
            <div>
              <p><strong>Puntos:</strong> {tareaReglasActual.puntos}</p>
              <p><strong>Disponibilidad semanal:</strong> {tareaReglasActual.disponibilidad}</p>
              <hr />
              <h6>Descripción:</h6>
              <p style={{ whiteSpace: 'pre-wrap' }}>
                {tareaReglasActual.reglas && tareaReglasActual.reglas.trim()
                  ? tareaReglasActual.reglas
                  : 'Esta tarea no tiene reglas definidas.'}
              </p>
            </div>
          ) : (
            <p>Cargando…</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReglasModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal: Completar tarea */}
      <Modal show={showCompletarModal} onHide={() => setShowCompletarModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-camera me-2"></i>
            Completar Tarea
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <i className="bi bi-info-circle me-2"></i>
            Debes subir una foto de evidencia para completar la tarea.
          </Alert>

          <Form.Group>
            <Form.Label>Subir Foto de Evidencia *</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => setFotoTarea(e.target.files[0])}
            />
            <Form.Text className="text-muted">
              Formatos aceptados: JPG, PNG. Máximo 5MB.
            </Form.Text>
          </Form.Group>

          {fotoTarea && (
            <Alert variant="success" className="mt-3 mb-0">
              <i className="bi bi-check-circle me-2"></i>
              Archivo seleccionado: {fotoTarea.name}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCompletarModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={handleCompletarTarea}
            disabled={!fotoTarea}
          >
            <i className="bi bi-check-circle me-1"></i>
            Completar Tarea
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Tareas;