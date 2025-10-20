import React from 'react';
import Table from 'react-bootstrap/Table';

function Finanzas() {
  return (
  <div className='p-4 bg-white border mt-3'>
    <h2 className='mb-5'>Finanzas (Admin)</h2>
    <Table hover responsive>
        <thead>
          <tr className='text-center bg-dark text-white'>
            <th className=' bg-light'>Usuario</th>
            <th className=' bg-light'>Puntos</th>
            <th className=' bg-light'>Abono</th>
            <th className=' bg-light'>Deuda</th>
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
  </div>
)};

export default Finanzas;
