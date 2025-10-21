import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState({
    id: null,
    nombre: '',
    email: '',
    rol: '',
    estado: 'activo'
  });

  // Cargar usuarios desde localStorage al iniciar
  useEffect(() => {
    const usuariosGuardados = localStorage.getItem('usuarios');
    if (usuariosGuardados) {
      setUsuarios(JSON.parse(usuariosGuardados));
    }
  }, []);

  // Guardar usuarios en localStorage cada vez que cambien
  useEffect(() => {
    if (usuarios.length > 0) {
      localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }
  }, [usuarios]);

  // Abrir modal para crear
  const handleNuevo = () => {
    setModoEdicion(false);
    setUsuarioActual({
      id: null,
      nombre: '',
      email: '',
      rol: '',
      estado: 'activo'
    });
    setShowModal(true);
  };

  // Abrir modal para editar
  const handleEditar = (usuario) => {
    setModoEdicion(true);
    setUsuarioActual(usuario);
    setShowModal(true);
  };

  // Guardar (crear o actualizar)
  const handleGuardar = () => {
    if (!usuarioActual.nombre || !usuarioActual.email || !usuarioActual.rol) {
      alert('Por favor complete todos los campos');
      return;
    }

    if (modoEdicion) {
      // Actualizar usuario existente
      setUsuarios(usuarios.map(u => 
        u.id === usuarioActual.id ? usuarioActual : u
      ));
    } else {
      // Crear nuevo usuario
      const nuevoUsuario = {
        ...usuarioActual,
        id: Date.now() // ID único basado en timestamp
      };
      setUsuarios([...usuarios, nuevoUsuario]);
    }

    setShowModal(false);
  };

  // Eliminar usuario
  const handleEliminar = (id) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      const nuevosUsuarios = usuarios.filter(u => u.id !== id);
      setUsuarios(nuevosUsuarios);
      localStorage.setItem('usuarios', JSON.stringify(nuevosUsuarios));
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuarioActual({
      ...usuarioActual,
      [name]: value
    });
  };

  return (
    <div>
      <div className='header-section'>

      <h1 className="mb-3 mt-3"><i class="bi me-2 bi-people-fill me-2" aria-hidden="true"></i>Usuarios</h1>
      </div>

      <div className="p-4 bg-white rounded border mt-3">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Button className='btn btn-success rounded-pill' onClick={handleNuevo}>
            + Nuevo Usuario
          </Button>
        </div>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
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
                <tr key={usuario.id}>
                  <td>{usuario.id}</td>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.rol}</td>
                  <td>
                    <span className={`badge bg-${usuario.estado === 'activo' ? 'success' : 'secondary'}`}>
                      {usuario.estado}
                    </span>
                  </td>
                  <td>
                    <Button 
                      variant="warning" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleEditar(usuario)}
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleEliminar(usuario.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {/* Modal para crear/editar */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              {modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={usuarioActual.nombre}
                  onChange={handleChange}
                  placeholder="Ingrese el nombre"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={usuarioActual.email}
                  onChange={handleChange}
                  placeholder="Ingrese el email"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Rol</Form.Label>
                <Form.Select
                  name="rol"
                  value={usuarioActual.rol}
                  onChange={handleChange}
                >
                  <option value="">Seleccione un rol</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Usuario">Usuario</option>
                  <option value="Supervisor">Supervisor</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Select
                  name="estado"
                  value={usuarioActual.estado}
                  onChange={handleChange}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleGuardar}>
              {modoEdicion ? 'Actualizar' : 'Guardar'}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default Usuarios;