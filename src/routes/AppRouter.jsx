// src/router/AppRouter.jsx (o donde lo tengas)
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import ProtectedRoute from '../components/ProtectedRoute';

// Páginas públicas
import Login from '../pages/Login';

// Páginas de Admin
import AdminDashboard from '../pages/admin/Dashboard';
import Usuarios from '../pages/admin/Usuarios';
import AdminTareas from '../pages/admin/Tareas';
import AdminFinanzas from '../pages/admin/Finanzas';

// Páginas de Arrendatario
import ArrendatarioDashboard from '../pages/arrendatario/Dashboard';
import ArrendatarioTareas from '../pages/arrendatario/Tareas';
import ArrendatarioFinanzas from '../pages/arrendatario/Finanzas';

// Páginas compartidas
import Perfil from '../pages/Perfil';

// Layout con Navbar + Footer + <Outlet/>
import BaseLayout from '../layouts/BaseLayout';

const AppRouter = () => {
  const { user, isHydrating } = useAuth();

  // Mientras se carga el estado de autenticación
  if (isHydrating) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: '100vh' }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Ruta pública: Login */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to={user.role === 'admin' ? '/admin' : '/arrendatario'}
              replace
            />
          ) : (
            <Login />
          )
        }
      />

      {/* Rutas que usan BaseLayout (Navbar + Footer) */}
      <Route element={<BaseLayout />}>
        {/* Rutas de ADMINISTRADOR */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Usuarios />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/tareas"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminTareas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/finanzas"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminFinanzas />
            </ProtectedRoute>
          }
        />

        {/* Rutas de ARRENDATARIO */}
        <Route
          path="/arrendatario"
          element={
            <ProtectedRoute allowedRoles={['arrendatario']}>
              <ArrendatarioDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/arrendatario/tareas"
          element={
            <ProtectedRoute allowedRoles={['arrendatario']}>
              <ArrendatarioTareas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/arrendatario/finanzas"
          element={
            <ProtectedRoute allowedRoles={['arrendatario']}>
              <ArrendatarioFinanzas />
            </ProtectedRoute>
          }
        />

        {/* Rutas compartidas (cualquier usuario autenticado) */}
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <Perfil />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Ruta raíz: redirige según el rol */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate
              to={user.role === 'admin' ? '/admin' : '/arrendatario'}
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Ruta 404: redirige según autenticación */}
      <Route
        path="*"
        element={
          user ? (
            <Navigate
              to={user.role === 'admin' ? '/admin' : '/arrendatario'}
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default AppRouter;