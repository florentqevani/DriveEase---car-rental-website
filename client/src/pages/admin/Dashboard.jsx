import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ManageReservations from './ManageReservations';
import ManageCars from './ManageCars';
import ManageUsers from './ManageUsers';
import EmailSettings from './EmailSettings';

export default function Dashboard() {
  const { pathname } = useLocation();

  function sideClass(path) {
    if (path === '/admin') return `sidebar-link ${pathname === '/admin' ? 'active' : ''}`;
    return `sidebar-link ${pathname.startsWith(path) ? 'active' : ''}`;
  }

  return (
    <div className="container page">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <h3>Admin Panel</h3>
          <Link to="/admin" className={sideClass('/admin')}>
            📋 Reservations
          </Link>
          <Link to="/admin/cars" className={sideClass('/admin/cars')}>
            🚗 Manage Cars
          </Link>
          <Link to="/admin/users" className={sideClass('/admin/users')}>
            👥 Users
          </Link>
          <Link to="/admin/email" className={sideClass('/admin/email')}>
            ✉️ Email Settings
          </Link>
        </aside>

        <div className="admin-content">
          <Routes>
            <Route index element={<ManageReservations />} />
            <Route path="cars" element={<ManageCars />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="email" element={<EmailSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
