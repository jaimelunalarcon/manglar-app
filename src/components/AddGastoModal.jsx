// src/components/AddGastoModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

export default function AddGastoModal({ show, onClose, onSave }) {
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');         // formato YYYY-MM-DD
  const [monto, setMonto] = useState('');         // string para permitir vacío
  const [boleta, setBoleta] = useState(null);     // File | null
  const [errors, setErrors] = useState({});

  // limpiar el formulario cuando se abra/cierre
  useEffect(() => {
    if (!show) {
      setNombre('');
      setFecha('');
      setMonto('');
      setBoleta(null);
      setErrors({});
    }
  }, [show]);

  const validate = () => {
    const e = {};
    if (!nombre.trim()) e.nombre = 'Ingresa el nombre del gasto';
    if (!fecha) e.fecha = 'Selecciona una fecha';
    if (!monto || Number(monto) <= 0) e.monto = 'Ingresa un monto válido';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    onSave({
      id: Date.now(),
      nombre: nombre.trim(),
      fecha,                              // YYYY-MM-DD (puedes formatear al render)
      monto: Number(monto),
      boleta,                             // File (opcional)
    });
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Form onSubmit={handleSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title>Agregar gasto</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre del gasto</Form.Label>
            <Form.Control
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              isInvalid={!!errors.nombre}
              placeholder="Ej: Feria, Arreglo techo…"
            />
            <Form.Control.Feedback type="invalid">
              {errors.nombre}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha</Form.Label>
            <Form.Control
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              isInvalid={!!errors.fecha}
            />
            <Form.Control.Feedback type="invalid">
              {errors.fecha}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Monto</Form.Label>
            <Form.Control
              type="number"
              inputMode="numeric"
              min="0"
              step="100"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              isInvalid={!!errors.monto}
              placeholder="Ej: 20000"
            />
            <Form.Control.Feedback type="invalid">
              {errors.monto}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">Monto en CLP (solo número).</Form.Text>
          </Form.Group>

          <Form.Group className="mb-1">
            <Form.Label>Boleta (opcional)</Form.Label>
            <Form.Control
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setBoleta(e.target.files?.[0] ?? null)}
            />
            {boleta && <small className="text-muted">Archivo: {boleta.name}</small>}
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="success">Guardar</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
