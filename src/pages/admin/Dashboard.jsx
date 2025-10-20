import React from 'react';
import Card from 'react-bootstrap/Card';
import '../../Dashboard.css';

function Dashboard()
{
    return(
       <div className='dashboard-admin'>
      <h1 className='mt-3'>Dashboard Admin</h1>
      <p className='mb-5'><i class="bi bi-calendar"></i> Semana 13 oct - 20 oct</p>
      <section className='border p-3 rounded bg-white mb-3'>
        <h2>Tareas Arrendatarios</h2>
         <Card className='mb-3 card-tarea active'>
          <Card.Body className='shadow-sm'>
            Patio / <strong> Arrendatario 1</strong> <br /> <span className='text-success'>Quedan 11 hrs</span>
            <Card.Link href="#" className='ml-auto float-end'>ABIERTA</Card.Link>
          </Card.Body>
        </Card>

        <Card className='mb-3 card-tarea active'>
          <Card.Body className='shadow-sm'>
            Cocina / <strong> Arrendatario 2</strong> <br /> <span className='text-success'>Quedan 5 hrs</span>
            <Card.Link href="#" className='ml-auto float-end'>APROBAR</Card.Link>
          </Card.Body>
        </Card>

        <Card className='mb-3 card-tarea lost'>
          <Card.Body className='shadow-sm'>
            Espacios Comunes / <strong> Arrendatario 3</strong> <br /> <span className='text-danger'>Quedan 0 hrs</span>
            <Card.Link href="#" className='ml-auto float-end text-danger'>NO HECHA</Card.Link>
          </Card.Body>
        </Card>
        
      </section>

        <section className='border p-3 rounded bg-white'>
        <h2>Mis Tareas </h2>

        <Card className='mb-3 card-tarea active'>
          <Card.Body className='shadow-sm'>
            Patio / <strong> Arrendatario 1</strong> <br /> <span className='text-success'>Quedan 11 hrs</span>
            <Card.Link href="#" className='ml-auto float-end'>EVIDENCIA</Card.Link>
          </Card.Body>
        </Card>

        <Card className='mb-3 card-tarea active'>
          <Card.Body className='shadow-sm'>
            Cocina / <strong> Arrendatario 2</strong> <br /> <span className='text-success'>Quedan 5 hrs</span>
            <Card.Link href="#" className='ml-auto float-end'>EVIDENCIA</Card.Link>
          </Card.Body>
        </Card>
      </section>
      </div>
    );
}

export default Dashboard;