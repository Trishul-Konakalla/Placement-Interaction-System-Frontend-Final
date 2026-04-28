import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '../../components/common/Layout';

export default function StudentOverview() {
  const { user } = useAuth();
  const { announcements } = useData();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch(`/api/applications/student/${user.username}`)
      .then(r => r.json())
      .then(data => { setApps(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));

    fetch(`/api/profile/${user.username}`)
      .then(r => r.status === 204 ? null : r.json())
      .then(data => { if (data) setProfile(data); })
      .catch(() => {});
  }, [user.username]);

  const total = apps.length;
  const shortlisted = apps.filter(a => a.status === 'Shortlisted').length;
  const interviews = apps.filter(a => a.status === 'Interview').length;
  const selected = apps.filter(a => a.status === 'Selected').length;

  const stats = [
    { label: 'Total Applied', value: total, color: '#4F46E5' },
    { label: 'Shortlisted', value: shortlisted, color: '#10B981' },
    { label: 'Interviews', value: interviews, color: '#F59E0B' },
    { label: 'Selected', value: selected, color: '#8B5CF6' },
  ];

  const companyChart = Object.values(
    apps.reduce((acc, a) => {
      const key = a.companyName || 'Unknown';
      acc[key] = acc[key] || { company: key, applications: 0 };
      acc[key].applications += 1;
      return acc;
    }, {})
  );

  const readiness = Math.min(100, total * 10 + shortlisted * 15 + interviews * 20 + selected * 30);
  const displayName = profile?.fullName || user.username;

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1>Welcome back, {displayName}! 👋</h1>
          <p>Here's your placement activity overview</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '1.5rem' }}>
        {stats.map(s => (
          <div key={s.label} className="card stat-card">
            <div className="stat-value" style={{ color: s.color }}>{loading ? '—' : s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Applications by Company</h3>
          {companyChart.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem 0' }}>No applications yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={companyChart}>
                <XAxis dataKey="company" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="applications" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h3 style={{ marginBottom: '1rem' }}>Placement Readiness</h3>
          <div style={{ width: 140, height: 140, borderRadius: '50%', background: `conic-gradient(#4F46E5 ${readiness * 3.6}deg, #e5e7eb ${readiness * 3.6}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4F46E5' }}>{readiness}%</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ready</span>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', marginTop: '0.75rem', textAlign: 'center' }}>
            Based on your {total} application{total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Latest Announcements</h3>
        {announcements.length === 0 ? <p>No announcements yet.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {announcements.slice(0, 5).map(a => (
              <div key={a.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.75rem', background: 'rgba(79,70,229,0.05)', borderRadius: '0.5rem' }}>
                <span className={`badge ${a.type === 'warning' ? 'badge-warning' : 'badge-primary'}`}>
                  {a.type === 'warning' ? 'Urgent' : 'Update'}
                </span>
                <div>
                  <p style={{ color: 'var(--text-dark)', fontSize: '0.9rem' }}>{a.message}</p>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
