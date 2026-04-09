import Sidebar from './Sidebar';
import { useData } from '../../context/DataContext';

export default function Layout({ children }) {
  const { dbStatus } = useData();

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        {dbStatus === 'offline' && (
          <div style={{
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '0.5rem', padding: '0.6rem 1rem', marginBottom: '1rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#DC2626'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
            Backend / Database is offline. Start Spring Boot on port 8080.
          </div>
        )}
        {dbStatus === 'online' && (
          <div style={{
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '0.5rem', padding: '0.6rem 1rem', marginBottom: '1rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#059669'
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            Database connected
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
