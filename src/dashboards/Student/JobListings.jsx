import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Layout from '../../components/common/Layout';
import { DollarSign, MapPin, Bookmark } from 'lucide-react';

export default function JobListings() {
  const { user } = useAuth();
  const { jobs } = useData();
  const [search, setSearch] = useState('');
  const [applied, setApplied] = useState(new Set());

  useEffect(() => {
    fetch(`/api/applications/student/${user.username}`)
      .then(r => r.json())
      .then(data => setApplied(new Set(data.map(a => String(a.jobId || a.job?.id)))))
      .catch(() => {});
  }, [user.username]);

  const filtered = jobs.filter(j =>
    j.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    j.jobRole?.toLowerCase().includes(search.toLowerCase())
  );

  const handleApply = async (job) => {
    try {
      const res = await fetch('/api/applications/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentUsername: user.username, jobId: String(job.id) }),
      });
      if (res.ok) setApplied(prev => new Set([...prev, String(job.id)]));
      else { const t = await res.text(); alert(t); }
    } catch { alert('Failed to apply. Check backend connection.'); }
  };

  return (
    <Layout>
      <div className="page-header flex justify-between items-center">
        <div><h1>Job Listings</h1><p>{filtered.length} opportunities available</p></div>
        <input className="input" style={{ width: 260 }} placeholder="Search company or role..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>No jobs found. {jobs.length === 0 ? 'No drives posted yet.' : 'Try a different search.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(job => {
            const isApplied = applied.has(String(job.id));
            return (
              <div key={job.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(job.companyName)}&background=4F46E5&color=fff&size=48&bold=true`}
                    alt="" style={{ borderRadius: '0.5rem', width: 48, height: 48 }} />
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <Bookmark size={18} />
                  </button>
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{job.jobRole}</h3>
                  <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--primary)' }}>{job.companyName}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <DollarSign size={14} />{job.salaryPackage}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <MapPin size={14} />{job.location}
                  </span>
                </div>
                {job.eligibility && <span className="badge badge-info" style={{ alignSelf: 'flex-start' }}>{job.eligibility}</span>}
                <button className={`btn ${isApplied ? 'btn-secondary' : 'btn-primary'}`} disabled={isApplied} onClick={() => handleApply(job)} style={{ width: '100%', justifyContent: 'center' }}>
                  {isApplied ? 'Applied ✓' : 'Apply Now'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
