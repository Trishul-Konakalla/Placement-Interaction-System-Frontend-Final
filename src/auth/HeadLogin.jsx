import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HEAD_SECRET = 'PLACE2024';
const MAX_ATTEMPTS = 3;
const LOCKOUT_SECONDS = 30;

export default function HeadLogin() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '', secret: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockout, setLockout] = useState(0);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  // already logged in → redirect
  if (user) return <Navigate to={user.role === 'head' ? '/head' : '/student'} replace />;

  useEffect(() => {
    if (lockout > 0) {
      timerRef.current = setInterval(() => {
        setLockout(l => {
          if (l <= 1) { clearInterval(timerRef.current); return 0; }
          return l - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [lockout]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockout > 0) return;
    if (form.secret !== HEAD_SECRET) {
      const next = attempts + 1;
      setAttempts(next);
      if (next >= MAX_ATTEMPTS) {
        setLockout(LOCKOUT_SECONDS); setAttempts(0);
        setError(`Too many wrong attempts. Locked for ${LOCKOUT_SECONDS} seconds.`);
      } else {
        setError(`Invalid secret code. ${MAX_ATTEMPTS - next} attempt(s) remaining.`);
      }
      return;
    }
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password }),
      });
      const text = await res.text();
      if (!res.ok) { setError(text || 'Invalid credentials'); return; }
      if (!text.includes('head')) { setError('Access denied. This portal is for Placement Head only.'); return; }
      login({ username: form.username, name: form.username, role: 'head' });
      navigate('/head');
    } catch {
      setError('Cannot connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e1b4b, #312e81, #1e3a5f)' }}>
      <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔐</div>
          <h2 style={{ color: '#c4b5fd', fontSize: '1.5rem' }}>Placement Head Portal</h2>
          <p style={{ color: '#a5b4fc' }}>Restricted access — authorized personnel only</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="input-group">
            <label style={{ color: '#e0e7ff' }}>Username</label>
            <input className="input" placeholder="Admin username" value={form.username} autoFocus
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required
              style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: '#f1f5f9' }} />
          </div>
          <div className="input-group">
            <label style={{ color: '#e0e7ff' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showPass ? 'text' : 'password'} placeholder="Admin password" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required
                style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: '#f1f5f9', paddingRight: '2.5rem' }} />
              <button type="button" onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a5b4fc' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="input-group">
            <label style={{ color: '#e0e7ff' }}>Secret Access Code</label>
            <input className="input" type="password" placeholder="Enter secret code" value={form.secret}
              onChange={e => setForm(f => ({ ...f, secret: e.target.value }))} required disabled={lockout > 0}
              style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: '#f1f5f9' }} />
          </div>
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.6rem 0.9rem', color: '#fca5a5', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}
          {lockout > 0 && (
            <div style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '0.5rem', padding: '0.6rem 0.9rem', color: '#fbbf24', fontSize: '0.85rem' }}>
              ⏳ Form locked. Try again in {lockout}s.
            </div>
          )}
          <button className="btn" type="submit" disabled={loading || lockout > 0}
            style={{ background: '#4F46E5', color: 'white', width: '100%', justifyContent: 'center', padding: '0.75rem', opacity: lockout > 0 ? 0.5 : 1 }}>
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: '#a5b4fc' }}>
          <Link to="/login" style={{ color: '#818cf8' }}>← Student Login</Link>
        </p>
      </div>
    </div>
  );
}
