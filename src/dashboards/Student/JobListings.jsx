import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Layout from '../../components/common/Layout';
import { DollarSign, MapPin, X, Info } from 'lucide-react';

export default function JobListings() {
  const { user } = useAuth();
  const { jobs } = useData();
  const [search, setSearch] = useState('');
  const [applied, setApplied] = useState(new Set());
  const [selectedJob, setSelectedJob] = useState(null);
  const [cgpa, setCgpa] = useState(0);
  const [locationFilter, setLocationFilter] = useState('');
  const [pkgFilter, setPkgFilter] = useState('');

  useEffect(() => {
    fetch(`https://placement-interaction-system-backend.onrender.com/api/applications/student/${user.username}`)
      .then(r => r.json())
      .then(data => {
        setApplied(new Set(data.map(a => String(a.jobId || a.job?.id))));
        // store statuses for notification badge
        const map = {};
        data.forEach(a => { map[a.id] = a.status; });
        localStorage.setItem('app_statuses', JSON.stringify(map));
      }).catch(() => {});

    fetch(`https://placement-interaction-system-backend.onrender.com/api/profile/${user.username}`)
      .then(r => r.status === 204 ? null : r.json())
      .then(data => { if (data?.cgpa) setCgpa(parseFloat(data.cgpa) || 0); })
      .catch(() => {});
  }, [user.username]);

  const locations = [...new Set(jobs.map(j => j.location).filter(Boolean))];

  const filtered = jobs.filter(j => {
    const matchSearch = j.companyName?.toLowerCase().includes(search.toLowerCase()) || j.jobRole?.toLowerCase().includes(search.toLowerCase());
    const matchLocation = !locationFilter || j.location === locationFilter;
    const matchPkg = !pkgFilter || parseFloat(j.salaryPackage?.replace(/[^0-9.]/g, '') || 0) >= parseFloat(pkgFilter);
    return matchSearch && matchLocation && matchPkg;
  });

  const isEligible = (job) => {
    if (!job.eligibility) return true;
    const required = parseFloat(job.eligibility.replace(/[^0-9.]/g, '') || 0);
    return cgpa >= required;
  };

  const handleApply = async (job) => {
    try {
      const res = await fetch('https://placement-interaction-system-backend.onrender.com/api/applications/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentUsername: user.username, jobId: String(job.id) }),
      });
      if (res.ok) { setApplied(prev => new Set([...prev, String(job.id)])); setSelectedJob(null); }
      else { const t = await res.text(); alert(t); }
    } catch { alert('Failed to apply. Check backend connection.'); }
  };

  return (
    <Layout>
      <div className="page-header">
        <div><h1>Job Listings</h1><p>{filtered.length} opportunities available</p></div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input className="input" style={{ width: 200 }} placeholder="Search company or role..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="input" style={{ width: 140 }} value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>
            <option value="">All Locations</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <input className="input" style={{ width: 140 }} type="number" placeholder="Min Package (LPA)" value={pkgFilter} onChange={e => setPkgFilter(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>No jobs found. {jobs.length === 0 ? 'No drives posted yet.' : 'Try a different search.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(job => {
            const isApplied = applied.has(String(job.id));
            const eligible = isEligible(job);
            return (
              <div key={job.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(job.companyName)}&background=4F46E5&color=fff&size=48&bold=true`}
                    alt="" style={{ borderRadius: '0.5rem', width: 48, height: 48 }} />
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }} onClick={() => setSelectedJob(job)} title="View Details">
                    <Info size={18} />
                  </button>
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{job.jobRole}</h3>
                  <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--primary)' }}>{job.companyName}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}><DollarSign size={14} />{job.salaryPackage}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}><MapPin size={14} />{job.location}</span>
                </div>
                {job.eligibility && (
                  <span className={`badge ${eligible ? 'badge-info' : 'badge-danger'}`} style={{ alignSelf: 'flex-start' }}>
                    {eligible ? `✓ Eligible: ${job.eligibility}` : `✗ Need ${job.eligibility} CGPA`}
                  </span>
                )}
                <button className={`btn ${isApplied ? 'btn-secondary' : 'btn-primary'}`}
                  disabled={isApplied || !eligible}
                  onClick={() => handleApply(job)}
                  style={{ width: '100%', justifyContent: 'center' }}
                  title={!eligible ? 'You do not meet the CGPA requirement' : ''}>
                  {isApplied ? 'Applied ✓' : !eligible ? 'Not Eligible' : 'Apply Now'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Job Description Modal */}
      {selectedJob && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedJob(null)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedJob.companyName)}&background=4F46E5&color=fff&size=52&bold=true`}
                  alt="" style={{ borderRadius: '0.5rem', width: 52, height: 52 }} />
                <div>
                  <h3 style={{ marginBottom: '0.2rem' }}>{selectedJob.jobRole}</h3>
                  <p style={{ color: 'var(--primary)', fontWeight: 500 }}>{selectedJob.companyName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedJob(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[['Package', selectedJob.salaryPackage], ['Location', selectedJob.location], ['Eligibility', selectedJob.eligibility || 'Open to all']].map(([k, v]) => (
                  <div key={k} style={{ background: 'rgba(79,70,229,0.05)', borderRadius: '0.5rem', padding: '0.75rem' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{k}</p>
                    <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-dark)' }}>{v}</p>
                  </div>
                ))}
              </div>
              {selectedJob.description && (
                <div>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-dark)' }}>Job Description</p>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{selectedJob.description}</p>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setSelectedJob(null)}>Close</button>
              {!applied.has(String(selectedJob.id)) && isEligible(selectedJob) && (
                <button className="btn btn-primary" onClick={() => handleApply(selectedJob)}>Apply Now</button>
              )}
              {applied.has(String(selectedJob.id)) && <button className="btn btn-secondary" disabled>Applied ✓</button>}
              {!isEligible(selectedJob) && <button className="btn btn-danger" disabled>Not Eligible</button>}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
