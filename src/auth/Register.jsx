import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';

export default function Register() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '', fullName: '', department: '', cgpa: '' });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={user.role === 'head' ? '/head' : '/student'} replace />;

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) setSkills(s => [...s, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      // 1. Register user account
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password, role: 'student' }),
      });
      const regText = await regRes.text();
      if (!regRes.ok) { setError(regText || 'Registration failed'); return; }

      // 2. Save profile details
      await fetch('/api/profile/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          fullName: form.fullName,
          cgpa: form.cgpa,
          department: form.department,
          skills: skills.join(','),
        }),
      });

      navigate('/login', { state: { registered: true } });
    } catch {
      setError('Cannot connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #4F46E5, #7C3AED, #2563EB)', padding: '2rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📝</div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>Student Registration</h2>
          <p>Create your placement profile — details cannot be changed after registration</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
            <div className="input-group">
              <label>Username / Roll No <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className="input" placeholder="e.g. CS2021001" value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required autoFocus />
            </div>
            <div className="input-group">
              <label>Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className="input" placeholder="Your full name" value={form.fullName}
                onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
            </div>
            <div className="input-group">
              <label>Department <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className="input" placeholder="e.g. Computer Science" value={form.department}
                onChange={e => setForm(f => ({ ...f, department: e.target.value }))} required />
            </div>
            <div className="input-group">
              <label>CGPA <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className="input" type="number" step="0.01" min="0" max="10" placeholder="e.g. 8.5"
                value={form.cgpa} onChange={e => setForm(f => ({ ...f, cgpa: e.target.value }))} required />
            </div>
            <div className="input-group">
              <label>Password <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className="input" type="password" placeholder="Min 6 characters" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
            <div className="input-group">
              <label>Confirm Password <span style={{ color: 'var(--danger)' }}>*</span></label>
              <input className="input" type="password" placeholder="Repeat password" value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
            </div>
          </div>

          <div className="input-group">
            <label>Skills (press Enter to add)</label>
            <input className="input" placeholder="e.g. React, Java, Python..." value={skillInput}
              onChange={e => setSkillInput(e.target.value)} onKeyDown={addSkill} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {skills.map(s => (
                <span key={s} className="badge badge-primary" style={{ gap: '0.4rem', cursor: 'pointer' }} onClick={() => setSkills(sk => sk.filter(x => x !== s))}>
                  {s} <X size={12} />
                </span>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.6rem 0.9rem', color: 'var(--danger)', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '0.5rem', padding: '0.6rem 0.9rem', fontSize: '0.8rem', color: '#92400e' }}>
            ⚠️ Username, Full Name and Department cannot be changed after registration.
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
            {loading ? 'Registering...' : 'Register & Continue'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem' }}>
          Already registered? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
