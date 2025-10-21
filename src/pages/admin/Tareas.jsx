import React from 'react';
import Table from 'react-bootstrap/Table';

function Tareas() {
  return (
    <div>
    <div className='header-section'>
      <button className='float-end btn mt-3 btn-success rounded-pill'>+ Agregar tarea</button>
      <h1 className='mt-3'><i class="bi bi-check2-square me-2" aria-hidden="true"></i> Tareas</h1>
      <p className='mb-4 subtitle'> <i className="bi bi-calendar me-3" aria-hidden="true"></i>Semana 20 oct - 26 oct</p>
    </div>
    <div className='p-4 bg-white rounded border mt-3'>
    <Table striped bordered hover responsive className='mb-0'>
        <thead>
          <tr className='text-center'>
            <th>N°</th>
            <th>Tareas</th>
            <th>Pts</th>
            <th>Lunes</th>
            <th>Martes</th>
            <th>Miercoles</th>
            <th>Jueves</th>
            <th>Viernes</th>
            <th>Sábado</th>
            <th>Domingo</th>
          </tr>
        </thead>
        <tbody>
          <tr className='text-center'>
            <td>2</td>
            <td>Patio</td>
            <td>3</td>
            <td className='text-center'><input className="form-check-input" type="checkbox" /></td>
            <td className='text-center'><input className="form-check-input" type="checkbox" /></td>
            <td className='text-center'><input className="form-check-input" type="checkbox" /></td>
            <td className='text-center'><input className="form-check-input" type="checkbox" /></td>
            <td className='text-center'><input className="form-check-input" type="checkbox" /></td>
            <td className='text-center'><input className="form-check-input" type="checkbox" /></td>
            <td className='text-center'><input className="form-check-input" type="checkbox" /></td>
          </tr>
          <tr className='text-center'>
            <td>7</td>
            <td>Cocina</td>
            <td>2</td>
         <td className='text-center'><input className="form-check-input" type="checkbox" /></td>
            <td className='text-center'><input className="form-check-input" type="checkbox" /></td>
            <td className='text-center'><input className="form-check-input" type="checkbox" /></td>
            <td className='text-center'><input className="form-check-input" type="checkbox" /></td>
            <td className='text-center'><input className="form-check-input" type="checkbox" /></td>
            <td className='text-center'><input className="form-check-input" type="checkbox" /></td>
            <td className='text-center'><input className="form-check-input" type="checkbox" /></td>          </tr>
          <tr className='text-center'>
            <td>3</td>
            <td >Pasillo</td>
            <td>2</td>
         <td className='text-center'><input className="form-check-input" type="checkbox" /></td>
            <td className='text-center'><input className="form-check-input" type="checkbox" /></td>
            <td className='text-center'><input className="form-check-input" type="checkbox" /></td>
            <td className='text-center'><input className="form-check-input" type="checkbox" /></td>
            <td className='text-center'><input className="form-check-input" type="checkbox" /></td>
            <td className='text-center'><input className="form-check-input" type="checkbox" /></td>
            <td className='text-center'><input className="form-check-input" type="checkbox" /></td>          </tr>
  
        </tbody>
      </Table>
    </div>
  </div>
)};

export default Tareas;
