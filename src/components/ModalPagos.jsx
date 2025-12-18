// src/components/ModalPagos.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Button, Table, Row, Col, Form, Spinner } from "react-bootstrap";
import axiosInstance from "../api/axiosConfig";

// Helpers
const CLP = (n) => Number(n || 0).toLocaleString("es-CL");

const formatFecha = (yyyyMMdd) => {
  if (!yyyyMMdd) return "-";
  const [y, m, d] = String(yyyyMMdd).split("-");
  if (!y || !m || !d) return "-";
  return `${d}/${m}/${String(y).slice(-2)}`;
};

export default function ModalPagos({
  show,
  onClose,
  usuario,
  year,
  month,
  onPagoGuardado, // callback al padre
}) {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form
  const hoyISO = () => new Date().toISOString().slice(0, 10);
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(hoyISO);
  const [descripcion, setDescripcion] = useState("Pago registrado");

  // Para abortar requests al cerrar/cambiar
  const abortRef = useRef(null);

  const totalMes = useMemo(
    () => pagos.reduce((acc, p) => acc + Number(p?.monto || 0), 0),
    [pagos]
  );

  const resetForm = () => {
    setMonto("");
    setFecha(hoyISO());
    setDescripcion("Pago registrado");
  };

  const cancelarRequestEnCurso = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  };

  // -----------------------------
  // Cargar pagos por mes
  // -----------------------------
  const cargarPagos = async ({ silent = false } = {}) => {
    if (!usuario?.usuarioId) return;

    cancelarRequestEnCurso();
    const controller = new AbortController();
    abortRef.current = controller;

    if (!silent) {
      setLoading(true);
      setError("");
    }

    try {
      const res = await axiosInstance.get(`/usuarios/${usuario.usuarioId}/pagos`, {
        params: { year: Number(year), month: Number(month) },
        signal: controller.signal,
      });

      setPagos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      // Si fue abortado, no mostrar error
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;

      console.error("Error cargando pagos:", err);
      setError("No se pudieron cargar los pagos");
      setPagos([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // -----------------------------
  // Registrar pago
  // -----------------------------
  const guardarPago = async () => {
    if (!usuario?.usuarioId) {
      setError("Usuario inválido.");
      return;
    }

    const n = Number(monto);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Monto inválido. Debe ser mayor a 0.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await axiosInstance.post(`/usuarios/${usuario.usuarioId}/pagos`, {
        monto: n,
        fecha,
        descripcion,
      });

      // reset form
      resetForm();

      // recargar historial del modal
      await cargarPagos({ silent: true });

      // avisar al padre para refrescar tablas/resumen
      if (typeof onPagoGuardado === "function") {
        onPagoGuardado({
          usuarioId: usuario.usuarioId,
          year: Number(year),
          month: Number(month),
          monto: n,
        });
      }
    } catch (err) {
      console.error("Error guardando pago:", err);
      setError("No se pudo registrar el pago");
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // Effects
  // -----------------------------
  useEffect(() => {
    if (!show) return;

    setError("");
    resetForm();
    cargarPagos();

    return () => {
      cancelarRequestEnCurso();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, usuario?.usuarioId, year, month]);

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          Pagos — {usuario?.usuarioNombre || ""}
          <span className="text-muted fw-normal">
            {" "}
            ({String(month).padStart(2, "0")}/{year})
          </span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

        {/* HISTÓRICO */}
        <div className="border rounded p-2 mb-3">
          <div className="d-flex justify-content-between mb-2">
            <strong>Histórico</strong>
            <span>Total mes: ${CLP(totalMes)}</span>
          </div>

          {loading ? (
            <div className="text-muted small d-flex align-items-center gap-2">
              <Spinner size="sm" animation="border" />
              Cargando pagos...
            </div>
          ) : pagos.length === 0 ? (
            <div className="text-muted small">No hay pagos registrados.</div>
          ) : (
            <Table hover size="sm" responsive className="mb-0">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th className="text-center">Fecha</th>
                  <th className="text-end">Monto</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((p) => (
                  <tr key={p.id}>
                    <td>{p.descripcion}</td>
                    <td className="text-center">{formatFecha(p.fecha)}</td>
                    <td className="text-end fw-semibold">${CLP(p.monto)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>

        {/* REGISTRAR */}
        <div className="border rounded p-2">
          <strong className="mb-2 d-block">Registrar pago</strong>

          <Row className="g-2">
            <Col md={4}>
              <Form.Control
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                disabled={saving}
              />
            </Col>

            <Col md={4}>
              <Form.Control
                type="number"
                min="1"
                placeholder="Monto"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                disabled={saving}
              />
            </Col>

            <Col md={4}>
              <Form.Control
                placeholder="Descripción"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={saving}
              />
            </Col>
          </Row>

          <div className="text-end mt-3">
            <Button variant="success" onClick={guardarPago} disabled={saving}>
              {saving ? "Guardando..." : "Guardar pago"}
            </Button>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}