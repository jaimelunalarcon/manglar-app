import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import usuarioService from '../../api/usuarioService';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState({
    rut: '',
    nombre: '',
    email: '',
    password: '',
    rol: 'ADMINISTRADOR',
    estado: 'ACTIVO'
  });
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingTable, setLoadingTable] = useState(true);
  const [alertMessage, setAlertMessage] = useState({ show: false, message: '', variant: '' });

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

  // Mostrar alerta temporal
  const mostrarAlerta = (message, variant = 'success') => {
    setAlertMessage({ show: true, message, variant });
    setTimeout(() => {
      setAlertMessage({ show: false, message: '', variant: '' });
    }, 3000);
  };

  // Cargar usuarios desde el backend
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

  // Cargar usuarios al iniciar
  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Abrir modal para crear
  const handleNuevo = () => {
    setModoEdicion(false);
    setUsuarioActual({
      rut: '',
      nombre: '',
      email: '',
      password: '',
      rol: 'ADMINISTRADOR',
      estado: 'ACTIVO'
    });
    setErrores({});
    setShowModal(true);
  };

  // Abrir modal para editar
  const handleEditar = (usuario) => {
    setModoEdicion(true);
    setUsuarioActual({
      ...usuario,
      password: '' // No mostrar la contraseña actual
    });
    setErrores({});
    setShowModal(true);
  };

  // Guardar (crear o actualizar)
  const handleGuardar = async () => {
    // Validaciones
    const nuevosErrores = {};

    // Validar RUT (solo al crear, no se puede cambiar al editar)
    if (!modoEdicion) {
      if (!usuarioActual.rut.trim()) {
        nuevosErrores.rut = 'El RUT es obligatorio';
      } else if (!validarRUT(usuarioActual.rut)) {
        nuevosErrores.rut = 'El RUT no es válido';
      }
    }

    if (!usuarioActual.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    }

    if (!usuarioActual.email.trim()) {
      nuevosErrores.email = 'El email es obligatorio';
    } else if (!validarEmail(usuarioActual.email)) {
      nuevosErrores.email = 'El email no es válido';
    }

    // Validar contraseña (solo al crear, no al editar)
    if (!modoEdicion) {
      if (!usuarioActual.password.trim()) {
        nuevosErrores.password = 'La contraseña es obligatoria';
      } else if (usuarioActual.password.length < 6) {
        nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
      }
    }

    if (!usuarioActual.rol) {
      nuevosErrores.rol = 'El rol es obligatorio';
    }

    // Si hay errores, no continuar
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setLoading(true);

    try {
      // Preparar datos del usuario
      const usuarioData = {
        rut: usuarioActual.rut,
        nombre: usuarioActual.nombre,
        email: usuarioActual.email,
        rol: usuarioActual.rol,
        estado: usuarioActual.estado,
      };

      // Solo incluir contraseña al CREAR
      if (!modoEdicion) {
        usuarioData.password = usuarioActual.password;
      }

      if (modoEdicion) {
        await usuarioService.actualizar(usuarioActual.rut, usuarioData);
        mostrarAlerta('Usuario actualizado exitosamente', 'success');
      } else {
        await usuarioService.crear(usuarioData);
        mostrarAlerta('Usuario creado exitosamente', 'success');
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
  const handleEliminar = async (rut) => {
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

  // Mapear nombre de rol para mostrar
  const obtenerNombreRol = (rol) => {
    const roles = {
      'ADMINISTRADOR': 'Administrador',
      'ARRENDATARIO': 'Arrendatario',
      'SUPERVISOR': 'Supervisor'
    };
    return roles[rol] || rol;
  };

  // Mapear estado para mostrar
  const obtenerNombreEstado = (estado) => {
    const estados = {
      'ACTIVO': 'Activo',
      'INACTIVO': 'Inactivo',
      'BLOQUEADO': 'Bloqueado'
    };
    return estados[estado] || estado;
  };

  return (
    <div>
      <div className="header-section">
             <Button variant="success" className='float-end rounded-pill rounded' onClick={handleNuevo}>
          + Nuevo Usuario
        </Button>
              <h1 className="mt-3">
                <i className="bi bi-people-fill me-2" aria-hidden="true"></i> Usuarios
              </h1>
             
            </div>
    <div className="p-4 bg-white rounded border mt-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0"></h2>
        
      </div>

      {alertMessage.show && (
        <Alert variant={alertMessage.variant} dismissible onClose={() => setAlertMessage({ show: false })}>
          {alertMessage.message}
        </Alert>
      )}

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
                  <td>{obtenerNombreRol(usuario.rol)}</td>
                  <td>
                    <span className={`badge bg-${usuario.estado === 'ACTIVO' ? 'success' : usuario.estado === 'INACTIVO' ? 'secondary' : 'danger'}`}>
                      {obtenerNombreEstado(usuario.estado)}
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
                      onClick={() => handleEliminar(usuario.rut)}
                    >
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
          <Modal.Title>
            {modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="rut">RUT <span className="text-danger">*</span></Form.Label>
              <Form.Control
                id="rut"
                type="text"
                name="rut"
                value={usuarioActual.rut}
                onChange={handleChange}
                placeholder="Ej: 12345678-9"
                isInvalid={!!errores.rut}
                maxLength="12"
                disabled={modoEdicion}
              />
              <Form.Control.Feedback type="invalid">
                {errores.rut}
              </Form.Control.Feedback>
              {!modoEdicion && (
                <Form.Text className="text-muted">
                  Ingrese el RUT, se formateará automáticamente
                </Form.Text>
              )}
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

            {/* Solo mostrar contraseña al CREAR, no al EDITAR */}
            {!modoEdicion && (
              <Form.Group className="mb-3">
                <Form.Label>
                  Contraseña <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={usuarioActual.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  isInvalid={!!errores.password}
                />
                <Form.Control.Feedback type="invalid">
                  {errores.password}
                </Form.Control.Feedback>
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Rol <span className="text-danger">*</span></Form.Label>
              <Form.Select
                name="rol"
                value={usuarioActual.rol}
                onChange={handleChange}
                isInvalid={!!errores.rol}
              >
                <option value="">Seleccione un rol</option>
                <option value="ADMINISTRADOR">Administrador</option>
                <option value="ARRENDATARIO">Arrendatario</option>
                <option value="SUPERVISOR">Supervisor</option>
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
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
                <option value="BLOQUEADO">Bloqueado</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleGuardar} disabled={loading}>
            {loading ? 'Guardando...' : modoEdicion ? 'Actualizar' : 'Guardar'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  </div>

  );
}

export default Usuarios;