import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setForceLogout } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginRedirect, setLoginRedirect] = useState(null);

  const logout = useCallback(() => {
    const rt = localStorage.getItem('refreshToken');
    if (rt) {
      api.post('/auth/logout', { refreshToken: rt }).catch(() => {});
    }
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    window.location.href = '/';
  }, []);

  useEffect(() => {
    setForceLogout(logout);
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.get('/auth/me')
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      })
      .finally(() => setLoading(false));
  }, []);

  function login(userData, accessToken, refreshToken) {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(userData);
    setShowLoginModal(false);
    setLoginRedirect(null);
  }

  function openLogin(redirectPath) {
    setLoginRedirect(redirectPath || null);
    setShowLoginModal(true);
  }

  function closeLogin() {
    setShowLoginModal(false);
    setLoginRedirect(null);
  }

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout,
      showLoginModal, loginRedirect, openLogin, closeLogin,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
