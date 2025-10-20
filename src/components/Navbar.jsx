import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from '../assets/logo.svg';
import '../navbar.css';



export default function Navbar({ brand="App", links=[], onLogout }) {
  return (
    <nav className="navbar nav-manlgar navbar-expand-lg navbar-dark">
      <div className="container">
        <Link className="navbar-brand" to="/"><img src={logo} alt="" width={130} height={40}/></Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div id="mainNav" className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto">
            {links.map(l => (
              <li className="nav-item" key={l.to}>
               <NavLink className={({isActive}) => "nav-link" + (isActive ? " active" : "")} to={l.to}>
                {l.icon && <i className={`bi ${l.icon} me-2`} aria-hidden="true"></i>}
                {l.label}
              </NavLink>

                
              </li>
            ))}
            {onLogout && (
              <li className="nav-item">
                <button className="btn btn-outline-danger ms-2" onClick={onLogout}>Cerrar sesión</button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
