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

  // Filtro por estado (lista admin)
  const [filtroEstado, setFiltroEstado] = useState("TODOS");

  // Modal evidencia
  const [showEvidenciaModal, setShowEvidenciaModal] = useState(false);
  const [asignacionActual, setAsignacionActual] = useState(null);
  const [evidenciaTexto, setEvidenciaTexto] = useState("");

  const usuarioIdActual = useMemo(() => {
    if (!user) return null;
    return user.rut || user.username || user.email || user.id || null;
  }, [user]);

  const nombreUsuarioActual = useMemo(() => {
    if (!user) return "Usuario";
    return user.nombre || user.name || user.username || user.email || "Usuario";
  }, [user]);

  // --- Cálculo correcto de horas restantes (36h desde las 00:01 del día de asignación) ---
  const calcularHorasRestantes = (fechaAsignacionIso) => {
    if (!fechaAsignacionIso) return null;

    const asignacion = dayjs(fechaAsignacionIso);
    const deadline = asignacion.startOf("day").add(36, "hour");
    const diffHoras = deadline.diff(dayjs(), "hour");

    return diffHoras;
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
      if (horasRestantes != null && horasRestantes <= 0) {
        return "bg-danger";
      }
      return "bg-secondary text-white";
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
        if (horasRestantes != null && horasRestantes <= 0) {
          return "card-tarea state-no-cumplida";
        }
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
        if (horasRestantes != null && horasRestantes <= 0) {
          return "No cumplida (vencida)";
        }
        return "Tomada";
    }
  };

  // ------------ Carga de datos desde la API (solo /asignaciones) ------------
  const cargarAsignaciones = async () => {
    if (!user) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const todas = await tareaService.obtenerAsignaciones();

      // Admin ve todas
      setAsignacionesAdmin(todas);

      // “Mis tareas” = solo las del usuario actual
      if (usuarioIdActual) {
        const mias = todas.filter((a) => a.usuarioId === usuarioIdActual);
        setAsignacionesUsuario(mias);
      } else {
        setAsignacionesUsuario([]);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Error al obtener asignaciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAsignaciones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ------------ Filtro por estado (admin) ------------
  const asignacionesFiltradasAdmin = useMemo(() => {
    if (filtroEstado === "TODOS") return asignacionesAdmin;
    return asignacionesAdmin.filter((a) => a.estado === filtroEstado);
  }, [asignacionesAdmin, filtroEstado]);

  // ------------ Modal evidencia: handlers ------------
  const abrirModalEvidencia = (asignacion) => {
    setAsignacionActual(asignacion);
    setEvidenciaTexto(asignacion.fotoConfirmacion || "");
    setShowEvidenciaModal(true);
  };

  const cerrarModalEvidencia = () => {
    setShowEvidenciaModal(false);
    setAsignacionActual(null);
    setEvidenciaTexto("");
  };

  const handleEnviarEvidencia = async () => {
    if (!asignacionActual) return;
    try {
      await tareaService.completarTarea(
        asignacionActual.id,
        evidenciaTexto || "Evidencia enviada"
      );
      await cargarAsignaciones();
      cerrarModalEvidencia();
    } catch (err) {
      console.error(err);
      alert("No se pudo enviar la evidencia");
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

      {/* --------- Filtro de estado + Tareas Arrendatarios --------- */}
      <section className="border p-3 rounded bg-white mb-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Tareas Arrendatarios</h2>
          <div className="d-flex align-items-center gap-2">
            <label className="mb-0 me-2">Filtrar por estado:</label>
            <select
              className="form-select form-select-sm"
              style={{ width: "200px" }}
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="TODOS">Todos</option>
              <option value="TOMADA">Tomada</option>
              <option value="PENDIENTE_APROBACION">Pendiente aprobación</option>
              <option value="APROBADA">Aprobada</option>
              <option value="NO_CUMPLIDA">No cumplida</option>
              <option value="RECHAZADA">Rechazada</option>
            </select>
          </div>
        </div>

        {loading && <p className="text-muted">Cargando asignaciones...</p>}

        {!loading && asignacionesFiltradasAdmin.length === 0 && (
          <p className="text-muted">No hay tareas asignadas con este filtro.</p>
        )}

        {!loading &&
          asignacionesFiltradasAdmin.map((a) => {
            const horasRestantes = calcularHorasRestantes(a.fechaAsignacion);
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
                        {formatearFechaCorta(a.fechaAsignacion)}{" "}
                        {horasRestantes != null && (
                          <>
                            /{" "}
                            <span
                              className={
                                horasRestantes <= 0
                                  ? "text-danger"
                                  : "text-success"
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
                </Card.Body>
              </Card>
            );
          })}
      </section>

      {/* --------- Sección: Mis Tareas --------- */}
      <section className="border p-3 rounded bg-white">
        <h2 className="mb-3">Mis Tareas</h2>

        {!usuarioIdActual && (
          <p className="text-muted">
            No se pudo determinar el identificador del usuario actual.
          </p>
        )}

        {usuarioIdActual && asignacionesUsuario.length === 0 && !loading && (
          <p className="text-muted">
            Aún no tienes tareas asignadas en esta semana.
          </p>
        )}

        {usuarioIdActual &&
          asignacionesUsuario.map((a) => {
            const horasRestantes = calcularHorasRestantes(a.fechaAsignacion);
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
                        {formatearFechaCorta(a.fechaAsignacion)}{" "}
                        {horasRestantes != null && (
                          <>
                            /{" "}
                            <span
                              className={
                                horasRestantes <= 0
                                  ? "text-danger"
                                  : "text-success"
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

                  {/* Botón de evidencia para tareas tomadas y dentro de plazo */}
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

      {/* --------- Modal de evidencia --------- */}
      <Modal show={showEvidenciaModal} onHide={cerrarModalEvidencia}>
        <Modal.Header closeButton>
          <Modal.Title>
            Subir evidencia
            {asignacionActual?.tarea?.nombre
              ? ` - ${asignacionActual.tarea.nombre}`
              : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">
            Aquí puedes pegar un enlace a la foto, una descripción corta o lo
            que quieras usar como evidencia.
          </p>
          <Form.Group>
            <Form.Label>Evidencia</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={evidenciaTexto}
              onChange={(e) => setEvidenciaTexto(e.target.value)}
              placeholder="Ej: https://mis-fotos.com/patio-limpio.jpg o 'Subí las fotos al grupo de WhatsApp'"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cerrarModalEvidencia}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleEnviarEvidencia}>
            Enviar evidencia
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}