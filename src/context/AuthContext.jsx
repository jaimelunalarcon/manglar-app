import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// Usuarios simulados
const USERS = {
  admin:           { role: 'admin',        name: 'Administrador' },
  arrendatario1:   { role: 'arrendatario', name: 'Arrendatario 1' },
  arrendatario2:   { role: 'arrendatario', name: 'Arrendatario 2' },
  arrendatario3:   { role: 'arrendatario', name: 'Arrendatario 3' },
  arrendatario4:   { role: 'arrendatario', name: 'Arrendatario 4' },
  arrendatario5:   { role: 'arrendatario', name: 'Arrendatario 5' },
};
const PASSWORD = '12345';

// Aliases tolerantes para "admin"
const ADMIN_ALIASES = new Set(['admin','administrador','adminstrador']);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isHydrating, setIsHydrating] = useState(true); // <- clave

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const parsed = JSON.parse(raw);
        // pequeña validación mínima
        if (parsed?.role && (parsed.username || parsed.name)) {
          setUser(parsed);
        } else {
          localStorage.removeItem('user');
        }
      }
    } catch {
      localStorage.removeItem('user');
    } finally {
      setIsHydrating(false); // <- listo para decidir rutas
    }
  }, []);

  async function login({ username, password }) {
    const key = (username ?? '').trim().toLowerCase();
    const resolvedKey = ADMIN_ALIASES.has(key) ? 'admin' : key;
    const u = USERS[resolvedKey];
    if (!u || password !== PASSWORD) {
      return { ok: false, error: 'Credenciales inválidas' };
    }
    const sessionUser = { username: resolvedKey, ...u };
    setUser(sessionUser);
    localStorage.setItem('user', JSON.stringify(sessionUser));
    return { ok: true, user: sessionUser };
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('user');
  }

  return (
    <AuthContext.Provider value={{ user, isHydrating, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
