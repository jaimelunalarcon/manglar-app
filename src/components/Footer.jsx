import React from 'react';

export default function Footer() {
  return (
    <footer className="py-4 bg-light shadow border-top mt-auto">
      <div className="container text-center">
        <small> <strong>Manglar App</strong> {new Date().getFullYear()} &copy;Todos los derechos reservados</small>
      </div>
    </footer>
  );
}
