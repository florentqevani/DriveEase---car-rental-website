import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout, openLogin } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const linkClass = (path) =>
    `${pathname === path ? 'active' : ''}`;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src="https://img.icons8.com/?size=100&id=AmvvpYN8jrzG&format=png&color=000000" alt="car icon" style={{ width: 28, height: 28, marginRight: 8, verticalAlign: 'middle' }} />
          Drive<span>Ease</span>
        </Link>

        <button
          className={`navbar-toggle ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`navbar-links ${menuOpen ? 'show' : ''}`}>
          <Link to="/" className={linkClass('/')}>Home</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className={linkClass('/admin')}>Dashboard</Link>
          )}
          {user ? (
            <>
              {user.role !== 'admin' && (
                <Link to="/my-reservations" className={linkClass('/my-reservations')}>My Reservations</Link>
              )}
              <Link to="/settings" className={linkClass('/settings')}>Settings</Link>
              <button className="btn-ghost" onClick={logout} style={{ color: 'rgba(255,255,255,0.8)', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 500 }}>
                Logout
              </button>
            </>
          ) : (
            <button className="btn-accent" onClick={() => openLogin()} style={{ border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontWeight: 500 }}>
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
