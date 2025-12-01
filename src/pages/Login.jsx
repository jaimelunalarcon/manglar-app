// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import './login.css';
import logo from '../assets/login-logo.svg';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // errores por campo + error general del formulario
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '', form: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({ email: '', password: '', form: '' });
    setIsLoading(true);

    // Log para debugging (puedes quitarlo después)
    console.log('Intentando login con:', { email, password: '***' });

    const res = await login({ email, password });

    // Log para ver la respuesta (puedes quitarlo después)
    console.log('Respuesta del login:', res);

    setIsLoading(false);

    if (!res.ok) {
      // Mapea errores por campo si vienen del AuthContext
      if (res.errors) {
        setFieldErrors((prev) => ({
          ...prev,
          email: res.errors.username || res.errors.email || '',
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
      setTouched({ email: true, password: true });
      return;
    }

    // Éxito - Log para ver el usuario
    console.log('Login exitoso, usuario:', res.user);
    
    navigate(res.user.role === 'admin' ? '/admin' : '/arrendatario', { replace: true });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
  };

  const handleChangeEmail = (e) => {
    setEmail(e.target.value);
    // Limpia error de ese campo al escribir
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: '', form: '' }));
    }
  };

  const handleChangePassword = (e) => {
    setPassword(e.target.value);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: '', form: '' }));
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
              {/* Email */}
              <div className="mb-3">
                <label className="form-label" htmlFor="email">Usuario</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-control ${
                    touched.email && fieldErrors.email ? 'is-invalid' : ''
                  }`}
                  placeholder="admin@manglar.cl"
                  value={email}
                  onChange={handleChangeEmail}
                  onBlur={handleBlur}
                  autoComplete="email"
                  disabled={isLoading}
                  aria-invalid={touched.email && !!fieldErrors.email}
                  aria-describedby={touched.email && fieldErrors.email ? 'email-error' : undefined}
                />
                {touched.email && fieldErrors.email && (
                  <div id="email-error" className="invalid-feedback">
                    {fieldErrors.email}
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
                  placeholder="••••••"
                  value={password}
                  onChange={handleChangePassword}
                  onBlur={handleBlur}
                  autoComplete="current-password"
                  disabled={isLoading}
                  aria-invalid={touched.password && !!fieldErrors.password}
                  aria-describedby={touched.password && fieldErrors.password ? 'password-error' : undefined}
                />
                {touched.password && fieldErrors.password && (
                  <div id="password-error" className="invalid-feedback">
                    {fieldErrors.password}
                  </div>
                )}
                <small className='float-end pb-3 pt-1'>
                  <a href="#" className='reset-password'>¿Olvidaste tu contraseña?</a>
                </small>
              </div>

              <button 
                className="btn btn-login py-3 w-100" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}