import { useState } from 'react';
import { useData } from '../../context/DataContext';
import Layout from '../../components/common/Layout';
import { Trash2, Send } from 'lucide-react';

export default function Broadcast() {
  const { announcements, fetchAnnouncements } = useData();
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/announcements/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Admin Alert', message, type }),
      });
      if (res.ok) { setMessage(''); fetchAnnouncements(); }
      else alert('Failed to send.');
    } catch { alert('Backend connection error.'); }
    finally { setSending(false); }
  };

  const handleDelete = async (id) => {
    await fetch(`/api/announcements/delete/${id}`, { method: 'DELETE' });
    fetchAnnouncements();
  };

  return (
    <Layout>
      <div className="page-header"><h1>Placement Broadcast</h1><p>Send announcements to all students</p></div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>New Announcement</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group">
              <label>Message</label>
              <textarea className="input" rows={5} placeholder="Type your announcement..." value={message}
                onChange={e => setMessage(e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            <div className="input-group">
              <label>Type</label>
              <select className="input" value={type} onChange={e => setType(e.target.value)}>
                <option value="info">General Info</option>
                <option value="warning">Urgent Alert</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleSend} disabled={sending || !message.trim()}>
              <Send size={16} />{sending ? 'Sending...' : 'Send Now'}
            </button>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Sent Messages ({announcements.length})</h3>
          {announcements.length === 0 ? <p>No announcements sent yet.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 400, overflowY: 'auto' }}>
              {announcements.map(a => (
                <div key={a.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem', background: 'rgba(79,70,229,0.05)', borderRadius: '0.5rem' }}>
                  <span className={`badge ${a.type === 'warning' ? 'badge-warning' : 'badge-primary'}`} style={{ flexShrink: 0 }}>
                    {a.type === 'warning' ? 'Urgent' : 'Info'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: 'var(--text-dark)', fontSize: '0.875rem' }}>{a.message}</p>
                    <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                  <button className="btn btn-danger" style={{ padding: '0.3rem 0.5rem', flexShrink: 0 }} onClick={() => handleDelete(a.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
