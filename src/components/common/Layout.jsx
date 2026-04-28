import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { useData } from '../../context/DataContext';
import { Sun, Moon } from 'lucide-react';

export default function Layout({ children }) {
  const { dbStatus } = useData();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ flex: 1 }}>
            {dbStatus === 'offline' && (
              <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#DC2626' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
                Backend / Database is offline. Start Spring Boot on port 8080.
              </div>
            )}
            {dbStatus === 'online' && (
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '0.5rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#059669' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                Database connected
              </div>
            )}
          </div>
          <button onClick={() => setDark(d => !d)}
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-dark)', flexShrink: 0 }}>
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            {dark ? 'Light' : 'Dark'}
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}
