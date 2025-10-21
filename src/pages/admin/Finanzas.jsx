// src/pages/admin/Finanzas.jsx
import React, { useState, useMemo } from 'react';
import { Col, Table, Row, Badge, Form, Button } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import AddGastoModal from '../../components/AddGastoModal';

// Helpers fuera del componente
const CLP = (n) => n.toLocaleString('es-CL');
const formatFecha = (yyyyMMdd) => {
  const [y, m, d] = yyyyMMdd.split('-');
  return `${d}/${m}/${y.slice(-2)}`; // 10/10/25
};

// 💾 Datos “duros” del cuadro de usuarios (puntos/abonos/deuda)
// ¡Importante!: abono/deuda como NÚMERO, sin $ ni puntos para Excel
const usuariosFinanzas = [
  { usuario: 'Felipe', puntos: 10, abono: 20000, deuda: 14000 },
  { usuario: 'Kototo', puntos: 2,  abono: 20000, deuda: 34000 },
  { usuario: 'Mati',   puntos: 0,  abono: 40000, deuda:     0 },
  { usuario: 'Santi',  puntos: 0,  abono: 10000, deuda:     0 },
  { usuario: 'Fran',   puntos: 0,  abono: 20000, deuda:     0 },
];

export default function Finanzas() {
  const [showModal, setShowModal] = useState(false);
  const [gastos, setGastos] = useState([
    { id: 1, nombre: 'Feria',             fecha: '2025-10-01', monto:  40000 },
    { id: 2, nombre: 'Productos de Aseo', fecha: '2025-10-04', monto:  20000 },
    { id: 3, nombre: 'Arreglo Techo',     fecha: '2025-10-10', monto: 200000 },
  ]);

  const totalGastos = useMemo(() => gastos.reduce((a, g) => a + g.monto, 0), [gastos]);
  const totalAbonos = useMemo(() => usuariosFinanzas.reduce((a, u) => a + u.abono, 0), []);
  const totalDeudas = useMemo(() => usuariosFinanzas.reduce((a, u) => a + u.deuda, 0), []);
  const saldoCasa   = useMemo(() => totalAbonos - totalGastos, [totalAbonos, totalGastos]);

  const handleSaveGasto = (g) => {
    setGastos((prev) => [{ ...g }, ...prev]); // prepend
  };

  // 🧾 Exportar a Excel
  const exportarExcel = () => {
    // 1) Hoja Resumen usuarios (números crudos)
    const hojaUsuarios = XLSX.utils.json_to_sheet(
      usuariosFinanzas.map(u => ({
        Usuario: u.usuario,
        Puntos: u.puntos,
        Abono: u.abono, // número
        Deuda: u.deuda, // número
      }))
    );

    // 2) Hoja Gastos (fecha ISO para Excel + monto número)
    const hojaGastos = XLSX.utils.json_to_sheet(
      gastos.map(g => ({
        Gasto: g.nombre,
        Fecha: g.fecha,   // ISO (Excel la interpreta como fecha)
        Monto: g.monto,   // número
      }))
    );

    // 3) Hoja Resumen (totales)
    const hojaResumen = XLSX.utils.aoa_to_sheet([
      ['Resumen'],
      [],
      ['Total abonos', totalAbonos],
      ['Total gastos', totalGastos],
      ['Total deudas (acumulado usuarios)', totalDeudas],
      ['Saldo casa (abonos - gastos)', saldoCasa],
    ]);

    // Formateo simple de columnas (ancho)
    hojaUsuarios['!cols'] = [{ wch: 18 }, { wch: 10 }, { wch: 12 }, { wch: 12 }];
    hojaGastos['!cols']   = [{ wch: 28 }, { wch: 12 }, { wch: 12 }];
    hojaResumen['!cols']  = [{ wch: 28 }, { wch: 16 }];

    // Crear workbook y anexar hojas
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, hojaUsuarios, 'Resumen usuarios');
    XLSX.utils.book_append_sheet(wb, hojaGastos,   'Gastos');
    XLSX.utils.book_append_sheet(wb, hojaResumen,  'Resumen');

    // Descargar
    XLSX.writeFile(wb, 'finanzas_hogar.xlsx');
  };

  return (
    <div>
      <div className='header-section d-flex align-items-center justify-content-between'>
        <h1 className="mb-3 mt-3">
          <i className="bi me-2 bi-bar-chart-fill" aria-hidden="true"></i> Finanzas hogar
        </h1>
        {/* 🔽 Botón Exportar a Excel */}
        <Button variant="primary" className="rounded-pill mt-3" onClick={exportarExcel}>
          <i className="bi bi-file-earmark-excel me-2" aria-hidden="true"></i>
          Exportar a Excel
        </Button>
      </div>

      <Row>
        <Row className="mb-3">
          <Col sm={12} md={4}>
            <div className="pb-4">
              <label className="form-label">Selecciona el mes</label>
              <Form.Select aria-label="Selecciona el mes">
                <option>Octubre</option>
                <option value="01">Enero</option>
                <option value="02">Febrero</option>
                <option value="03">Marzo</option>
                <option value="04">Abril</option>
                <option value="05">Mayo</option>
                <option value="06">Junio</option>
                <option value="07">Julio</option>
                <option value="08">Agosto</option>
                <option value="09">Septiembre</option>
                <option value="11">Noviembre</option>
                <option value="12">Diciembre</option>
              </Form.Select>
            </div>
          </Col>
        </Row>

        <Col sm={12} md={6}>
          <Table hover responsive>
            <thead>
              <tr className="text-center">
                <th className="bg-secondary text-white">Usuario</th>
                <th className="bg-secondary text-white">Puntos</th>
                <th className="bg-secondary text-white">Abono</th>
                <th className="bg-secondary text-white">Deuda</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFinanzas.map((u) => (
                <tr key={u.usuario} className="text-center">
                  <td>{u.usuario}</td>
                  <td>{u.puntos}</td>
                  <td>
                    ${CLP(u.abono)}
                    <a href="#" className="ms-2">
                      <Badge pill bg="info">+</Badge>
                    </a>
                  </td>
                  <td className="text-center">${CLP(u.deuda)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>

        <Col sm={12} md={6}>
          <Table hover responsive>
            <thead>
              <tr className="bg-secondary text-white text-center">
                <th className="bg-secondary text-white">Gasto</th>
                <th className="text-center bg-secondary text-white">Fecha</th>
                <th className="text-center bg-secondary text-white">Valor</th>
              </tr>
            </thead>
            <tbody>
              {gastos.map((g) => (
                <tr key={g.id} className="text-center">
                  <td>{g.nombre}</td>
                  <td className="text-center">{formatFecha(g.fecha)}</td>
                  <td className="text-center">${CLP(g.monto)}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Button
            className="my-2 float-end rounded-pill"
            variant="success"
            onClick={() => setShowModal(true)}
          >
            + Agregar Gasto
          </Button>

          <AddGastoModal
            show={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleSaveGasto}
          />
        </Col>
      </Row>

      <div className="card border bg-white d-block p-3 rounded">
        <div className="card-body p-0" >
          Total ingresos casa
          <span className="float-end">${CLP(totalAbonos)}</span>
        </div>
        <div className="card-body p-0" style={{ marginTop: 0 }}>
          Total gastos
          <span className="float-end">${CLP(totalGastos)}</span>
        </div>
        <div className="card-body" style={{ marginTop: 15, borderTop: '1px dashed #333' }}>
          Saldo
          <span className="float-end">${CLP(saldoCasa)}</span>
        </div>
      </div>
    </div>
  );
}
