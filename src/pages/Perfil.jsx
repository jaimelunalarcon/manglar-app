import React, { useState } from 'react';
import { Card, Button, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../context/authContext';

export default function Perfil() {
  const { user } = useAuth();
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    passwordActual: '',
    passwordNueva: '',
    confirmarPassword: '',
  });
  const [mensaje, setMensaje] = useState({ show: false, text: '', variant: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones
    if (formData.passwordNueva && formData.passwordNueva !== formData.confirmarPassword) {
      setMensaje({
        show: true,
        text: 'Las contraseñas no coinciden',
        variant: 'danger',
      });
      return;
    }

    // Aquí llamarías al servicio para actualizar el perfil
    setMensaje({
      show: true,
      text: 'Perfil actualizado exitosamente',
      variant: 'success',
    });
    setEditando(false);

    // Limpiar campos de contraseña
    setFormData({
      ...formData,
      passwordActual: '',
      passwordNueva: '',
      confirmarPassword: '',
    });
  };

  const getRolBadge = (rol) => {
    switch (rol) {
      case 'ADMINISTRADOR':
        return <span className="badge bg-danger">Administrador</span>;
      case 'SUPERVISOR':
        return <span className="badge bg-warning">Supervisor</span>;
      case 'ARRENDATARIO':
        return <span className="badge bg-info">Arrendatario</span>;
      default:
        return <span className="badge bg-secondary">{rol}</span>;
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">
        <i className="bi bi-person-circle me-2"></i>
        Mi Perfil
      </h2>

      {mensaje.show && (
        <Alert
          variant={mensaje.variant}
          dismissible
          onClose={() => setMensaje({ ...mensaje, show: false })}
        >
          {mensaje.text}
        </Alert>
      )}

      <div className="row">
        {/* Información del perfil */}
        <div className="col-lg-4 mb-4">
          <Card>
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="bi bi-person-circle text-primary" style={{ fontSize: '5rem' }}></i>
              </div>
              <h4>{user?.nombre}</h4>
              <p className="text-muted mb-2">{user?.email}</p>
              <div className="mb-3">
                {getRolBadge(user?.rol)}
              </div>
              <hr />
              <div className="text-start">
                <p className="mb-1">
                  <strong>RUT:</strong> {user?.rut}
                </p>
                <p className="mb-1">
                  <strong>Estado:</strong>{' '}
                  <span className="badge bg-success">{user?.estado}</span>
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Formulario de edición */}
        <div className="col-lg-8">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Información Personal</h5>
              {!editando && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setEditando(true)}
                >
                  <i className="bi bi-pencil me-1"></i>
                  Editar
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {/* Nombre */}
                <Form.Group className="mb-3">
                  <Form.Label>Nombre Completo</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    disabled={!editando}
                  />
                </Form.Group>

                {/* Email */}
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!editando}
                  />
                </Form.Group>

                {/* RUT (no editable) */}
                <Form.Group className="mb-3">
                  <Form.Label>RUT</Form.Label>
                  <Form.Control
                    type="text"
                    value={user?.rut || ''}
                    disabled
                  />
                  <Form.Text className="text-muted">
                    El RUT no se puede modificar
                  </Form.Text>
                </Form.Group>

                {/* Rol (no editable) */}
                <Form.Group className="mb-3">
                  <Form.Label>Rol</Form.Label>
                  <Form.Control
                    type="text"
                    value={user?.rol || ''}
                    disabled
                  />
                  <Form.Text className="text-muted">
                    El rol solo puede ser modificado por un Administrador
                  </Form.Text>
                </Form.Group>

                {/* Cambiar contraseña (solo si está editando) */}
                {editando && (
                  <>
                    <hr className="my-4" />
                    <h6 className="mb-3">Cambiar Contraseña</h6>

                    <Form.Group className="mb-3">
                      <Form.Label>Contraseña Actual</Form.Label>
                      <Form.Control
                        type="password"
                        name="passwordActual"
                        value={formData.passwordActual}
                        onChange={handleChange}
                        placeholder="Ingresa tu contraseña actual"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Nueva Contraseña</Form.Label>
                      <Form.Control
                        type="password"
                        name="passwordNueva"
                        value={formData.passwordNueva}
                        onChange={handleChange}
                        placeholder="Mínimo 6 caracteres"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Confirmar Nueva Contraseña</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmarPassword"
                        value={formData.confirmarPassword}
                        onChange={handleChange}
                        placeholder="Repite la nueva contraseña"
                      />
                    </Form.Group>

                    <Alert variant="info" className="small">
                      <i className="bi bi-info-circle me-2"></i>
                      Deja los campos de contraseña vacíos si no deseas cambiarla.
                    </Alert>
                  </>
                )}

                {/* Botones */}
                {editando && (
                  <div className="d-flex gap-2">
                    <Button variant="primary" type="submit">
                      <i className="bi bi-save me-1"></i>
                      Guardar Cambios
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setEditando(false);
                        setFormData({
                          nombre: user?.nombre || '',
                          email: user?.email || '',
                          passwordActual: '',
                          passwordNueva: '',
                          confirmarPassword: '',
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}