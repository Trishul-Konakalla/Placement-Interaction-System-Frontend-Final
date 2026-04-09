import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/common/Layout';

const STAGES = ['Applied', 'Shortlisted', 'Interview', 'Selected'];

function stageIndex(status) {
  if (status === 'Rejected') return -1;
  const i = STAGES.indexOf(status);
  return i === -1 ? 0 : i;
}

function statusBadgeClass(status) {
  const map = { Applied: 'badge-primary', Shortlisted: 'badge-info', Interview: 'badge-warning', Selected: 'badge-success', Rejected: 'badge-danger', Hold: 'badge-warning' };
  return map[status] || 'badge-primary';
}

export default function ApplicationTracker() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);

  useEffect(() => {
    fetch(`/api/applications/student/${user.username}`)
      .then(r => r.json()).then(setApps).catch(() => {});
  }, [user.username]);

  return (
    <Layout>
      <div className="page-header"><h1>Application Tracker</h1><p>Track your application statuses</p></div>
      {apps.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>No applications yet. Apply for jobs from the Job Listings page.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {apps.map(app => {
            const idx = stageIndex(app.status);
            const isRejected = app.status === 'Rejected';
            const pct = isRejected ? 100 : ((idx + 1) / STAGES.length) * 100;
            return (
              <div key={app.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{app.companyName}</h3>
                    <p style={{ fontSize: '0.85rem' }}>{app.jobRole}</p>
                    <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Applied: {app.appliedOn}</p>
                  </div>
                  <span className={`badge ${statusBadgeClass(app.status)}`}>{app.status}</span>
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: isRejected ? 'var(--danger)' : 'var(--primary)' }} />
                  </div>
                  {isRejected && <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.25rem' }}>Application Rejected</p>}
                </div>
                {!isRejected && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {STAGES.map((stage, i) => (
                      <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: i <= idx ? 'var(--primary)' : 'var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>
                          {i <= idx ? '✓' : i + 1}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: i <= idx ? 'var(--primary)' : 'var(--text-muted)' }}>{stage}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
