import React, { useEffect, useState, useMemo } from 'react';
import { Table, Button, Modal, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import tareaService from '../../api/tareaService';
import { useAuth } from '../../context/AuthContext'; // ajusta ruta si es distinta

// Días de la semana (clave lógica + etiqueta)
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
  const { user } = useAuth(); // p.ej. { username, name, role }

  // ---------- Estado catálogo de tareas ----------
  const [tareas, setTareas] = useState([]);
  const [loadingTareas, setLoadingTareas] = useState(true);
  const [errorTareas, setErrorTareas] = useState('');
  const [alertMessage, setAlertMessage] = useState({ show: false, message: '', variant: '' });

  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [tareaActual, setTareaActual] = useState({
    id: null,
    nombre: '',
    puntos: 0,
    disponibilidad: 1,
    reglas: '',
  });
  const [errores, setErrores] = useState({});

  // ---------- Estado para toma de tareas semanal (solo front de momento) ----------
  // estructura: { [tareaId]: { [diaKey]: { usuarioId, usuarioNombre } } }
  const [asignacionesSemana, setAsignacionesSemana] = useState({});

  // ---------- Estado para modal de reglas ----------
  const [showReglasModal, setShowReglasModal] = useState(false);
  const [tareaReglasActual, setTareaReglasActual] = useState(null);

  // helper: nombre a mostrar del usuario actual
  const usuarioNombreActual = useMemo(() => {
    if (!user) return 'Anónimo';
    // intenta usar user.name; si no existe, usa username o email
    return user.name || user.nombre || user.username || user.email || 'Usuario';
  }, [user]);

  const esAdmin = useMemo(() => {
    if (!user) return false;
    // adapta según tu AuthContext
    // si en AuthContext usas role: 'admin' / 'arrendatario'
    if (user.role) {
      return user.role.toLowerCase() === 'admin';
    }
    // si en backend envías rol tipo 'ADMINISTRADOR'
    if (user.rol) {
      return String(user.rol).toUpperCase() === 'ADMINISTRADOR';
    }
    return false;
  }, [user]);

  // ---------- Utilidades ----------
  const mostrarAlerta = (message, variant = 'success') => {
    setAlertMessage({ show: true, message, variant });
    setTimeout(() => {
      setAlertMessage({ show: false, message: '', variant: '' });
    }, 3000);
  };

  const cargarTareas = async () => {
    try {
      setLoadingTareas(true);
      setErrorTareas('');
      const data = await tareaService.obtenerTodas();
      setTareas(data);
    } catch (err) {
      console.error(err);
      setErrorTareas('No se pudieron cargar las tareas');
      mostrarAlerta('No se pudieron cargar las tareas', 'danger');
    } finally {
      setLoadingTareas(false);
    }
  };

  useEffect(() => {
    cargarTareas();
  }, []);

  // ---------- CRUD de tareas (tabla catálogo) ----------
  const handleNuevaTarea = () => {
    setModoEdicion(false);
    setTareaActual({
      id: null,
      nombre: '',
      puntos: 0,
      disponibilidad: 1,
      reglas: '',
    });
    setErrores({});
    setShowModal(true);
  };

  const handleEditarTarea = (t) => {
    setModoEdicion(true);
    setTareaActual({ ...t });
    setErrores({});
    setShowModal(true);
  };

  const handleEliminarTarea = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta tarea?')) return;
    try {
      await tareaService.eliminar(id);
      mostrarAlerta('Tarea eliminada exitosamente', 'success');
      // también limpiamos asignaciones de esa tarea
      setAsignacionesSemana((prev) => {
        const copia = { ...prev };
        delete copia[id];
        return copia;
      });
      cargarTareas();
    } catch (err) {
      console.error(err);
      mostrarAlerta('No se pudo eliminar la tarea', 'danger');
    }
  };

  const handleChangeTarea = (e) => {
    const { name, value } = e.target;
    if (name === 'puntos' || name === 'disponibilidad') {
      const num = parseInt(value, 10);
      setTareaActual((prev) => ({ ...prev, [name]: Number.isNaN(num) ? 0 : num }));
    } else {
      setTareaActual((prev) => ({ ...prev, [name]: value }));
    }

    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleGuardarTarea = async () => {
    const nuevosErrores = {};

    if (!tareaActual.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    }
    if (tareaActual.puntos < 0) {
      nuevosErrores.puntos = 'Los puntos no pueden ser negativos';
    }
    if (tareaActual.disponibilidad < 1) {
      nuevosErrores.disponibilidad = 'La disponibilidad debe ser al menos 1';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    try {
      if (modoEdicion && tareaActual.id != null) {
        await tareaService.actualizar(tareaActual.id, tareaActual);
        mostrarAlerta('Tarea actualizada exitosamente', 'success');
      } else {
        await tareaService.crear(tareaActual);
        mostrarAlerta('Tarea creada exitosamente', 'success');
      }
      setShowModal(false);
      cargarTareas();
    } catch (err) {
      console.error(err);
      mostrarAlerta('No se pudo guardar la tarea', 'danger');
    }
  };

  // ---------- Lógica de toma de tareas semanal (solo front de momento) ----------

  // cuántas veces está ya asignada una tarea en la semana actual (todos los días)
  const contarAsignacionesTarea = (tareaId) => {
    const porTarea = asignacionesSemana[tareaId];
    if (!porTarea) return 0;
    return Object.keys(porTarea).length;
  };

  const disponibilidadRestante = (tarea) => {
    const usadas = contarAsignacionesTarea(tarea.id);
    return Math.max(0, (tarea.disponibilidad || 0) - usadas);
  };

  const handleTomarTareaDia = (tarea, diaKey) => {
    if (!user) {
      alert('Debes iniciar sesión para tomar una tarea');
      return;
    }

    // si ya está asignada ese día, no hacemos nada (en UI se muestra badge)
    const porTarea = asignacionesSemana[tarea.id] || {};
    if (porTarea[diaKey]) {
      return;
    }

    if (disponibilidadRestante(tarea) <= 0) {
      alert('No hay disponibilidad para esta tarea esta semana');
      return;
    }

    setAsignacionesSemana((prev) => {
      const copia = { ...prev };
      const actualPorTarea = copia[tarea.id] ? { ...copia[tarea.id] } : {};

      actualPorTarea[diaKey] = {
        usuarioId: user.username || user.email || 'desconocido',
        usuarioNombre: usuarioNombreActual,
      };

      copia[tarea.id] = actualPorTarea;
      return copia;
    });
  };

  const handleLiberarTareaDia = (tareaId, diaKey) => {
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
  };

  // ---------- Mostrar reglas en modal ----------
  const handleMostrarReglas = (tarea) => {
    setTareaReglasActual(tarea);
    setShowReglasModal(true);
  };

  // ---------- Render ----------
  return (
    <div>
      <div className="header-section">
        <Button
          className="float-end rounded-pill btn btn-success mt-3"
          onClick={handleNuevaTarea}
        >
          + Nueva tarea
        </Button>
        <h1 className="mt-3">
          <i className="bi bi-check2-square me-2" aria-hidden="true"></i>
          Tareas
        </h1>
        {/* Aquí después puedes conectar WeekRange */}
        {/* <p className="mb-4 subtitle">
          <i className="bi bi-calendar me-3" aria-hidden="true"></i>
          Semana 20 oct - 26 oct
        </p> */}
      </div>

      {/* Alertas */}
      {alertMessage.show && (
        <Alert
          className="mt-3"
          variant={alertMessage.variant}
          dismissible
          onClose={() => setAlertMessage({ show: false, message: '', variant: '' })}
        >
          {alertMessage.message}
        </Alert>
      )}

      {/* ---------- Tabla de toma de tareas semanal ---------- */}
      <div className="p-4 mt-5 bg-white rounded border">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">Toma de tareas semanal</h3>
          <small className="text-muted">
            Usuario actual: <strong>{usuarioNombreActual}</strong>{' '}
            {esAdmin && <span className="badge bg-info ms-2">Admin</span>}
          </small>
        </div>

        {tareas.length === 0 ? (
          <div className="text-center text-muted">
            Primero configura tareas en el catálogo inferior.
          </div>
        ) : (
          <Table striped bordered hover responsive className="mb-0">
            <thead>
              <tr className="text-center">
                <th>N° disponible</th>
                <th>Tarea</th>
                <th>Pts</th>
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
                    <td>{dispRestante}</td>
                    <td className="text-start">
                      <button
                        type="button"
                        className="btn btn-link p-0 text-primary"
                        style={{ textDecoration: 'underline', cursor: 'pointer' }}
                        onClick={() => handleMostrarReglas(t)}
                      >
                        {t.nombre}
                      </button>
                    </td>
                    <td>{t.puntos}</td>

                    {DIAS.map((d) => {
                      const porTarea = asignacionesSemana[t.id] || {};
                      const asignacion = porTarea[d.key];

                      if (asignacion) {
                        return (
                          <td key={d.key}>
                            <Badge bg="primary">
                              {asignacion.usuarioNombre}
                              {esAdmin && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-link text-white ms-1 p-0"
                                  onClick={() => handleLiberarTareaDia(t.id, d.key)}
                                  title="Quitar tarea"
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
                              } else {
                                // si se desmarca y ya estaba asignada (raro en este flujo), la liberamos
                                handleLiberarTareaDia(t.id, d.key);
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
        )}
      </div>

      {/* ---------- Tabla listado de tareas (catálogo) ---------- */}
      <div className="p-4 bg-white rounded border mt-5 mb-4">
        <h3 className="mb-3">Listado de tareas</h3>

        {loadingTareas ? (
          <div className="text-center my-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
          </div>
        ) : errorTareas ? (
          <div className="text-center text-danger my-3">{errorTareas}</div>
        ) : (
          <Table striped bordered hover responsive className="mb-0">
            <thead>
              <tr className="text-center">
                <th>ID</th>
                <th>Nombre</th>
                <th>Puntos</th>
                <th>Disponibilidad semanal</th>
                <th>Reglas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tareas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center">
                    No hay tareas configuradas
                  </td>
                </tr>
              ) : (
                tareas.map((t) => (
                  <tr key={t.id} className="text-center">
                    <td>{t.id}</td>
                    <td>{t.nombre}</td>
                    <td>{t.puntos}</td>
                    <td>{t.disponibilidad}</td>
                    <td className="text-start">
                      {t.reglas ? t.reglas : <span className="text-muted">—</span>}
                    </td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditarTarea(t)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleEliminarTarea(t.id)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </div>

      {/* ---------- Modal crear / editar tarea ---------- */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modoEdicion ? 'Editar tarea' : 'Nueva tarea'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Nombre <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={tareaActual.nombre}
                onChange={handleChangeTarea}
                placeholder="Ej: Limpiar patio"
                isInvalid={!!errores.nombre}
              />
              <Form.Control.Feedback type="invalid">
                {errores.nombre}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Puntos <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                name="puntos"
                value={tareaActual.puntos}
                onChange={handleChangeTarea}
                min={0}
                isInvalid={!!errores.puntos}
              />
              <Form.Control.Feedback type="invalid">
                {errores.puntos}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Puntos que se ganan si se cumple (y se pierden si no se cumple).
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Disponibilidad semanal <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                name="disponibilidad"
                value={tareaActual.disponibilidad}
                onChange={handleChangeTarea}
                min={1}
                isInvalid={!!errores.disponibilidad}
              />
              <Form.Control.Feedback type="invalid">
                {errores.disponibilidad}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Número de veces que la tarea se puede tomar en una semana.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Reglas / descripción (opcional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="reglas"
                value={tareaActual.reglas || ''}
                onChange={handleChangeTarea}
                placeholder="Ej: Limpiar patio incluye sacar basura y regar..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleGuardarTarea}>
            {modoEdicion ? 'Actualizar' : 'Guardar'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ---------- Modal ver reglas de tarea ---------- */}
      <Modal show={showReglasModal} onHide={() => setShowReglasModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reglas de {tareaReglasActual.nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {tareaReglasActual ? (
            <>
              <p className="mt-3" style={{ whiteSpace: 'pre-wrap' }}>
                {tareaReglasActual.reglas && tareaReglasActual.reglas.trim()
                  ? tareaReglasActual.reglas
                  : 'Esta tarea no tiene reglas definidas.'}
              </p>
            </>
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
    </div>
  );
}

export default Tareas;