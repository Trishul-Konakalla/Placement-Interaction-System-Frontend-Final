import { useState } from 'react';
import { useData } from '../../context/DataContext';
import Layout from '../../components/common/Layout';
import { Trash2, Plus, DollarSign, MapPin } from 'lucide-react';

const EMPTY = { companyName: '', jobRole: '', salaryPackage: '', eligibility: '', location: '', description: '' };

export default function CompanyManagement() {
  const { jobs, fetchJobs } = useData();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/jobs/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) { setShowModal(false); setForm(EMPTY); fetchJobs(); }
      else alert('Failed to save job.');
    } catch { alert('Backend connection error.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this drive?')) return;
    await fetch(`/api/jobs/delete/${id}`, { method: 'DELETE' });
    fetchJobs();
  };

  return (
    <Layout>
      <div className="page-header flex justify-between items-center">
        <div><h1>Company Management</h1><p>{jobs.length} drives posted</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} />Add New Drive</button>
      </div>

      {jobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}><p>No drives posted yet. Add one!</p></div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {jobs.map(job => (
            <div key={job.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: '0.5rem', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem' }}>
                  {job.companyName?.[0]?.toUpperCase()}
                </div>
                <button className="btn btn-danger" style={{ padding: '0.4rem 0.6rem' }} onClick={() => handleDelete(job.id)}><Trash2 size={14} /></button>
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{job.companyName}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500 }}>{job.jobRole}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}><DollarSign size={14} />{job.salaryPackage}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}><MapPin size={14} />{job.location}</span>
              </div>
              {job.eligibility && <span className="badge badge-info" style={{ alignSelf: 'flex-start' }}>{job.eligibility}</span>}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <h3 style={{ marginBottom: '1.25rem' }}>Add New Drive</h3>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[['companyName','Company Name',true],['jobRole','Job Role',true],['salaryPackage','Package (e.g. 12 LPA)',true],['eligibility','Eligibility (optional)',false],['location','Location',true]].map(([name, label, req]) => (
                <div key={name} className="input-group">
                  <label>{label}</label>
                  <input className="input" name={name} value={form[name]} onChange={handleChange} required={req} />
                </div>
              ))}
              <div className="input-group">
                <label>Description (optional)</label>
                <textarea className="input" name="description" value={form.description} onChange={handleChange} rows={3} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => { setShowModal(false); setForm(EMPTY); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save to Database'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
