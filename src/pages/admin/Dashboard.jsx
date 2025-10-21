import React from 'react';
import Card from 'react-bootstrap/Card';
import '../../Dashboard.css';
import useReveal from '../../hooks/useReveal'; // sin .jsx (opcional)

export default function Dashboard() {
  // Llama al hook para activar el efecto reveal (120ms de escalonado)
  useReveal({ step: 120 });

  return (
    <div className="dashboard-admin">
      <h1 className="mt-3">Dashboard Admin</h1>

      <p className="mb-5">
        <i className="bi bi-calendar me-3" aria-hidden="true"></i>
        Semana 13 oct - 20 oct
      </p>

      <section className="border p-3 rounded bg-white mb-3">
        <h2>Tareas Arrendatarios</h2>

        {/* Deja 'reveal'; el hook agregará 'in' cuando aparezca */}
        <Card className="mb-3 card-tarea active reveal">
          <Card.Body className="shadow-sm">
            Patio / <strong>Arrendatario 1</strong><br />
            <span className="text-success">Quedan 11 hrs</span>
            <Card.Link href="#" className="float-end text-primary">ABIERTA</Card.Link>
          </Card.Body>
        </Card>

        <Card className="mb-3 card-tarea active reveal">
          <Card.Body className="shadow-sm">
            Cocina / <strong>Arrendatario 2</strong><br />
            <span className="text-success">Quedan 5 hrs</span>
            <Card.Link href="#" className="float-end text-success">APROBAR</Card.Link>
          </Card.Body>
        </Card>

        <Card className="mb-3 card-tarea lost reveal">
          <Card.Body className="shadow-sm">
            Espacios Comunes / <strong>Arrendatario 3</strong><br />
            <span className="text-danger">Quedan 0 hrs</span>
            <Card.Link href="#" className="float-end text-danger">NO HECHA</Card.Link>
          </Card.Body>
        </Card>
      </section>

      <section className="border p-3 rounded bg-white">
        <h2>Mis Tareas</h2>

        <Card className="mb-3 card-tarea active reveal">
          <Card.Body className="shadow-sm">
            Patio / <strong>Arrendatario 1</strong><br />
            <span className="text-success">Quedan 11 hrs</span>
            <Card.Link href="#" className="float-end text-success">EVIDENCIA</Card.Link>
          </Card.Body>
        </Card>

        <Card className="mb-3 card-tarea active reveal">
          <Card.Body className="shadow-sm">
            Cocina / <strong>Arrendatario 2</strong><br />
            <span className="text-success">Quedan 5 hrs</span>
            <Card.Link href="#" className="float-end text-success">EVIDENCIA</Card.Link>
          </Card.Body>
        </Card>
      </section>
    </div>
  );
}
