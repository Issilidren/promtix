import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('promtix_token');
    if (!token) { setLoading(false); return; }

    fetch('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(u => { setUser(u); setLoading(false); })
      .catch(() => { localStorage.removeItem('promtix_token'); setLoading(false); });
  }, []);

  function login(token) {
    localStorage.setItem('promtix_token', token);
    fetch('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setUser);
  }

  function logout() {
    localStorage.removeItem('promtix_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
