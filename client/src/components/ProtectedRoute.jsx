import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, loading, openLogin } = useAuth();

  useEffect(() => {
    if (!loading && !user) openLogin(window.location.pathname);
  }, [loading, user, openLogin]);

  if (loading) return <div className="spinner" />;
  if (!user) return null;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
}
