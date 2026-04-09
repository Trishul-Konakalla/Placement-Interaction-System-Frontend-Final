import { useEffect, useState } from 'react';
import { useData } from '../../context/DataContext';
import Layout from '../../components/common/Layout';

const STATUSES = ['Applied', 'Shortlisted', 'Interview', 'Hold', 'Selected', 'Rejected'];

function statusBadgeClass(s) {
  const map = { Applied: 'badge-primary', Shortlisted: 'badge-info', Interview: 'badge-warning', Selected: 'badge-success', Rejected: 'badge-danger', Hold: 'badge-warning' };
  return map[s] || 'badge-primary';
}

export default function StudentManagement() {
  const { students } = useData();
  const [tab, setTab] = useState('students');
  const [apps, setApps] = useState([]);
  const [search, setSearch] = useState('');

  const fetchApps = () => fetch('/api/applications/all').then(r => r.json()).then(setApps).catch(() => {});
  useEffect(() => { fetchApps(); }, []);

  const updateStatus = async (id, status) => {
    await fetch(`/api/applications/status/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchApps();
  };

  const filteredStudents = students.filter(s => s.username?.toLowerCase().includes(search.toLowerCase()));
  const filteredApps = apps.filter(a => a.studentUsername?.toLowerCase().includes(search.toLowerCase()) || a.companyName?.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      <div className="page-header flex justify-between items-center">
        <div><h1>Student Management</h1><p>Manage students and applications</p></div>
        <input className="input" style={{ width: 240 }} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'students' ? 'active' : ''}`} onClick={() => setTab('students')}>Students ({students.length})</button>
        <button className={`tab-btn ${tab === 'applications' ? 'active' : ''}`} onClick={() => setTab('applications')}>Applications ({apps.length})</button>
      </div>

      {tab === 'students' && (
        <div className="card table-container">
          <table className="table">
            <thead><tr><th>Student</th><th>Username</th><th>Role</th><th>Applications</th></tr></thead>
            <tbody>
              {filteredStudents.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.85rem' }}>
                        {s.username?.[0]?.toUpperCase()}
                      </div>
                      {s.username}
                    </div>
                  </td>
                  <td>{s.username}</td>
                  <td><span className="badge badge-primary">{s.role}</span></td>
                  <td>{apps.filter(a => a.studentUsername === s.username).length}</td>
                </tr>
              ))}
              {filteredStudents.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center' }}>No students found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'applications' && (
        <div className="card table-container">
          <table className="table">
            <thead><tr><th>Student</th><th>Company</th><th>Role</th><th>Applied On</th><th>Status</th><th>Update</th></tr></thead>
            <tbody>
              {filteredApps.map(a => (
                <tr key={a.id}>
                  <td>{a.studentUsername}</td>
                  <td>{a.companyName}</td>
                  <td>{a.jobRole}</td>
                  <td>{a.appliedOn}</td>
                  <td><span className={`badge ${statusBadgeClass(a.status)}`}>{a.status}</span></td>
                  <td>
                    <select className="input" style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                      value={a.status} onChange={e => updateStatus(a.id, e.target.value)}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {filteredApps.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center' }}>No applications found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
