// src/pages/admin/Usuarios.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';

// Etiquetas “bonitas” para mostrar en tabla
const ROLE_LABEL = {
  admin: 'Administrador',
  arrendatario: 'Arrendatario',
};

// Normaliza valores antiguos del LS (“Administrador”, “Usuario”, “Supervisor” → admin/arrendatario)
function normalizeRole(raw) {
  const k = (raw || '').toString().trim().toLowerCase();
  if (k === 'admin' || k === 'administrador') return 'admin';
  // cualquier otro lo tratamos como arrendatario
  return 'arrendatario';
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState({
    id: null,
    rut: '',
    nombre: '',
    email: '',
    rol: 'arrendatario',  // valor compatible por defecto
    estado: 'activo',
  });
  const [errores, setErrores] = useState({});

  // Validar RUT chileno
  const validarRUT = (rut) => {
    // Eliminar puntos y guión
    rut = rut.replace(/\./g, '').replace(/-/g, '');
    
    if (rut.length < 2) return false;
    
    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1).toUpperCase();
    
    // Calcular dígito verificador
    let suma = 0;
    let multiplo = 2;
    
    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo.charAt(i)) * multiplo;
      multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }
    
    const dvEsperado = 11 - (suma % 11);
    const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : dvEsperado.toString();
    
    return dv === dvCalculado;
  };

  // Formatear RUT mientras se escribe
  const formatearRUT = (rut) => {
    // Eliminar todo excepto números y K
    rut = rut.replace(/[^0-9kK]/g, '');
    
    if (rut.length <= 1) return rut;
    
    // Separar cuerpo y dígito verificador
    const cuerpo = rut.slice(0, -1);
    const dv = rut.slice(-1);
    
    // Formatear con puntos
    let rutFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${rutFormateado}-${dv}`;
  };

  // Validar email
  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Cargar usuarios desde localStorage al iniciar (con normalización de rol)
  useEffect(() => {
    const raw = localStorage.getItem('usuarios');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      const fixed = Array.isArray(parsed)
        ? parsed.map(u => ({ ...u, rol: normalizeRole(u.rol) }))
        : [];
      setUsuarios(fixed);
      // opcional: reescribe ya normalizado
      localStorage.setItem('usuarios', JSON.stringify(fixed));
    } catch {
      // si algo viene corrupto, limpiamos
      localStorage.removeItem('usuarios');
    }
  }, []);

  // Guardar usuarios en localStorage cada vez que cambien
  useEffect(() => {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
  }, [usuarios]);

  // Abrir modal para crear
  const handleNuevo = () => {
    setModoEdicion(false);
    setUsuarioActual({
      id: null,
      rut: '',
      nombre: '',
      email: '',
      rol: 'arrendatario',  // default
      estado: 'activo',
    });
    setErrores({});
    setShowModal(true);
  };

  // Abrir modal para editar
  const handleEditar = (usuario) => {
    setModoEdicion(true);
    setUsuarioActual(usuario);
    setErrores({});
    setShowModal(true);
  };

  // Guardar (crear o actualizar)
  const handleGuardar = () => {
    // Validaciones
    const nuevosErrores = {};

    if (!usuarioActual.rut.trim()) {
      nuevosErrores.rut = 'El RUT es obligatorio';
    } else if (!validarRUT(usuarioActual.rut)) {
      nuevosErrores.rut = 'El RUT no es válido';
    }

    if (!usuarioActual.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    }

    if (!usuarioActual.email.trim()) {
      nuevosErrores.email = 'El email es obligatorio';
    } else if (!validarEmail(usuarioActual.email)) {
      nuevosErrores.email = 'El email no es válido';
    }

    if (!usuarioActual.rol) {
      nuevosErrores.rol = 'El rol es obligatorio';
    }

    // Si hay errores, no continuar
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    // Verificar RUT duplicado
    const rutLimpio = usuarioActual.rut.replace(/\./g, '').replace(/-/g, '');
    const rutDuplicado = usuarios.some(u => 
      u.id !== usuarioActual.id && 
      u.rut.replace(/\./g, '').replace(/-/g, '') === rutLimpio
    );

    if (rutDuplicado) {
      setErrores({ rut: 'Este RUT ya está registrado' });
      return;
    }
    if (!['admin', 'arrendatario'].includes(rol)) {
      alert('Rol inválido. Debe ser admin o arrendatario.');
      return;
    }

    if (modoEdicion) {
      setUsuarios(prev => prev.map(u => (u.id === usuarioActual.id ? usuarioActual : u)));
    } else {
      const nuevoUsuario = { ...usuarioActual, id: Date.now() }; // ID simple por timestamp
      setUsuarios(prev => [...prev, nuevoUsuario]);
    }

    setErrores({});
    setShowModal(false);
  };

  // Eliminar usuario
  const handleEliminar = (id) => {
    if (window.confirm('¿Está seguro de eliminar este usuario?')) {
      setUsuarios(prev => prev.filter(u => u.id !== id));
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Formatear RUT mientras se escribe
    if (name === 'rut') {
      const rutFormateado = formatearRUT(value);
      setUsuarioActual({
        ...usuarioActual,
        [name]: rutFormateado
      });
    } else {
      setUsuarioActual({
        ...usuarioActual,
        [name]: value
      });
    }

    // Limpiar error del campo al modificarlo
    if (errores[name]) {
      setErrores({
        ...errores,
        [name]: null
      });
    }
  };

  return (
    <div>
      <div className="header-section">
        <h1 className="mb-3 mt-3">
          <i className="bi bi-people-fill me-2" aria-hidden="true"></i>
          Usuarios
        </h1>
      </div>

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
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          ) : (
            usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.rut}</td>
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
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.id}</td>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.email}</td>
                  <td>{ROLE_LABEL[usuario.rol] ?? usuario.rol}</td>
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
              <Form.Label>RUT <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="rut"
                value={usuarioActual.rut}
                onChange={handleChange}
                placeholder="Ej: 12345678-9"
                isInvalid={!!errores.rut}
                maxLength="12"
              />
              <Form.Control.Feedback type="invalid">
                {errores.rut}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Ingrese el RUT, se formateará automáticamente
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={usuarioActual.nombre}
                onChange={handleChange}
                placeholder="Ingrese el nombre completo"
                isInvalid={!!errores.nombre}
              />
              <Form.Control.Feedback type="invalid">
                {errores.nombre}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={usuarioActual.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                isInvalid={!!errores.email}
              />
              <Form.Control.Feedback type="invalid">
                {errores.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rol <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="rol"
                value={usuarioActual.rol}
                onChange={handleChange}
                isInvalid={!!errores.rol}
              >
                <option value="">Seleccione un rol</option>
                <option value="Administrador">Administrador</option>
                <option value="Usuario">Usuario</option>
                <option value="Supervisor">Supervisor</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errores.rol}
              </Form.Control.Feedback>
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
};
