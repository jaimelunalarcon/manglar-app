import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

function Loader() {
  // Puedes estilizarlo con Bootstrap si quieres
  return (
    <div className="d-flex align-items-center justify-content-center" style={{minHeight:'40vh'}}>
      <div className="spinner-border" role="status" aria-label="Cargando..." />
    </div>
  );
}

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isHydrating } = useAuth();

  // 1) mientras hidratamos, no decidimos (evita salto a /login)
  if (isHydrating) return <Loader />;

  // 2) sin usuario -> al login
  if (!user) return <Navigate to="/login" replace />;

  // 3) sin permisos -> a su home por rol
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const target = user.role === 'admin' ? '/admin' : '/arrendatario';
    return <Navigate to={target} replace />;
  }

  return children;
}
