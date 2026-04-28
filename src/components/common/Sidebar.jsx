import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { LayoutDashboard, User, Briefcase, ClipboardList, Users, Building2, Megaphone, BarChart2, LogOut } from 'lucide-react';

const headLinks = [
  { to: '/head', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/head/students', icon: <Users size={18} />, label: 'Student Management' },
  { to: '/head/companies', icon: <Building2 size={18} />, label: 'Company Management' },
  { to: '/head/broadcast', icon: <Megaphone size={18} />, label: 'Placement Broadcast' },
  { to: '/head/analytics', icon: <BarChart2 size={18} />, label: 'Analytics' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [statusChanges, setStatusChanges] = useState(0);

  // Check for status changes — compare stored statuses with current
  useEffect(() => {
    if (user?.role !== 'student') return;
    const stored = JSON.parse(localStorage.getItem('app_statuses') || '{}');
    fetch(`https://placement-interaction-system-backend.onrender.com/api/applications/student/${user.username}`)
      .then(r => r.json())
      .then(apps => {
        if (!Array.isArray(apps)) return;
        let changes = 0;
        apps.forEach(a => {
          if (stored[a.id] && stored[a.id] !== a.status) changes++;
        });
        setStatusChanges(changes);
      }).catch(() => {});
  }, [user]);

  const clearBadge = () => {
    if (user?.role !== 'student') return;
    fetch(`https://placement-interaction-system-backend.onrender.com/api/applications/student/${user.username}`)
      .then(r => r.json())
      .then(apps => {
        if (!Array.isArray(apps)) return;
        const map = {};
        apps.forEach(a => { map[a.id] = a.status; });
        localStorage.setItem('app_statuses', JSON.stringify(map));
        setStatusChanges(0);
      }).catch(() => {});
  };

  const studentLinks = [
    { to: '/student', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/student/profile', icon: <User size={18} />, label: 'My Profile' },
    { to: '/student/jobs', icon: <Briefcase size={18} />, label: 'Job Listings' },
    { to: '/student/applications', icon: <ClipboardList size={18} />, label: 'Application Status', badge: statusChanges },
  ];

  const links = user?.role === 'head' ? headLinks : studentLinks;
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">🎓 PlaceTrack</div>
      <nav className="sidebar-nav">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to === '/student' || l.to === '/head'}
            className={({ isActive }) => isActive ? 'active' : ''}
            onClick={l.badge ? clearBadge : undefined}>
            {l.icon}
            <span style={{ flex: 1 }}>{l.label}</span>
            {l.badge > 0 && (
              <span style={{ background: '#EF4444', color: 'white', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem', minWidth: 18, textAlign: 'center' }}>
                {l.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-avatar">{user?.username?.[0]?.toUpperCase()}</div>
        <span className="sidebar-username">{user?.username}</span>
        <button className="btn btn-outline-danger" style={{ padding: '0.4rem 0.6rem' }} onClick={handleLogout} title="Logout">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
