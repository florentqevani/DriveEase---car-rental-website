import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg('');
    setError('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const body = { full_name: fullName, email };
      if (newPassword) {
        body.current_password = currentPassword;
        body.password = newPassword;
      }
      const updated = await api.put('/auth/me', body);
      setUser(updated);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMsg('Settings saved successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container page">
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 24 }}>Settings</h1>

        {msg && <div className="alert alert-success">{msg}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form className="card" onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: 20 }}>Profile</h3>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <h3 style={{ marginBottom: 20, marginTop: 28 }}>Change Password</h3>
          {user?.has_password === false ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              You signed in with Google. To set a password, use the fields below.
            </p>
          ) : (
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" className="form-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
          )}
          <div className="form-group">
            <label>New Password</label>
            <input type="password" className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input type="password" className="form-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6} />
          </div>

          <button type="submit" className="btn btn-accent" style={{ width: '100%' }} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <div className="card" style={{ marginTop: 24, borderColor: 'var(--color-error)' }}>
          <h3 style={{ marginBottom: 12, color: 'var(--color-error)' }}>Danger Zone</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>
            Permanently delete your account and all your reservations. This action cannot be undone.
          </p>
          {!showDeleteConfirm ? (
            <button
              className="btn"
              style={{ background: 'var(--color-error)', color: '#fff', width: '100%' }}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn"
                style={{ background: 'var(--color-error)', color: '#fff', flex: 1 }}
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await api.delete('/auth/me');
                    logout();
                    navigate('/');
                  } catch (err) {
                    setError(err.message);
                    setDeleting(false);
                    setShowDeleteConfirm(false);
                  }
                }}
              >
                {deleting ? 'Deleting...' : 'Yes, delete my account'}
              </button>
              <button
                className="btn"
                style={{ flex: 1 }}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
