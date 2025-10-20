import React from 'react';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';

function Finanzas() {
  return (
  <div>
    <h2 className='mb-3'><i class="bi me-2 bi-bar-chart-fill"></i>Finanzas (Admin)</h2>
    <Row>
      <Col sm={12} md={12}>
        <div className='border bg-white p-4 rounded mb-4'>
          <h2>Ingresos anuales</h2>
          --->Aca va el gráfico <strong> Hijo del pico</strong>
        </div>
      </Col>
      <Row>
        <Col sm={12} md={4}>
        <div className='pb-4'>
          <label htmlFor="">Selecciona el mes</label>
          <Form.Select aria-label="Default select example">
            <option>Octubre</option>
            <option value="1">Enero</option>
            <option value="2">Febrero</option>
            <option value="3">Marzo</option>
            <option value="3">Anril</option>
            <option value="3">Mayo</option>
            <option value="3">Junio</option>
            <option value="3">Julio</option>
            <option value="3">Agosto</option>
            <option value="3">Septiembre</option>
            <option value="3">Noviembre</option>
            <option value="3">Diciebre</option>
          </Form.Select>
        </div>
        </Col>
      </Row>
        <Col sm={12} md={6} >
        <Table hover responsive>
        <thead>
          <tr className='text-center text-white'>
            <th className=' bg-secondary text-white'>Usuario</th>
            <th className=' bg-secondary text-white'>Puntos</th>
            <th className=' bg-secondary text-white'>Abono</th>
            <th className=' bg-secondary text-white'>Deuda</th>
          </tr>
        </thead>
        <tbody>
          <tr className='text-center'>
            <td>Felipe</td>
            <td>10</td>
            <td>$20.000 <a href="#" className='ms-2'><Badge pill bg="info">+</Badge></a></td>
            <td className='text-center'>$14.000</td>   
          </tr>
          <tr className='text-center'>
             <td>Kototo</td>
            <td>2</td>
            <td>$20.000<a href="#" className='ms-2'><Badge pill bg="info">+</Badge></a></td>
            <td className='text-center'>$34.000</td>
          </tr>
          <tr className='text-center'>
             <td>Mati</td>
            <td>0</td>
            <td>$40.000<a href="#" className='ms-2'><Badge pill bg="info">+</Badge></a></td>
            <td className='text-center'>$0</td>
          </tr>
          <tr className='text-center'>
             <td>Santi</td>
            <td>0</td>
            <td>$10.000<a href="#" className='ms-2'><Badge pill bg="info">+</Badge></a></td>
            <td className='text-center'>$0</td>
          </tr>
          <tr className='text-center'>
             <td>Fran</td>
            <td>0</td>
            <td>$20.000<a href="#" className='ms-2'><Badge pill bg="info">+</Badge></a></td>
            <td className='text-center'>$0</td>
          </tr>
  
        </tbody>
      </Table></Col>
        <Col sm={12} md={6}>
         <Table hover responsive>
        <thead>
          <tr className=' bg-secondary text-white'>
            <th className=' bg-secondary text-white'>Gasto</th>
            <th className='text-center bg-secondary text-white'>Fecha</th>
            <th className='text-center bg-secondary text-white'>Valor</th>
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
              <button className='btn btn-success my-2 float-end'>+ Agregar Gasto</button>

        </Col>
      </Row>
    

     
      <card className="border bg-white d-block p-3 rounded">
        Total ingresos casa <span className='float-end'>$210.000</span>
      </card>
  </div>
)};

export default Finanzas;
