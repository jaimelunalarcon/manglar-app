import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button, Table, Form, Row, Col, Alert, Badge } from "react-bootstrap";

const CLP = (n) => Number(n || 0).toLocaleString("es-CL");

export default function ArriendoModal({
  show,
  onClose,
  usuario, // { usuarioId, usuarioNombre }
  year,
  month,
  historico = [],
  vigenteMes = null,
  onRegistrarReajuste, // async ({ monto, fechaDesde }) => Promise
}) {
  const [monto, setMonto] = useState("");
  const [fechaDesde, setFechaDesde] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setError("");
      setMonto("");
      setFechaDesde(new Date().toISOString().slice(0, 10));
    }
  }, [show]);

  const vigenteLabel = useMemo(() => {
    if (!vigenteMes) return null;
    return `$${CLP(vigenteMes.monto)}`;
  }, [vigenteMes]);

  const submit = async () => {
    setError("");

    const n = Number(monto);
    if (!Number.isFinite(n) || n <= 0) return setError("Monto inválido.");
    if (!fechaDesde) return setError("Fecha desde es obligatoria.");
    if (!usuario?.usuarioId) return setError("Usuario inválido.");

    try {
      setLoading(true);
      await onRegistrarReajuste?.({ monto: n, fechaDesde });
      setMonto("");
    } catch (e) {
      setError(typeof e === "string" ? e : "No se pudo registrar el reajuste.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-receipt-cutoff me-2"></i>
          Arriendo — {usuario?.usuarioNombre || ""}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {vigenteLabel && (
          <div className="mb-3">
            <span className="text-muted me-2">Arriendo para {month}/{year}:</span>
            <Badge pill bg="primary">{vigenteLabel}</Badge>
          </div>
        )}

        {/* Histórico */}
        <div className="border rounded p-2 mb-3">
          <div className="fw-semibold mb-2">
            <i className="bi bi-clock-history me-2"></i>Histórico
          </div>

          <Table hover responsive size="sm" className="mb-0">
            <thead>
              <tr className="text-center">
                <th>Desde</th>
                <th>Hasta</th>
                <th>Monto</th>
                <th>Creado por</th>
              </tr>
            </thead>
            <tbody>
              {historico.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-3">
                    Sin registros aún
                  </td>
                </tr>
              ) : (
                historico.map((a) => (
                  <tr key={a.id} className="text-center">
                    <td>{a.fechaDesde}</td>
                    <td>
                      {a.fechaHasta ? a.fechaHasta : <Badge pill bg="success">Vigente</Badge>}
                    </td>
                    <td className="fw-semibold">${CLP(a.monto)}</td>
                    <td className="text-muted">{a.creadoPor || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {/* Registrar reajuste */}
        <div className="border rounded p-2">
          <div className="fw-semibold mb-2">
            <i className="bi bi-pencil-square me-2"></i>Registrar reajuste
          </div>

          {error && <Alert variant="danger" className="py-2">{error}</Alert>}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Nuevo monto</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  placeholder="Ej: 480000"
                  disabled={loading}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Vigente desde</Form.Label>
                <Form.Control
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  disabled={loading}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="text-muted small">
            Esto no edita el pasado: cierra el arriendo vigente y crea uno nuevo.
          </div>

          <div className="d-flex justify-content-end mt-2">
            <Button variant="success" className="rounded-pill" onClick={submit} disabled={loading}>
              {loading ? "Guardando..." : "Guardar reajuste"}
            </Button>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}