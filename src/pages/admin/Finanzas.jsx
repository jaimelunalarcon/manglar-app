import React, { useEffect, useMemo, useState } from "react";
import {
  Col,
  Table,
  Row,
  Badge,
  Form,
  Button,
  Modal,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import ArriendoModal from "../../components/ArriendoModal";
import ModalPagos from "../../components/ModalPagos";
import axiosInstance from "../../api/axiosConfig";
import * as XLSX from "xlsx";

// Helpers
const CLP = (n) => Number(n || 0).toLocaleString("es-CL");
const pad2 = (n) => String(n).padStart(2, "0");

const formatFecha = (yyyyMMdd) => {
  if (!yyyyMMdd) return "-";
  const [y, m, d] = String(yyyyMMdd).split("-");
  return `${d}/${m}/${String(y).slice(-2)}`;
};

const monthLabel = (m) =>
  ({
    "01": "Enero",
    "02": "Febrero",
    "03": "Marzo",
    "04": "Abril",
    "05": "Mayo",
    "06": "Junio",
    "07": "Julio",
    "08": "Agosto",
    "09": "Septiembre",
    "10": "Octubre",
    "11": "Noviembre",
    "12": "Diciembre",
  }[m] || "Mes");

export default function Finanzas() {
  // Mes/año (visualización)
  const [month, setMonth] = useState(() => pad2(new Date().getMonth() + 1));
  const [year, setYear] = useState(() => String(new Date().getFullYear()));

  // 🔑 refresco global
  const [refreshKey, setRefreshKey] = useState(0);
  const refrescarFinanzas = () => setRefreshKey((k) => k + 1);

  // -----------------------------
  // DATA DESDE API (resumen)
  // -----------------------------
  const [usuarios, setUsuarios] = useState([]); // filas “armadas” para UI
  const [cajaMovimientos, setCajaMovimientos] = useState([]);
  const [totales, setTotales] = useState({
    totalIngresosCasa: 0,
    totalGastosCasa: 0,
    saldoCasa: 0,
    ingresosCaja: 0,
    gastosCaja: 0,
    pagosMesTotal: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // -----------------------------
  // MODALES
  // -----------------------------
  // Pagos
  const [showPagos, setShowPagos] = useState(false);
  const [selectedUserPagos, setSelectedUserPagos] = useState(null);

  // Caja
  const [showCajaModal, setShowCajaModal] = useState(false);

  // Arriendo
  const [showArriendo, setShowArriendo] = useState(false);
  const [selectedUserArriendo, setSelectedUserArriendo] = useState(null);
  const [arriendoHistorico, setArriendoHistorico] = useState([]);
  const [arriendoVigenteMes, setArriendoVigenteMes] = useState(null);

  // -----------------------------
  // CARGA PRINCIPAL (RESUMEN)
  // -----------------------------
  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await axiosInstance.get("/finanzas/resumen", {
          params: { year: Number(year), month: Number(month) },
        });

        const data = res.data || {};

        // 👇 data.usuarios viene como lista de maps:
        // { usuarioFinanza, usuarioId, pagadoDineroMes, saldoPendienteTotal }
        const filas = (data.usuarios || []).map((row) => {
          const uf = row.usuarioFinanza || {};

          return {
            usuarioId: row.usuarioId ?? uf.usuarioId,
            usuarioNombre: uf.nombre ?? uf.usuarioNombre ?? "Sin nombre",

            // Estos campos dependen de tu entity UsuarioFinanza.
            // Si tu entity usa otros nombres, cámbialos aquí (solo aquí).
            arriendoMes: uf.arriendoMes ?? uf.arriendo ?? 0,
            gcPendiente: uf.gcPendiente ?? uf.gastosComunesPendiente ?? 0,
            puntosMes: uf.puntos ?? uf.puntosMes ?? 0,
            descuentoPuntos: uf.descuentoPuntos ?? 0,

            pagadoDineroMes: row.pagadoDineroMes ?? 0,
            saldoPendienteTotal: row.saldoPendienteTotal ?? 0,
          };
        });

        setUsuarios(filas);
        setCajaMovimientos(data.cajaMovimientos || []);

        setTotales({
          totalIngresosCasa: data.totalIngresosCasa ?? 0,
          totalGastosCasa: data.totalGastosCasa ?? 0,
          saldoCasa: data.saldoCasa ?? 0,
          ingresosCaja: data.ingresosCaja ?? 0,
          gastosCaja: data.gastosCaja ?? 0,
          pagosMesTotal: data.pagosMesTotal ?? 0,
        });
      } catch (err) {
        console.error("Error cargando finanzas:", err);
        setError("No se pudo cargar el resumen de finanzas.");
        setUsuarios([]);
        setCajaMovimientos([]);
        setTotales({
          totalIngresosCasa: 0,
          totalGastosCasa: 0,
          saldoCasa: 0,
          ingresosCaja: 0,
          gastosCaja: 0,
          pagosMesTotal: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [refreshKey, month, year]);

  // -----------------------------
  // ACCIONES UI
  // -----------------------------
  const openPagos = (u) => {
    setSelectedUserPagos(null); // fuerza reset
    setShowPagos(true);
    setTimeout(() => setSelectedUserPagos(u), 0);
  };

  const openArriendo = async (u) => {
    setSelectedUserArriendo(u);
    setShowArriendo(true);

    try {
      const [histRes, vigRes] = await Promise.all([
        axiosInstance.get(`/arriendos/${u.usuarioId}/historico`),
        axiosInstance.get(`/arriendos/${u.usuarioId}`, {
          params: { year: Number(year), month: Number(month) },
        }),
      ]);

      setArriendoHistorico(histRes.data || []);
      setArriendoVigenteMes(vigRes.data || null);
    } catch (err) {
      console.error("Error cargando arriendo", err);
      setArriendoHistorico([]);
      setArriendoVigenteMes(null);
    }
  };

  const registrarReajusteArriendo = async ({ monto }) => {
    if (!selectedUserArriendo?.usuarioId) throw new Error("Usuario inválido");

    await axiosInstance.post(
      `/arriendos/${selectedUserArriendo.usuarioId}`,
      null,
      { params: { monto } }
    );

    // refresca resumen + modal
    refrescarFinanzas();
  };

  // Guardar movimiento de caja en BD (Finanza con categoria=CAJA, usuarioId=CASA)
  const guardarMovimientoCaja = async ({ concepto, fecha, tipo, monto }) => {
    await axiosInstance.post("/finanzas", {
      usuarioId: "CASA",
      categoria: "CAJA",
      tipo, // "INGRESO" | "EGRESO"
      monto: Number(monto),
      fecha, // "YYYY-MM-DD"
      descripcion: concepto,
    });

    refrescarFinanzas();
  };

  // -----------------------------
  // Excel
  // -----------------------------
  const exportarExcel = () => {
    const hojaUsuarios = XLSX.utils.json_to_sheet(
      usuarios.map((u) => ({
        Usuario: u.usuarioNombre,
        Arriendo: u.arriendoMes,
        "GC acumulado": u.gcPendiente,
        Puntos: u.puntosMes,
        "Descuento puntos": u.descuentoPuntos,
        "Pagado ($)": u.pagadoDineroMes,
        "Saldo pendiente": u.saldoPendienteTotal,
      }))
    );

    const hojaCaja = XLSX.utils.json_to_sheet(
      (cajaMovimientos || []).map((m) => ({
        Movimiento: m.descripcion ?? m.concepto ?? "-",
        Fecha: m.fecha,
        Tipo: m.tipo,
        Monto: m.monto,
      }))
    );

    const hojaResumen = XLSX.utils.aoa_to_sheet([
      [`Resumen ${monthLabel(month)} ${year}`],
      [],
      ["Ingresos caja (CAJA)", totales.ingresosCaja],
      ["Gastos caja (CAJA)", totales.gastosCaja],
      ["Pagos mes total (PAGO)", totales.pagosMesTotal],
      [],
      ["Total ingresos casa", totales.totalIngresosCasa],
      ["Total gastos casa", totales.totalGastosCasa],
      ["Saldo casa", totales.saldoCasa],
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, hojaUsuarios, "Usuarios");
    XLSX.utils.book_append_sheet(wb, hojaCaja, "Caja de la casa");
    XLSX.utils.book_append_sheet(wb, hojaResumen, "Resumen");

    XLSX.writeFile(wb, `finanzas_${year}-${month}.xlsx`);
  };

  return (
    <div>
      <div className="header-section d-flex align-items-center mb-4 justify-content-between">
        <h1 className="mb-3 mt-3">
          <i className="bi me-2 bi-bar-chart-fill" aria-hidden="true"></i> Finanzas hogar
        </h1>

        <Button variant="primary" className="rounded-pill mt-3" onClick={exportarExcel}>
          <i className="bi bi-file-earmark-excel me-2" aria-hidden="true"></i>
          Exportar a Excel
        </Button>
      </div>

      {/* Selector mes/año */}
      <Row className="mb-3">
        <Col sm={12} md={3}>
          <label className="form-label">Año</label>
          <Form.Select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </Form.Select>
        </Col>

        <Col sm={12} md={3}>
          <label className="form-label">Mes</label>
          <Form.Select value={month} onChange={(e) => setMonth(e.target.value)}>
            {Array.from({ length: 12 }).map((_, i) => {
              const mm = pad2(i + 1);
              return (
                <option key={mm} value={mm}>
                  {monthLabel(mm)}
                </option>
              );
            })}
          </Form.Select>
        </Col>

        <Col sm={12} md={6} className="d-flex align-items-end justify-content-end">
          <div className="text-muted small">
            Visualización: <strong>{monthLabel(month)} {year}</strong>
          </div>
        </Col>
      </Row>

      {error && <div className="alert alert-danger py-2">{error}</div>}
      {loading && <div className="text-muted small mb-2">Cargando finanzas...</div>}

      <Row>
        {/* TABLA 1: Usuarios */}
        <Col sm={12} md={12} className="mb-4">
          <Table hover responsive>
            <thead>
              <tr className="text-center">
                <th className="bg-secondary text-white">Usuario</th>
                <th className="bg-secondary text-white">Arriendo</th>
                <th className="bg-secondary text-white">GC Acumulado</th>
                <th className="bg-secondary text-white">Puntos</th>
                <th className="bg-secondary text-white">Desc. puntos</th>
                <th className="bg-secondary text-white">Pagado ($)</th>
                <th className="bg-secondary text-white">Saldo</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No hay usuarios/finanzas para este mes. (Probablemente falta poblar BD o aún no hay movimientos/pagos en {year}-{month})
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.usuarioId} className="text-center">
                    <td className="text-start ps-3">{u.usuarioNombre}</td>

                    <td>
                      ${CLP(u.arriendoMes)}
                      <Button
                        size="sm"
                        variant="link"
                        className="p-0 ms-2"
                        onClick={() => openArriendo(u)}
                        aria-label={`Editar arriendo de ${u.usuarioNombre}`}
                      >
                        <i className="bi bi-pencil-square"></i>
                      </Button>
                    </td>

                    <td>${CLP(u.gcPendiente)}</td>
                    <td>{u.puntosMes}</td>
                    <td>${CLP(u.descuentoPuntos)}</td>

                    <td>
                      ${CLP(u.pagadoDineroMes)}
                      <OverlayTrigger
                        placement="top"
                        delay={{ show: 150, hide: 80 }}
                        overlay={<Tooltip id={`tooltip-pagos-${u.usuarioId}`}>Ver pagos y registrar abono</Tooltip>}
                      >
                        <Button
                          size="sm"
                          variant="link"
                          className="ms-1 p-0"
                          onClick={() => openPagos(u)}
                          aria-label={`Ver pagos de ${u.usuarioNombre}`}
                        >
                          <Badge pill bg="info">+</Badge>
                        </Button>
                      </OverlayTrigger>
                    </td>

                    <td className="fw-semibold">${CLP(u.saldoPendienteTotal)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Col>

        {/* TABLA 2: Caja */}
        <Col sm={12} md={6}>
          <div className="d-flex align-items-center mb-2 justify-content-between">
            <h5 className="mb-2">
              <i className="bi bi-house-door-fill me-2"></i>
              Caja de la casa
            </h5>
          </div>

          <Table hover responsive>
            <thead>
              <tr className="bg-secondary text-white text-center">
                <th className="bg-secondary text-white">Movimiento</th>
                <th className="bg-secondary text-white">Fecha</th>
                <th className="bg-secondary text-white">Tipo</th>
                <th className="bg-secondary text-white">Valor</th>
              </tr>
            </thead>

            <tbody>
              {(cajaMovimientos || []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    No hay movimientos de caja en este mes.
                  </td>
                </tr>
              ) : (
                cajaMovimientos.map((m) => (
                  <tr key={m.id} className="text-center">
                    <td className="text-start ps-3">{m.descripcion ?? m.concepto ?? "-"}</td>
                    <td>{formatFecha(m.fecha)}</td>
                    <td>
                      <Badge pill bg={m.tipo === "INGRESO" ? "success" : "danger"}>
                        {m.tipo === "INGRESO" ? "Ingreso" : "Egreso"}
                      </Badge>
                    </td>
                    <td className={m.tipo === "INGRESO" ? "text-success fw-semibold" : "text-danger fw-semibold"}>
                      {m.tipo === "INGRESO" ? "+" : "-"}${CLP(m.monto)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <Button className="rounded-pill" variant="success" onClick={() => setShowCajaModal(true)}>
            + Registrar movimiento
          </Button>
        </Col>

        {/* RESUMEN */}
        <Col sm={12} md={6}>
          <div className="d-flex align-items-center justify-content-between">
            <h5 className="mb-2">
              <i className="bi bi-cash me-2"></i>
              Total ingresos casa
            </h5>
          </div>

          <div className="card border bg-white d-block p-3 rounded mt-2">
            <div className="card-body p-0">
              Total ingresos casa <span className="float-end">${CLP(totales.totalIngresosCasa)}</span>
            </div>

            <div className="card-body p-0" style={{ marginTop: 0 }}>
              Total gastos <span className="float-end">${CLP(totales.totalGastosCasa)}</span>
            </div>

            <div className="card-body" style={{ marginTop: 15, borderTop: "1px dashed #333" }}>
              Saldo <span className="float-end">${CLP(totales.saldoCasa)}</span>
            </div>

            
          </div>
        </Col>
      </Row>

      {/* ✅ MODAL: Pagos */}
      <ModalPagos
        key={`${selectedUserPagos?.usuarioId || "none"}-${year}-${month}-${showPagos ? "open" : "closed"}`}
        show={showPagos}
        onClose={() => setShowPagos(false)}
        usuario={selectedUserPagos}
        year={Number(year)}
        month={Number(month)}
        onPagoGuardado={refrescarFinanzas} // 🔥 CLAVE
      />

      {/* MODAL: Arriendo */}
      <ArriendoModal
        show={showArriendo}
        onClose={() => setShowArriendo(false)}
        usuario={selectedUserArriendo}
        year={year}
        month={month}
        historico={arriendoHistorico}
        vigenteMes={arriendoVigenteMes}
        onRegistrarReajuste={registrarReajusteArriendo}
      />

      {/* MODAL: Caja */}
      <CajaMovimientoModal
        show={showCajaModal}
        onClose={() => setShowCajaModal(false)}
        onSave={guardarMovimientoCaja}
      />
    </div>
  );
}

/**
 * Modal para registrar movimientos de caja (guarda en BD)
 */
function CajaMovimientoModal({ show, onClose, onSave }) {
  const [concepto, setConcepto] = useState("");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [tipo, setTipo] = useState("EGRESO");
  const [monto, setMonto] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setConcepto("");
    setFecha(new Date().toISOString().slice(0, 10));
    setTipo("EGRESO");
    setMonto("");
    setError("");
  };

  const submit = async () => {
    const n = Number(monto);

    if (!concepto.trim()) return setError("Debes indicar un concepto.");
    if (!fecha) return setError("Debes indicar fecha.");
    if (!Number.isFinite(n) || n <= 0) return setError("Monto inválido.");

    setSaving(true);
    setError("");

    try {
      await onSave({
        concepto: concepto.trim(),
        fecha,
        tipo,
        monto: n,
      });

      reset();
      onClose();
    } catch (e) {
      console.error(e);
      setError("No se pudo guardar el movimiento.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Registrar movimiento — Caja</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <div className="alert alert-danger py-2">{error}</div>}

        <Form.Group className="mb-2">
          <Form.Label>Tipo</Form.Label>
          <Form.Select value={tipo} onChange={(e) => setTipo(e.target.value)} disabled={saving}>
            <option value="EGRESO">EGRESO</option>
            <option value="INGRESO">INGRESO</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Movimiento</Form.Label>
          <Form.Control
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            placeholder="Ej: Feria / Aseo / Actividad pro fondos"
            disabled={saving}
          />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-2">
              <Form.Label>Fecha</Form.Label>
              <Form.Control type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} disabled={saving} />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-2">
              <Form.Label>Monto</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="Ej: 20000"
                disabled={saving}
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="text-muted small">
          Esto se guarda como <strong>Finanza</strong> con categoria <code>CAJA</code> y usuarioId <code>CASA</code>.
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="success" onClick={submit} disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}