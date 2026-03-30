import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function LoginModal() {
  const { showLoginModal, closeLogin, login, loginRedirect } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  if (!showLoginModal) return null;

  function reset() {
    setError('');
    setEmail(''); setPassword('');
    setRegName(''); setRegEmail(''); setRegPass(''); setRegConfirm('');
  }

  function handleSuccess(data) {
    login(data.user, data.accessToken, data.refreshToken);
    reset();
    if (loginRedirect) navigate(loginRedirect);
  }

  async function handleGoogleSuccess(credentialResponse) {
    setError('');
    setLoading(true);
    try {
      const data = await api.post('/auth/google', {
        credential: credentialResponse.credential,
      });
      handleSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.post('/auth/login', { email, password });
      handleSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    if (regPass !== regConfirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const data = await api.post('/auth/register', {
        full_name: regName,
        email: regEmail,
        password: regPass,
      });
      handleSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      closeLogin();
      reset();
    }
  }

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-card card">
        <button className="modal-close" onClick={() => { closeLogin(); reset(); }} aria-label="Close">
          &times;
        </button>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Login
          </button>
          <button
            className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-accent" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="google-btn-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google login failed')}
                size="large"
                width="100%"
                text="signin_with"
              />
            </div>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" className="form-input" value={regName} onChange={(e) => setRegName(e.target.value)} required autoFocus />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-input" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" className="form-input" value={regPass} onChange={(e) => setRegPass(e.target.value)} required minLength={6} />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" className="form-input" value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)} required minLength={6} />
            </div>
            <button type="submit" className="btn btn-accent" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="google-btn-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google login failed')}
                size="large"
                width="100%"
                text="signup_with"
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
