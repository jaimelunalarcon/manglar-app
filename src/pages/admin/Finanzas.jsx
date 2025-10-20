import React from 'react';
import Table from 'react-bootstrap/Table';

function Finanzas() {
  return (
  <div>
    <h2 className='mb-5'>Finanzas (Admin)</h2>
    <Table hover responsive>
        <thead>
          <tr className='text-center text-white'>
            <th className=' bg-dark text-white'>Usuario</th>
            <th className=' bg-dark text-white'>Puntos</th>
            <th className=' bg-dark text-white'>Abono</th>
            <th className=' bg-dark text-white'>Deuda</th>
          </tr>
        </thead>
        <tbody>
          <tr className='text-center'>
            <td>Felipe</td>
            <td>10</td>
            <td>$20.000</td>
            <td className='text-center'>$14.000</td>   
          </tr>
          <tr className='text-center'>
             <td>Kototo</td>
            <td>2</td>
            <td>$20.000</td>
            <td className='text-center'>$34.000</td>
          </tr>
          <tr className='text-center'>
             <td>Mati</td>
            <td>0</td>
            <td>$40.000</td>
            <td className='text-center'>$0</td>
          </tr>
  
        </tbody>
      </Table>

      <Table hover responsive className='mt-3 mb-3'>
        <thead>
          <tr className=' bg-dark text-white'>
            <th className=' bg-dark text-white'>Gasto</th>
            <th className='text-center bg-dark text-white'>Fecha</th>
            <th className='text-center bg-dark text-white'>Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Feria</td>
            <td className='text-center'>01/10/25</td>
            <td className='text-center'>$40.000</td>
          </tr>
          <tr>
             <td>Productos de Aseo</td>
            <td className='text-center'>04/10/25</td>
            <td className='text-center'>$20.000</td>
          </tr>
          <tr>
             <td>Arreglo Techo</td>
            <td className='text-center'>10/10/2025</td>
            <td className='text-center'>$200.000</td>
          </tr>
  
        </tbody>
      </Table>
      <card className="border bg-white d-block p-3 rounded">
        Total ingresos casa <span className='float-end'>$210.000</span>
      </card>
  </div>
)};

export default Finanzas;
