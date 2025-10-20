import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

export default function BaseLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const base = isAdmin ? '/admin' : '/arrendatario';

  const links = [
    { to: base, label: 'Dashboard' },
    { to: base + '/tareas', label: 'Tareas' },
    { to: base + '/finanzas', label: 'Finanzas' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar brand="Mi App" links={user ? links : []} onLogout={user ? handleLogout : undefined} />
      <main className="container py-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
