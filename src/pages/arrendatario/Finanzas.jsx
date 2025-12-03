import React, { useState, useEffect } from 'react';
import { Alert, Table, Card, Badge } from 'react-bootstrap';
import { useAuth } from '../../context/authContext';

export default function Finanzas() {
  const { user } = useAuth();
  const [transacciones, setTransacciones] = useState([]);
  const [resumen, setResumen] = useState({
    totalIngresos: 0,
    totalGastos: 0,
    saldo: 0,
  });

  useEffect(() => {
    // Aquí cargarías las finanzas del backend
    // Simulación de datos por ahora
    setTransacciones([
      {
        id: 1,
        tipo: 'INGRESO',
        monto: 500000,
        descripcion: 'Pago arriendo diciembre',
        fecha: '2024-12-01',
        categoria: 'ARRIENDO',
      },
      {
        id: 2,
        tipo: 'GASTO',
        monto: 50000,
        descripcion: 'Gastos comunes',
        fecha: '2024-12-01',
        categoria: 'SERVICIOS',
      },
    ]);

    setResumen({
      totalIngresos: 500000,
      totalGastos: 50000,
      saldo: 450000,
    });
  }, []);

  const formatMonto = (monto) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(monto);
  };

  const getTipoBadge = (tipo) => {
    return tipo === 'INGRESO' ? (
      <Badge bg="success">Ingreso</Badge>
    ) : (
      <Badge bg="danger">Gasto</Badge>
    );
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">
        <i className="bi bi-cash-coin me-2"></i>
        Mis Finanzas
      </h2>

      {/* Alerta informativa */}
      <Alert variant="info" className="mb-4">
        <i className="bi bi-info-circle me-2"></i>
        Aquí puedes ver tu historial de pagos y gastos personales.
      </Alert>

      {/* Tarjetas de resumen */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <Card className="border-success">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Card.Subtitle className="text-muted mb-2">
                    Total Ingresos
                  </Card.Subtitle>
                  <Card.Title className="text-success mb-0">
                    {formatMonto(resumen.totalIngresos)}
                  </Card.Title>
                </div>
                <i className="bi bi-arrow-up-circle text-success" style={{ fontSize: '2rem' }}></i>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4">
          <Card className="border-danger">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Card.Subtitle className="text-muted mb-2">
                    Total Gastos
                  </Card.Subtitle>
                  <Card.Title className="text-danger mb-0">
                    {formatMonto(resumen.totalGastos)}
                  </Card.Title>
                </div>
                <i className="bi bi-arrow-down-circle text-danger" style={{ fontSize: '2rem' }}></i>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="col-md-4">
          <Card className="border-primary">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Card.Subtitle className="text-muted mb-2">
                    Saldo
                  </Card.Subtitle>
                  <Card.Title className="text-primary mb-0">
                    {formatMonto(resumen.saldo)}
                  </Card.Title>
                </div>
                <i className="bi bi-wallet2 text-primary" style={{ fontSize: '2rem' }}></i>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Tabla de transacciones */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            <i className="bi bi-clock-history me-2"></i>
            Historial de Transacciones
          </h5>
        </Card.Header>
        <Card.Body>
          {transacciones.length === 0 ? (
            <Alert variant="secondary" className="mb-0">
              No tienes transacciones registradas.
            </Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead className="table-light">
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th className="text-end">Monto</th>
                </tr>
              </thead>
              <tbody>
                {transacciones.map((transaccion) => (
                  <tr key={transaccion.id}>
                    <td>{new Date(transaccion.fecha).toLocaleDateString()}</td>
                    <td>{getTipoBadge(transaccion.tipo)}</td>
                    <td>{transaccion.descripcion}</td>
                    <td>
                      <Badge bg="secondary">{transaccion.categoria}</Badge>
                    </td>
                    <td className={`text-end ${transaccion.tipo === 'INGRESO' ? 'text-success' : 'text-danger'}`}>
                      <strong>
                        {transaccion.tipo === 'INGRESO' ? '+' : '-'}
                        {formatMonto(transaccion.monto)}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
