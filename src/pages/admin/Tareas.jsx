import React from 'react';
import Table from 'react-bootstrap/Table';

function Tareas() {
  return (
  <div className='p-4 bg-white border mt-3'>
    <h2 className=''>Tareas (Admin)</h2>
    <p className='mb-5'>Semana 06 oct - 12 oct <button className='float-end btn btn-success rounded-pill'>+ Agregar tarea</button></p>
    <Table striped bordered hover responsive>
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
)};

export default Tareas;
