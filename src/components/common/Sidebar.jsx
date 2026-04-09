import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, User, Briefcase, ClipboardList, Users, Building2, Megaphone, BarChart2, LogOut } from 'lucide-react';

const studentLinks = [
  { to: '/student', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/student/profile', icon: <User size={18} />, label: 'My Profile' },
  { to: '/student/jobs', icon: <Briefcase size={18} />, label: 'Job Listings' },
  { to: '/student/applications', icon: <ClipboardList size={18} />, label: 'Application Status' },
];
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
  const links = user?.role === 'head' ? headLinks : studentLinks;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">🎓 PlaceTrack</div>
      <nav className="sidebar-nav">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to === '/student' || l.to === '/head'} className={({ isActive }) => isActive ? 'active' : ''}>
            {l.icon}{l.label}
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
