import React from 'react';
import { useAuth } from '../../context/authContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container py-4">
      <h2 className="mb-4">
        <i className="bi bi-speedometer2 me-2"></i>
        Dashboard Arrendatario
      </h2>

      {/* Tarjeta de bienvenida */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h4>¡Bienvenido, {user?.nombre}!</h4>
              <p className="mb-0">
                RUT: {user?.rut} | Email: {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="row g-3">
        {/* Mis Tareas */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-check2-square me-2 text-primary"></i>
                Mis Tareas
              </h5>
              <p className="card-text text-muted">
                Gestiona tus tareas asignadas
              </p>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-0">5</h3>
                  <small className="text-muted">Tareas pendientes</small>
                </div>
                <a href="/arrendatario/tareas" className="btn btn-primary">
                  Ver Tareas
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Mis Finanzas */}
        <div className="col-md-6">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title">
                <i className="bi bi-cash-coin me-2 text-success"></i>
                Mis Finanzas
              </h5>
              <p className="card-text text-muted">
                Consulta tu estado financiero
              </p>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-0">$0</h3>
                  <small className="text-muted">Saldo actual</small>
                </div>
                <a href="/arrendatario/finanzas" className="btn btn-success">
                  Ver Finanzas
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Actividad Reciente
              </h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Tarea completada: Limpieza de áreas comunes
                  <small className="text-muted float-end">Hace 2 horas</small>
                </li>
                <li className="list-group-item">
                  <i className="bi bi-clock text-warning me-2"></i>
                  Tarea asignada: Riego de plantas
                  <small className="text-muted float-end">Ayer</small>
                </li>
                <li className="list-group-item">
                  <i className="bi bi-cash text-info me-2"></i>
                  Pago registrado: Arriendo mes de diciembre
                  <small className="text-muted float-end">Hace 3 días</small>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}