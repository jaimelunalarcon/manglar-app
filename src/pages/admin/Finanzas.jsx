// src/pages/admin/Finanzas.jsx
import React, { useState, useMemo } from 'react';
import { Col, Table, Row, Badge, Form, Button } from 'react-bootstrap';
import AddGastoModal from '../../components/AddGastoModal';

// Helpers fuera del componente (ok)
const CLP = (n) => n.toLocaleString('es-CL');
const formatFecha = (yyyyMMdd) => {
  const [y, m, d] = yyyyMMdd.split('-');
  return `${d}/${m}/${y.slice(-2)}`; // 10/10/25
};

export default function Finanzas() {
  // ✅ Hooks DENTRO del componente
  const [showModal, setShowModal] = useState(false);
  const [gastos, setGastos] = useState([
    { id: 1, nombre: 'Feria',             fecha: '2025-10-01', monto: 40000 },
    { id: 2, nombre: 'Productos de Aseo', fecha: '2025-10-04', monto: 20000 },
    { id: 3, nombre: 'Arreglo Techo',     fecha: '2025-10-10', monto: 200000 },
  ]);

  const totalGastos = useMemo(() => gastos.reduce((a, g) => a + g.monto, 0), [gastos]);

  const handleSaveGasto = (g) => {
    setGastos((prev) => [{ ...g }, ...prev]); // prepend
  };

  return (
    <div>
      <div className='header-section'>
        <h1 className="mb-3 mt-3">
          <i className="bi me-2 bi-bar-chart-fill" aria-hidden="true"></i> Finanzas hogar
        </h1>
      </div>

      <Row>
        {/* <Col sm={12} md={12}>
          <div className="border bg-white p-4 rounded mb-4">
            <h2>Ingresos anuales</h2>
            Aca va el gráfico <strong> Mario culeco</strong>
          </div>
        </Col> */}

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
              <tr className="text-center">
                <td>Felipe</td>
                <td>10</td>
                <td>
                  $20.000
                  <a href="#" className="ms-2">
                    <Badge pill bg="info">+</Badge>
                  </a>
                </td>
                <td className="text-center">$14.000</td>
              </tr>
              <tr className="text-center">
                <td>Kototo</td>
                <td>2</td>
                <td>
                  $20.000
                  <a href="#" className="ms-2">
                    <Badge pill bg="info">+</Badge>
                  </a>
                </td>
                <td className="text-center">$34.000</td>
              </tr>
              <tr className="text-center">
                <td>Mati</td>
                <td>0</td>
                <td>
                  $40.000
                  <a href="#" className="ms-2">
                    <Badge pill bg="info">+</Badge>
                  </a>
                </td>
                <td className="text-center">$0</td>
              </tr>
              <tr className="text-center">
                <td>Santi</td>
                <td>0</td>
                <td>
                  $10.000
                  <a href="#" className="ms-2">
                    <Badge pill bg="info">+</Badge>
                  </a>
                </td>
                <td className="text-center">$0</td>
              </tr>
              <tr className="text-center">
                <td>Fran</td>
                <td>0</td>
                <td>
                  $20.000
                  <a href="#" className="ms-2">
                    <Badge pill bg="info">+</Badge>
                  </a>
                </td>
                <td className="text-center">$0</td>
              </tr>
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
        <div className="card-body" style={{ marginTop: 15, borderTop: '1px dashed #333' }}>
          Total ingresos casa
          <span className="float-end">$210.000</span>
        </div>
      </div>
    </div>
  );
}
