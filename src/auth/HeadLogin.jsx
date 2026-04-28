import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LOCKOUT_SECONDS = 30;

export default function HeadLogin() {
  const { user, login } = useAuth();
  const [step, setStep] = useState(1); // 1 = credentials, 2 = OTP
  const [form, setForm] = useState({ username: '', password: '' });
  const [otp, setOtp] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockout, setLockout] = useState(0);
  const [otpTimer, setOtpTimer] = useState(120); // 2 min countdown
  const timerRef = useRef(null);
  const otpTimerRef = useRef(null);
  const navigate = useNavigate();

  if (user) return <Navigate to={user.role === 'head' ? '/head' : '/student'} replace />;

  useEffect(() => {
    if (lockout > 0) {
      timerRef.current = setInterval(() => {
        setLockout(l => { if (l <= 1) { clearInterval(timerRef.current); return 0; } return l - 1; });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [lockout]);

  useEffect(() => {
    if (step === 2) {
      setOtpTimer(120);
      otpTimerRef.current = setInterval(() => {
        setOtpTimer(t => {
          if (t <= 1) {
            clearInterval(otpTimerRef.current);
            setStep(1);
            setError('OTP expired. Please login again.');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(otpTimerRef.current);
  }, [step]);

  // Step 1: verify credentials + request OTP
  const handleCredentials = async (e) => {
    e.preventDefault();
    if (lockout > 0) return;
    setError(''); setLoading(true);
    try {
      const res = await fetch('https://placement-interaction-system-backend.onrender.com/api/auth/head/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const text = await res.text();
      if (!res.ok) {
        const next = attempts + 1;
        setAttempts(next);
        if (next >= 3) { setLockout(LOCKOUT_SECONDS); setAttempts(0); setError(`Too many attempts. Locked for ${LOCKOUT_SECONDS}s.`); }
        else setError(text || 'Invalid credentials');
        return;
      }
      setAttempts(0);
      setStep(2);
    } catch {
      setError('Cannot connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify OTP
  const handleOtp = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('https://placement-interaction-system-backend.onrender.com/api/auth/head/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, otp }),
      });
      const text = await res.text();
      if (!res.ok) { setError(text || 'Invalid OTP'); return; }
      clearInterval(otpTimerRef.current);
      login({ username: form.username, name: form.username, role: 'head' });
      navigate('/head');
    } catch {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: 420 };
  const inputStyle = { background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: '#f1f5f9' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e1b4b, #312e81, #1e3a5f)' }}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{step === 1 ? '🔐' : '📱'}</div>
          <h2 style={{ color: '#c4b5fd', fontSize: '1.5rem' }}>
            {step === 1 ? 'Placement Head Portal' : 'OTP Verification'}
          </h2>
          <p style={{ color: '#a5b4fc' }}>
            {step === 1 ? 'Restricted access — authorized personnel only' : `Check Spring Boot console for your OTP`}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label style={{ color: '#e0e7ff' }}>Username</label>
              <input className="input" placeholder="Admin username" value={form.username} autoFocus
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required style={inputStyle} />
            </div>
            <div className="input-group">
              <label style={{ color: '#e0e7ff' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPass ? 'text' : 'password'} placeholder="Admin password"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required
                  style={{ ...inputStyle, paddingRight: '2.5rem' }} />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a5b4fc' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.6rem 0.9rem', color: '#fca5a5', fontSize: '0.85rem' }}>{error}</div>}
            {lockout > 0 && <div style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '0.5rem', padding: '0.6rem 0.9rem', color: '#fbbf24', fontSize: '0.85rem' }}>⏳ Locked. Try again in {lockout}s.</div>}
            <button className="btn" type="submit" disabled={loading || lockout > 0}
              style={{ background: '#4F46E5', color: 'white', width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
              {loading ? 'Verifying...' : 'Send OTP →'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(79,70,229,0.2)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: '0.75rem', padding: '1rem', textAlign: 'center' }}>
              <ShieldCheck size={28} style={{ color: '#818cf8', marginBottom: '0.5rem' }} />
              <p style={{ color: '#c7d2fe', fontSize: '0.85rem' }}>OTP sent to Spring Boot console</p>
              <p style={{ color: '#fbbf24', fontSize: '0.85rem', marginTop: '0.25rem' }}>⏳ Expires in {Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, '0')}</p>
            </div>
            <div className="input-group">
              <label style={{ color: '#e0e7ff' }}>Enter 6-digit OTP</label>
              <input className="input" placeholder="e.g. 847392" value={otp} maxLength={6}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} required autoFocus style={inputStyle} />
            </div>
            {error && <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.6rem 0.9rem', color: '#fca5a5', fontSize: '0.85rem' }}>{error}</div>}
            <button className="btn" type="submit" disabled={loading || otp.length !== 6}
              style={{ background: '#4F46E5', color: 'white', width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
              {loading ? 'Verifying OTP...' : 'Verify & Login'}
            </button>
            <button type="button" onClick={() => { setStep(1); setOtp(''); setError(''); clearInterval(otpTimerRef.current); }}
              style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer', fontSize: '0.85rem' }}>
              ← Back to login
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: '#a5b4fc' }}>
          <Link to="/login" style={{ color: '#818cf8' }}>← Student Login</Link>
        </p>
      </div>
    </div>
  );
}
