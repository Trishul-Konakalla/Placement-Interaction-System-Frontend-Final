import { Link } from 'react-router-dom';
import { GraduationCap, Building2, ArrowRight, UserPlus } from 'lucide-react';

export default function Intro() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #2563EB 100%)', padding: '2rem', textAlign: 'center' }}>
      <div style={{ marginBottom: '1rem', fontSize: '4rem' }}>🎓</div>
      <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Placement Interaction System</h1>
      <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', marginBottom: '3rem', maxWidth: 500 }}>
        Connecting students with opportunities. Streamlining campus placements.
      </p>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', color: '#4F46E5', padding: '1rem 2rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '1rem', textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <GraduationCap size={22} /> Student Login <ArrowRight size={18} />
        </Link>
        <Link to="/register" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.15)', color: 'white', padding: '1rem 2rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '1rem', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}>
          <UserPlus size={22} /> Register <ArrowRight size={18} />
        </Link>
        <Link to="/login/head" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.15)', color: 'white', padding: '1rem 2rem', borderRadius: '0.75rem', fontWeight: 600, fontSize: '1rem', textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}>
          <Building2 size={22} /> Head Login <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
