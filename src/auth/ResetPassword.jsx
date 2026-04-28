import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const [form, setForm] = useState({ username: '', oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.newPassword !== form.confirmPassword) { setError('New passwords do not match'); return; }
    if (form.newPassword.length < 6) { setError('New password must be at least 6 characters'); return; }
    if (form.oldPassword === form.newPassword) { setError('New password must be different from current password'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          oldPassword: form.oldPassword,
          newPassword: form.newPassword,
        }),
      });
      const text = await res.text();
      if (!res.ok) { setError(text || 'Reset failed'); return; }
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
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
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔑</div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Reset Password</h2>
          <p>Verify your identity and set a new password</p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✅</div>
            <p style={{ color: '#059669', fontWeight: 600, fontSize: '1rem' }}>Password changed successfully!</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label>Username / Roll No</label>
              <input className="input" placeholder="Enter your username" value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required autoFocus />
            </div>

            <div className="input-group">
              <label>Current Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showOld ? 'text' : 'password'} placeholder="Enter current password"
                  value={form.oldPassword} onChange={e => setForm(f => ({ ...f, oldPassword: e.target.value }))} required
                  style={{ paddingRight: '2.5rem' }} />
                <button type="button" onClick={() => setShowOld(s => !s)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label>New Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showNew ? 'text' : 'password'} placeholder="Min 6 characters"
                  value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} required
                  style={{ paddingRight: '2.5rem' }} />
                <button type="button" onClick={() => setShowNew(s => !s)}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label>Confirm New Password</label>
              <input className="input" type="password" placeholder="Repeat new password"
                value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.6rem 0.9rem', color: 'var(--danger)', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
              {loading ? 'Resetting...' : 'Change Password'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
          <Link to="/login">← Student Login</Link>
          <Link to="/login/head">Head Login →</Link>
        </div>
      </div>
    </div>
  );
}
