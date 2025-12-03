import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { usePermissions } from '../hooks/usePermissions';
import logo from '../assets/logo.svg';
import '../navbar.css';

export default function Navbar({ brand = "App", links = [], onLogout }) {
  const { user } = useAuth();
  const { isAdmin, isSupervisor, isArrendatario } = usePermissions();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  const handleGoToProfile = () => {
    navigate('/perfil');
  };

  return (
    <nav className="navbar nav-manlgar navbar-expand-lg navbar-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <img src={logo} alt="" width={130} height={40} />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div id="mainNav" className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            {links.map((l) => (
              <li className="nav-item" key={l.to}>
                <NavLink
                  className={({ isActive }) =>
                    "nav-link" + (isActive ? " active" : "")
                  }
                  to={l.to}
                >
                  {l.icon && (
                    <i className={`bi ${l.icon} me-2`} aria-hidden="true"></i>
                  )}
                  {l.label}
                </NavLink>
              </li>
            ))}

            {/* Dropdown de usuario */}
            {user && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="userDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle me-1" aria-hidden="true"></i>
                  {user.nombre || user.name || 'Usuario'}
                  {isAdmin && (
                    <span className="badge bg-danger ms-2" style={{ fontSize: '0.7rem' }}>
                      Admin
                    </span>
                  )}
                  {isSupervisor && (
                    <span className="badge bg-warning ms-2" style={{ fontSize: '0.7rem' }}>
                      Supervisor
                    </span>
                  )}
                  {isArrendatario && (
                    <span className="badge bg-info ms-2" style={{ fontSize: '0.7rem' }}>
                      Arrendatario
                    </span>
                  )}
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  {/* Información del usuario */}
                  <li className="dropdown-header text-center">
                    <i className="bi bi-person-circle" style={{ fontSize: '2rem' }}></i>
                    <div className="mt-2">
                      <strong>{user.nombre || user.name}</strong>
                    </div>
                    <small className="text-muted">{user.email}</small>
                    <div className="mt-1">
                      <small className="text-muted">RUT: {user.rut}</small>
                    </div>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>

                  {/* Mi Perfil */}
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={handleGoToProfile}
                    >
                      <i className="bi bi-person me-2"></i>
                      Mi Perfil
                    </button>
                  </li>

                  {/* Configuración (solo Admin) */}
                  {isAdmin && (
                    <li>
                      <Link className="dropdown-item" to="/admin/configuracion">
                        <i className="bi bi-gear me-2"></i>
                        Configuración
                      </Link>
                    </li>
                  )}

                  <li>
                    <hr className="dropdown-divider" />
                  </li>

                  {/* Cerrar Sesión */}
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </li>
            )}

            {/* Botón de cerrar sesión (fallback si no hay usuario cargado) */}
            {onLogout && !user && (
              <li className="nav-item">
                <button className="btn btn-danger ms-2" onClick={onLogout}>
                  Cerrar sesión
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
