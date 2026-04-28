import { useState } from 'react';
import { useNavigate, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = location.state?.registered;

  if (user) return <Navigate to={user.role === 'head' ? '/head' : '/student'} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const text = await res.text();
      if (!res.ok) { setError(text || 'Invalid credentials'); return; }
      if (!text.includes('student')) { setError('This portal is for students only'); return; }
      login({ username: form.username, name: form.username, role: 'student' });
      navigate('/student');
    } catch {
      setError('Cannot connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #4F46E5, #7C3AED, #2563EB)' }}>
      <div className="card" style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎓</div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Student Portal</h2>
          <p>Sign in to access your placement dashboard</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label>Username</label>
            <input className="input" placeholder="Enter username" value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required autoFocus />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input className="input" type="password" placeholder="Enter password" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          {justRegistered && (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '0.5rem', padding: '0.6rem 0.9rem', color: '#059669', fontSize: '0.85rem' }}>
              ✓ Registration successful! Please sign in.
            </div>
          )}
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.6rem 0.9rem', color: 'var(--danger)', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem' }}>
          New student? <Link to="/register">Register here</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.85rem' }}>
          <Link to="/reset-password">Forgot password?</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.85rem' }}>
          Placement Head? <Link to="/login/head">→ Admin Login</Link>
        </p>
      </div>
    </div>
  );
}
