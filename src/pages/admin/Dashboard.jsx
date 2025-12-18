// src/pages/admin/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import "../../Dashboard.css";
import useReveal from "../../hooks/useReveal";
import WeekRange from "../../components/WeekRange";
import tareaService from "../../api/tareaService";
import { useAuth } from "../../context/authContext";
import dayjs from "dayjs";

export default function DashboardAdminTareas() {
  useReveal({ step: 120 });
  const { user } = useAuth();

  const [asignacionesAdmin, setAsignacionesAdmin] = useState([]);
  const [asignacionesUsuario, setAsignacionesUsuario] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  // Modal evidencia (Mis tareas)
  const [showEvidenciaModal, setShowEvidenciaModal] = useState(false);
  const [asignacionEvidencia, setAsignacionEvidencia] = useState(null);
  const [inputEvidencia, setInputEvidencia] = useState("");
  const [savingEvidencia, setSavingEvidencia] = useState(false);

  // Modal revisión (Admin)
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [asignacionRevision, setAsignacionRevision] = useState(null);
  const [accionLoading, setAccionLoading] = useState(false);
  const [accionError, setAccionError] = useState("");

  // -------- Identificadores de usuario --------
  const usuarioIdActual = useMemo(() => {
    if (!user) return null;
    return user.id || user.rut || user.username || user.email || null;
  }, [user]);

  const nombreUsuarioActual = useMemo(() => {
    if (!user) return "Usuario";
    return user.nombre || user.name || user.username || user.email || "Usuario";
  }, [user]);

  // --- Fecha lógica por día de semana ---
  const DIA_INDEX = {
    LUNES: 0,
    MARTES: 1,
    MIERCOLES: 2,
    JUEVES: 3,
    VIERNES: 4,
    SABADO: 5,
    DOMINGO: 6,
  };

  // Lunes y Domingo de la semana actual (en hora local)
  const getSemanaActualRange = () => {
    const now = dayjs();
    const offsetDesdeLunes = (now.day() + 6) % 7; // 0=lunes ... 6=domingo
    const lunes = now.subtract(offsetDesdeLunes, "day").startOf("day");
    const domingo = lunes.add(6, "day").endOf("day");
    return { lunes, domingo };
  };

  /**
   * Fecha lógica de la asignación según su "dia" (LUNES..DOMINGO) y la semana de fechaAsignacion
   */
  const obtenerFechaLogicaSemana = (asignacion) => {
    if (!asignacion?.fechaAsignacion) return null;

    const base = dayjs(asignacion.fechaAsignacion);

    // semana de "base" -> sacamos lunes de esa semana
    const offsetDesdeLunes = (base.day() + 6) % 7;
    const lunesSemana = base.subtract(offsetDesdeLunes, "day").startOf("day");

    const diaKey = String(asignacion.dia || "").toUpperCase();
    const indexDia = DIA_INDEX[diaKey];
    if (indexDia == null) return base;

    return lunesSemana.add(indexDia, "day").startOf("day");
  };

  // --- Helpers de tiempo / fecha ---
  const calcularHorasRestantes = (asignacion) => {
    if (!asignacion?.fechaAsignacion) return null;

    const fechaLogica =
      obtenerFechaLogicaSemana(asignacion) || dayjs(asignacion.fechaAsignacion);

    const inicioDia = fechaLogica.startOf("day").add(1, "minute"); // 00:01
    const deadline = inicioDia.add(36, "hour");
    const ahora = dayjs();

    return deadline.diff(ahora, "hour");
  };

  const formatearFechaCorta = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const año = String(d.getFullYear()).slice(-2);
    return `${dia}-${mes}-${año}`;
  };

  const getEstadoBadgeClass = (estado, horasRestantes) => {
    if (estado === "APROBADA") return "bg-success";
    if (estado === "PENDIENTE_APROBACION") return "bg-warning text-dark";
    if (estado === "RECHAZADA" || estado === "NO_CUMPLIDA") return "bg-danger";

    if (estado === "TOMADA") {
      if (horasRestantes != null && horasRestantes <= 0) return "bg-danger";
      return "bg-warning text-dark";
    }
    return "bg-secondary";
  };

  const getCardBorderClass = (estado, horasRestantes) => {
    switch (estado) {
      case "APROBADA":
        return "card-tarea state-aprobada";
      case "PENDIENTE_APROBACION":
        return "card-tarea state-pendiente-aprobacion";
      case "RECHAZADA":
      case "NO_CUMPLIDA":
        return "card-tarea state-no-cumplida";
      case "TOMADA":
      default:
        if (horasRestantes != null && horasRestantes <= 0)
          return "card-tarea state-no-cumplida";
        return "card-tarea state-tomada";
    }
  };

  const getEstadoTexto = (estado, horasRestantes) => {
    switch (estado) {
      case "APROBADA":
        return "Aprobada";
      case "PENDIENTE_APROBACION":
        return "Pendiente de aprobación";
      case "RECHAZADA":
      case "NO_CUMPLIDA":
        return "No cumplida";
      case "TOMADA":
      default:
        if (horasRestantes != null && horasRestantes <= 0)
          return "No cumplida (vencida)";
        return "Tomada";
    }
  };

  // --- Filtrado por estado (después del filtrado por semana) ---
  const asignacionesAdminFiltradas = useMemo(() => {
    if (filtroEstado === "TODOS") return asignacionesAdmin;
    return asignacionesAdmin.filter((a) => a.estado === filtroEstado);
  }, [asignacionesAdmin, filtroEstado]);

  // --- Carga de datos desde la API + FILTRO POR SEMANA ACTUAL ---
  const cargarAsignaciones = async () => {
    if (!user) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const todas = await tareaService.obtenerAsignaciones();

      const { lunes, domingo } = getSemanaActualRange();

      // ✅ filtramos por fecha lógica (según "dia") dentro de la semana actual
      const deEstaSemana = (todas || []).filter((a) => {
        const fechaLogica = obtenerFechaLogicaSemana(a) || dayjs(a.fechaAsignacion);
        const ts = fechaLogica.valueOf();
        return ts >= lunes.valueOf() && ts <= domingo.valueOf();
      });

      setAsignacionesAdmin(deEstaSemana);

      if (usuarioIdActual) {
        const mias = deEstaSemana.filter(
          (a) => String(a.usuarioId) === String(usuarioIdActual)
        );

        // debug opcional
        window.__asignacionesAdmin = deEstaSemana;
        window.__asignacionesUsuario = mias;
        window.__usuarioIdActual = usuarioIdActual;
        window.__semanaActual = {
          lunes: lunes.format("YYYY-MM-DD"),
          domingo: domingo.format("YYYY-MM-DD"),
        };

        setAsignacionesUsuario(mias);
      } else {
        setAsignacionesUsuario([]);
      }
    } catch (err) {
      console.error("❌ Error en cargarAsignaciones:", err);
      setErrorMsg(
        err?.message ||
          err?.response?.data?.message ||
          err?.response?.data ||
          "Error al obtener asignaciones"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAsignaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, usuarioIdActual]);

  const actualizarAsignacionEnState = (actualizada) => {
    setAsignacionesAdmin((prev) =>
      prev.map((a) => (a.id === actualizada.id ? actualizada : a))
    );
    setAsignacionesUsuario((prev) =>
      prev.map((a) => (a.id === actualizada.id ? actualizada : a))
    );
  };

  // --- Evidencia ---
  const abrirModalEvidencia = (asignacion) => {
    setAsignacionEvidencia(asignacion);
    setInputEvidencia(asignacion.fotoConfirmacion || "");
    setShowEvidenciaModal(true);
  };

  const cerrarModalEvidencia = () => {
    setShowEvidenciaModal(false);
    setAsignacionEvidencia(null);
    setInputEvidencia("");
    setSavingEvidencia(false);
  };

  const handleGuardarEvidencia = async () => {
    if (!asignacionEvidencia) return;
    setSavingEvidencia(true);
    try {
      const resp = await tareaService.completarTarea(
        asignacionEvidencia.id,
        inputEvidencia || "Evidencia enviada"
      );
      actualizarAsignacionEnState(resp);
      cerrarModalEvidencia();
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar la evidencia");
      setSavingEvidencia(false);
    }
  };

  // --- Revisión admin ---
  const abrirModalRevision = (asignacion) => {
    setAsignacionRevision(asignacion);
    setAccionError("");
    setShowRevisionModal(true);
  };

  const cerrarModalRevision = () => {
    setShowRevisionModal(false);
    setAsignacionRevision(null);
    setAccionLoading(false);
    setAccionError("");
  };

  const handleAprobar = async () => {
    if (!asignacionRevision) return;
    setAccionLoading(true);
    setAccionError("");

    try {
      const resp = await tareaService.aprobarAsignacion(asignacionRevision.id);
      actualizarAsignacionEnState(resp);
      cerrarModalRevision();
    } catch (err) {
      console.error(err);
      setAccionError("No se pudo aprobar la asignación");
      setAccionLoading(false);
    }
  };

  const handleMarcarNoCumplida = async () => {
    if (!asignacionRevision) return;
    setAccionLoading(true);
    setAccionError("");

    try {
      const resp = await tareaService.marcarNoCumplida(asignacionRevision.id);
      actualizarAsignacionEnState(resp);
      cerrarModalRevision();
    } catch (err) {
      console.error(err);
      setAccionError("No se pudo marcar como no cumplida");
      setAccionLoading(false);
    }
  };

  // ------------ Render ------------
  return (
    <div className="dashboard-admin">
      <div className="header-section">
        <h1 className="mt-3">
          <i className="bi bi-speedometer2 me-2" aria-hidden="true"></i>
          Dashboard
        </h1>
        <p className="subtitle mb-5">
          <i className="bi bi-calendar me-3" aria-hidden="true"></i>
          <WeekRange startOn="monday" />
        </p>
      </div>

      {errorMsg && (
        <div className="alert alert-danger" role="alert">
          {errorMsg}
        </div>
      )}

      {/* --------- Tareas Arrendatarios --------- */}
      <section className="border p-3 rounded bg-white mb-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Tareas Arrendatarios</h2>

          <div>
            <label className="me-2 small text-muted">Filtrar por estado:</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="form-select form-select-sm d-inline-block"
              style={{ width: "220px" }}
            >
              <option value="TODOS">Todos</option>
              <option value="TOMADA">Tomadas</option>
              <option value="PENDIENTE_APROBACION">Pendiente de aprobación</option>
              <option value="APROBADA">Aprobadas</option>
              <option value="NO_CUMPLIDA">No cumplidas</option>
              <option value="RECHAZADA">Rechazadas</option>
            </select>
          </div>
        </div>

        {loading && <p className="text-muted">Cargando asignaciones...</p>}

        {!loading && asignacionesAdminFiltradas.length === 0 && (
          <p className="text-muted">
            No hay tareas asignadas (semana actual) con este filtro.
          </p>
        )}

        {!loading &&
          asignacionesAdminFiltradas.map((a) => {
            const fechaLogica = obtenerFechaLogicaSemana(a);
            const horasRestantes = calcularHorasRestantes(a);
            const estadoTexto = getEstadoTexto(a.estado, horasRestantes);
            const badgeClass = getEstadoBadgeClass(a.estado, horasRestantes);
            const cardClass = getCardBorderClass(a.estado, horasRestantes);

            return (
              <Card key={a.id} className={`mb-3 ${cardClass} reveal`}>
                <Card.Body className="shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div>
                        <strong>{a.tarea?.nombre || "Tarea sin nombre"}</strong>{" "}
                        {a.usuarioNombre && (
                          <>
                            / <strong>{a.usuarioNombre}</strong>
                          </>
                        )}
                      </div>

                      <div className="text-muted small">
                        {formatearFechaCorta(
                          (fechaLogica || dayjs(a.fechaAsignacion)).toISOString()
                        )}{" "}
                        {horasRestantes != null && (
                          <>
                            /{" "}
                            <span
                              className={
                                horasRestantes <= 0 ? "text-danger" : "text-success"
                              }
                            >
                              {horasRestantes <= 0
                                ? "Plazo vencido"
                                : `Quedan ${horasRestantes} hrs`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-end">
                      <span className={`badge rounded-pill ${badgeClass}`}>
                        {estadoTexto}
                      </span>
                    </div>
                  </div>

                  {a.estado === "PENDIENTE_APROBACION" && (
                    <div className="mt-3 text-end">
                      <Button
                        size="sm"
                        variant="primary"
                        className="rounded-pill"
                        onClick={() => abrirModalRevision(a)}
                      >
                        Revisar evidencia
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            );
          })}
      </section>

      {/* --------- Mis Tareas --------- */}
      <section className="border p-3 rounded bg-white">
        <h2 className="mb-3">Mis Tareas</h2>

        {!usuarioIdActual && (
          <p className="text-muted">
            No se pudo determinar el identificador del usuario actual.
          </p>
        )}

        {usuarioIdActual && asignacionesUsuario.length === 0 && !loading && (
          <p className="text-muted">Aún no tienes tareas asignadas esta semana.</p>
        )}

        {usuarioIdActual &&
          asignacionesUsuario.map((a) => {
            const fechaLogica = obtenerFechaLogicaSemana(a);
            const horasRestantes = calcularHorasRestantes(a);
            const estadoTexto = getEstadoTexto(a.estado, horasRestantes);
            const badgeClass = getEstadoBadgeClass(a.estado, horasRestantes);
            const cardClass = getCardBorderClass(a.estado, horasRestantes);

            return (
              <Card key={a.id} className={`mb-3 ${cardClass} reveal`}>
                <Card.Body className="shadow-sm">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div>
                        <strong>{a.tarea?.nombre || "Tarea sin nombre"}</strong>
                      </div>

                      <div className="text-muted small">
                        {formatearFechaCorta(
                          (fechaLogica || dayjs(a.fechaAsignacion)).toISOString()
                        )}{" "}
                        {horasRestantes != null && (
                          <>
                            /{" "}
                            <span
                              className={
                                horasRestantes <= 0 ? "text-danger" : "text-success"
                              }
                            >
                              {horasRestantes <= 0
                                ? "Plazo vencido"
                                : `Quedan ${horasRestantes} hrs`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-end">
                      <span className={`badge rounded-pill ${badgeClass}`}>
                        {estadoTexto}
                      </span>
                    </div>
                  </div>

                  {a.estado === "TOMADA" && horasRestantes > 0 && (
                    <div className="mt-3 text-end">
                      <Button
                        size="sm"
                        variant="success"
                        className="rounded-pill"
                        onClick={() => abrirModalEvidencia(a)}
                      >
                        Subir evidencia
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            );
          })}
      </section>

      {/* ---------- Modal SUBIR EVIDENCIA ---------- */}
      <Modal show={showEvidenciaModal} onHide={cerrarModalEvidencia}>
        <Modal.Header closeButton>
          <Modal.Title>Subir evidencia de tarea</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {asignacionEvidencia && (
            <>
              <p>
                <strong>Tarea:</strong>{" "}
                {asignacionEvidencia.tarea?.nombre || "Tarea sin nombre"}
                <br />
                <strong>Usuario:</strong> {nombreUsuarioActual}
              </p>
              <Form.Group className="mb-3">
                <Form.Label>Evidencia (texto / URL simulada)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ej: foto-patio-limpio.jpg o descripción"
                  value={inputEvidencia}
                  onChange={(e) => setInputEvidencia(e.target.value)}
                />
                <Form.Text className="text-muted">
                  Más adelante esto puede ser un upload real de imagen.
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModalEvidencia} disabled={savingEvidencia}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleGuardarEvidencia} disabled={savingEvidencia}>
            {savingEvidencia ? "Guardando..." : "Enviar evidencia"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ---------- Modal REVISIÓN ADMIN ---------- */}
      <Modal show={showRevisionModal} onHide={cerrarModalRevision} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Revisión de tarea</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {asignacionRevision ? (
            <>
              <p>
                <strong>Tarea:</strong>{" "}
                {asignacionRevision.tarea?.nombre || "Tarea sin nombre"}
                <br />
                <strong>Arrendatario:</strong>{" "}
                {asignacionRevision.usuarioNombre || asignacionRevision.usuarioId}
                <br />
                <strong>Fecha asignación:</strong>{" "}
                {formatearFechaCorta(asignacionRevision.fechaAsignacion)}
              </p>

              <hr />

              <h6>Evidencia enviada:</h6>
              {asignacionRevision.fotoConfirmacion ? (
                <>
                  {/\.(jpg|jpeg|png|webp|gif)$/i.test(asignacionRevision.fotoConfirmacion) ||
                  asignacionRevision.fotoConfirmacion.startsWith("http") ? (
                    <img
                      src={asignacionRevision.fotoConfirmacion}
                      alt="Evidencia"
                      className="img-fluid rounded mb-3"
                      style={{ maxHeight: "300px", objectFit: "cover" }}
                    />
                  ) : (
                    <p>{asignacionRevision.fotoConfirmacion}</p>
                  )}
                </>
              ) : (
                <p className="text-muted">No hay evidencia adjunta.</p>
              )}

              {accionError && (
                <div className="alert alert-danger mt-3" role="alert">
                  {accionError}
                </div>
              )}
            </>
          ) : (
            <p>Cargando…</p>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModalRevision} disabled={accionLoading}>
            Cerrar
          </Button>
          <Button
            variant="danger"
            onClick={handleMarcarNoCumplida}
            disabled={accionLoading || !asignacionRevision}
          >
            {accionLoading ? "Procesando..." : "Marcar NO cumplida"}
          </Button>
          <Button
            variant="success"
            onClick={handleAprobar}
            disabled={accionLoading || !asignacionRevision}
          >
            {accionLoading ? "Procesando..." : "Aprobar tarea"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
