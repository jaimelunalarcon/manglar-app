import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/authContext';

export default function BaseLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const base = isAdmin ? '/admin' : '/arrendatario';

  const links = isAdmin
    ? [
       { to: '/admin',          label: 'Dashboard', icon: 'bi-speedometer2' },
      { to: '/admin/tareas',   label: 'Tareas',    icon: 'bi-check2-square' },
      { to: '/admin/finanzas', label: 'Finanzas',  icon: 'bi-bar-chart-fill' }, // 👈
      { to: '/admin/usuarios', label: 'Usuarios',  icon: 'bi-people-fill' },
      ]
    : [
        { to: '/arrendatario',          label: 'Dashboard' },
        { to: '/arrendatario/tareas',   label: 'Tareas' },
        { to: '/arrendatario/finanzas', label: 'Finanzas' },
      ];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar brand="Mi App" links={user ? links : []} onLogout={user ? handleLogout : undefined} />
      <main className="container py-5">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
