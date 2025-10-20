// src/pages/Login.jsx (o donde lo tengas)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './login.css';
import logo from '../assets/login-logo.svg';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('12345');

  // errores por campo + error general del formulario
  const [fieldErrors, setFieldErrors] = useState({ username: '', password: '', form: '' });
  const [touched, setTouched] = useState({ username: false, password: false });

  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({ username: '', password: '', form: '' });

    const res = await login({ username, password });

    if (!res.ok) {
      // Mapea errores por campo si vienen del AuthContext
      if (res.errors) {
        setFieldErrors((prev) => ({
          ...prev,
          username: res.errors.username || '',
          password: res.errors.password || '',
        }));
      }
      // Mensaje general (por ejemplo, credenciales inválidas)
      if (res.error) {
        setFieldErrors((prev) => ({ ...prev, form: res.error }));
      } else if (!res.errors) {
        setFieldErrors((prev) => ({ ...prev, form: 'Credenciales inválidas' }));
      }
      // marca como "tocado" para disparar estilos
      setTouched({ username: true, password: true });
      return;
    }

    // Éxito
    navigate(res.user.role === 'admin' ? '/admin' : '/arrendatario', { replace: true });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
  };

  const handleChangeUsername = (e) => {
    setUsername(e.target.value);
    // Limpia error de ese campo al escribir
    if (fieldErrors.username) {
      setFieldErrors((prev) => ({ ...prev, username: '' }));
    }
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: '' }));
    }
  };

  return (
    <div className="login-page">
    <div className="row justify-content-center">
      <div className="col-11 col-md-6 col-lg-4">
        <div className="text-center">
          <img src={logo} alt="Logo" width={100} className='mb-3' />
          <h1>RED MANGLAR</h1>
          <h3 className="mb-3">Iniciar sesión</h3>
        </div>

        <div className="card shadow border-0">
          <div className="card-body">
            {/* Error general del formulario */}
            {fieldErrors.form && <div className="alert alert-danger">{fieldErrors.form}</div>}

            <form onSubmit={onSubmit} noValidate>
              {/* Usuario */}
              <div className="mb-3">
                <label className="form-label" htmlFor="username">Usuario</label>
                <input
                  id="username"
                  name="username"
                  className={`form-control ${
                    touched.username && fieldErrors.username ? 'is-invalid' : ''
                  }`}
                  placeholder="ej. admin o arrendatario1"
                  value={username}
                  onChange={handleChangeUsername}
                  onBlur={handleBlur}
                  autoComplete="username"
                  aria-invalid={touched.username && !!fieldErrors.username}
                  aria-describedby={touched.username && fieldErrors.username ? 'username-error' : undefined}
                />
                {touched.username && fieldErrors.username && (
                  <div id="username-error" className="invalid-feedback">
                    {fieldErrors.username}
                  </div>
                )}
              </div>

              {/* Contraseña */}
              <div className="mb-3">
                <label className="form-label" htmlFor="password">Contraseña</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className={`form-control ${
                    touched.password && fieldErrors.password ? 'is-invalid' : ''
                  }`}
                  placeholder="12345"
                  value={password}
                  onChange={handleChangePassword}
                  onBlur={handleBlur}
                  autoComplete="current-password"
                  aria-invalid={touched.password && !!fieldErrors.password}
                  aria-describedby={touched.password && fieldErrors.password ? 'password-error' : undefined}
                />
                {touched.password && fieldErrors.password && (
                  <div id="password-error" className="invalid-feedback">
                    {fieldErrors.password}
                  </div>
                )}
                <small className='float-end pb-3 pt-1'><a href="#" className='reset-password'>¿Olvidaste tu contraseña?</a></small>
              </div>

              <button className="btn btn-login py-3 w-100" type="submit">
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
