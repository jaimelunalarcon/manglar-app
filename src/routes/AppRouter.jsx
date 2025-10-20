import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import BaseLayout from '../layouts/BaseLayout';
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';

import AdminDashboard from '../pages/admin/Dashboard';
import AdminTareas from '../pages/admin/Tareas';
import AdminFinanzas from '../pages/admin/Finanzas';
import AdminUsuarios from '../pages/admin/Usuarios';

import ArriDashboard from '../pages/arrendatario/Dashboard';
import ArriTareas from '../pages/arrendatario/Tareas';
import ArriFinanzas from '../pages/arrendatario/Finanzas';

import { useAuth } from '../context/AuthContext';

function HomeRedirect() {
  const { user, isHydrating } = useAuth();
  if (isHydrating) return null; // o un loader
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/arrendatario'} replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <BaseLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="tareas" element={<AdminTareas />} />
        <Route path="finanzas" element={<AdminFinanzas />} />
        <Route path="usuarios" element={<AdminUsuarios />} />
      </Route>

      {/* Arrendatario */}
      <Route
        path="/arrendatario"
        element={
          <ProtectedRoute allowedRoles={['arrendatario']}>
            <BaseLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ArriDashboard />} />
        <Route path="tareas" element={<ArriTareas />} />
        <Route path="finanzas" element={<ArriFinanzas />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
