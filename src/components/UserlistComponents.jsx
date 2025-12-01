import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/authContext';
import usuarioService from '../api/usuarioService';
import { validarRut, formatearRut } from '../utils/rutValidator';

const UserList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' o 'edit'
  const [usuarioActual, setUsuarioActual] = useState({
    rut: '',
    nombre: '',
    email: '',
    rol: 'ADMINISTRADOR',
    estado: 'ACTIVO',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [alertMessage, setAlertMessage] = useState({ show: false, message: '', variant: '' });
  const [loading, setLoading] = useState(false);
  const [loadingTable, setLoadingTable] = useState(true);

  const { logout, user } = useAuth();

  // Cargar usuarios al montar el componente
  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Función para cargar usuarios desde el backend
  const cargarUsuarios = async () => {
    try {
      setLoadingTable(true);
      const data = await usuarioService.obtenerTodos();
      setUsuarios(data);
    } catch (error) {
      mostrarAlerta(error.message, 'danger');
    } finally {
      setLoadingTable(false);
    }
  };

  // Mostrar alerta temporal
  const mostrarAlerta = (message, variant = 'success') => {
    setAlertMessage({ show: true, message, variant });
    setTimeout(() => {
      setAlertMessage({ show: false, message: '', variant: '' });
    }, 3000);
  };

  // Abrir modal para crear usuario
  const handleCreate = () => {
    setModalMode('create');
    setUsuarioActual({
      rut: '',
      nombre: '',
      email: '',
      rol: 'ADMINISTRADOR',
      estado: 'ACTIVO',
      password: '',
    });
    setErrors({});
    setShowModal(true);
  };

  // Abrir modal para editar usuario
  const handleEdit = (usuario) => {
    setModalMode('edit');
    setUsuarioActual({
      ...usuario,
      password: '', // No mostrar la contraseña actual
    });
    setErrors({});
    setShowModal(true);
  };

  // Validar formulario
  const validarFormulario = () => {
    const newErrors = {};

    // Validar RUT (solo en modo crear, ya que el RUT no se puede cambiar)
    if (modalMode === 'create') {
      if (!usuarioActual.rut.trim()) {
        newErrors.rut = 'El RUT es obligatorio';
      } else if (!validarRut(usuarioActual.rut)) {
        newErrors.rut = 'RUT inválido';
      }
    }

    // Validar nombre
    if (!usuarioActual.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!usuarioActual.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!emailRegex.test(usuarioActual.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar contraseña (obligatoria solo al crear)
    if (modalMode === 'create' && !usuarioActual.password.trim()) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (usuarioActual.password && usuarioActual.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Guardar usuario (crear o actualizar)
  const handleSave = async () => {
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      // Preparar datos del usuario
      const usuarioData = {
        ...usuarioActual,
        rut: formatearRut(usuarioActual.rut), // Formatear RUT antes de enviar
      };

      // Si estamos editando y no se ingresó contraseña, no la enviamos
      if (modalMode === 'edit' && !usuarioData.password) {
        delete usuarioData.password;
      }

      if (modalMode === 'create') {
        await usuarioService.crear(usuarioData);
        mostrarAlerta('Usuario creado exitosamente', 'success');
      } else {
        await usuarioService.actualizar(usuarioActual.rut, usuarioData);
        mostrarAlerta('Usuario actualizado exitosamente', 'success');
      }

      setShowModal(false);
      cargarUsuarios(); // Recargar la lista
    } catch (error) {
      mostrarAlerta(error.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar usuario
  const handleDelete = async (rut) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      try {
        await usuarioService.eliminar(rut);
        mostrarAlerta('Usuario eliminado exitosamente', 'success');
        cargarUsuarios(); // Recargar la lista
      } catch (error) {
        mostrarAlerta(error.message, 'danger');
      }
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUsuarioActual({
      ...usuarioActual,
      [name]: value,
    });
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestión de Usuarios</h1>
        <div>
          <span className="me-3">Bienvenido, {user?.nombre}</span>
          <Button variant="outline-danger" onClick={logout}>
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {alertMessage.show && (
        <Alert variant={alertMessage.variant} dismissible onClose={() => setAlertMessage({ show: false })}>
          {alertMessage.message}
        </Alert>
      )}

      <Button variant="primary" className="mb-3" onClick={handleCreate}>
        Crear Usuario
      </Button>

      {loadingTable ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>RUT</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  No hay usuarios registrados
                </td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.rut}>
                  <td>{usuario.rut}</td>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.rol}</td>
                  <td>
                    <span className={`badge bg-${usuario.estado === 'ACTIVO' ? 'success' : 'secondary'}`}>
                      {usuario.estado}
                    </span>
                  </td>
                  <td>
                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(usuario)}>
                      Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(usuario.rut)}>
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* Modal para crear/editar */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalMode === 'create' ? 'Crear Usuario' : 'Editar Usuario'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>RUT</Form.Label>
              <Form.Control
                type="text"
                name="rut"
                value={usuarioActual.rut}
                onChange={handleInputChange}
                isInvalid={!!errors.rut}
                disabled={modalMode === 'edit'}
                placeholder="12345678-9"
              />
              <Form.Control.Feedback type="invalid">{errors.rut}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={usuarioActual.nombre}
                onChange={handleInputChange}
                isInvalid={!!errors.nombre}
              />
              <Form.Control.Feedback type="invalid">{errors.nombre}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={usuarioActual.email}
                onChange={handleInputChange}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Form.Select name="rol" value={usuarioActual.rol} onChange={handleInputChange}>
                <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                <option value="ARRENDATARIO">ARRENDATARIO</option>
                <option value="SUPERVISOR">SUPERVISOR</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select name="estado" value={usuarioActual.estado} onChange={handleInputChange}>
                <option value="ACTIVO">ACTIVO</option>
                <option value="INACTIVO">INACTIVO</option>
                <option value="BLOQUEADO">BLOQUEADO</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contraseña {modalMode === 'edit' && '(dejar en blanco para no cambiar)'}</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={usuarioActual.password}
                onChange={handleInputChange}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserList;