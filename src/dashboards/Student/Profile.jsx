import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/common/Layout';
import { X, Upload, Lock } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [cgpa, setCgpa] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/profile/${user.username}`)
      .then(r => r.status === 204 ? null : r.json())
      .then(data => {
        if (data) {
          setProfile(data);
          setCgpa(data.cgpa || '');
          setSkills(data.skills ? data.skills.split(',').filter(s => s.trim()) : []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user.username]);

  const completion = [profile?.fullName, cgpa, profile?.department, skills.length > 0].filter(Boolean).length;
  const pct = Math.round((completion / 4) * 100);

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) setSkills(s => [...s, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/profile/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          fullName: profile?.fullName,
          cgpa,
          department: profile?.department,
          skills: skills.join(','),
        }),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    } catch {
      alert('Failed to save. Check backend connection.');
    }
  };

  if (loading) return <Layout><div className="card" style={{ textAlign: 'center', padding: '3rem' }}><p>Loading profile...</p></div></Layout>;

  return (
    <Layout>
      <div className="page-header"><div><h1>My Profile</h1><p>Manage your placement profile</p></div></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Profile Completion</h3>
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Completion</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>{pct}%</span>
            </div>
            <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${pct}%` }} /></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Locked fields */}
            {[
              { label: 'Username / Roll No', value: user.username },
              { label: 'Full Name', value: profile?.fullName || '—' },
              { label: 'Department', value: profile?.department || '—' },
            ].map(f => (
              <div key={f.label} className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  {f.label} <Lock size={12} style={{ color: 'var(--text-muted)' }} />
                </label>
                <input className="input" value={f.value} disabled />
              </div>
            ))}

            {/* Editable CGPA */}
            <div className="input-group">
              <label>CGPA <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 400 }}>(editable)</span></label>
              <input className="input" type="number" step="0.01" min="0" max="10" placeholder="e.g. 8.5"
                value={cgpa} onChange={e => setCgpa(e.target.value)} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <h3 style={{ marginBottom: '0.25rem' }}>Skills <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 400 }}>(editable)</span></h3>
            <p style={{ fontSize: '0.8rem', marginBottom: '0.75rem' }}>Press Enter to add a skill, click to remove</p>
            <div className="input-group" style={{ marginBottom: '0.75rem' }}>
              <input className="input" placeholder="e.g. React, Java, Python..." value={skillInput}
                onChange={e => setSkillInput(e.target.value)} onKeyDown={addSkill} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {skills.map(s => (
                <span key={s} className="badge badge-primary" style={{ gap: '0.4rem', cursor: 'pointer' }} onClick={() => setSkills(sk => sk.filter(x => x !== s))}>
                  {s} <X size={12} />
                </span>
              ))}
              {skills.length === 0 && <p style={{ fontSize: '0.85rem' }}>No skills added yet.</p>}
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Resume</h3>
            <div style={{ border: '2px dashed var(--glass-border)', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', cursor: 'pointer' }}>
              <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.9rem' }}>Drag & drop or click to upload</p>
              <p style={{ fontSize: '0.75rem' }}>PDF, DOC up to 5MB</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '0.5rem', padding: '0.6rem 0.9rem', fontSize: '0.8rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={13} /> Username, Full Name and Department are locked after registration.
            </div>
            <button className="btn btn-primary" onClick={handleSave} style={{ alignSelf: 'flex-start' }}>
              {saved ? '✓ Saved to Database!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
