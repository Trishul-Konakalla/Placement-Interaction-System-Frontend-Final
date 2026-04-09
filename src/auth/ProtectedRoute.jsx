import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRole }) {
  const stored = localStorage.getItem('placement_user');
  if (!stored) return <Navigate to="/login" replace />;
  const user = JSON.parse(stored);
  if (user.role !== allowedRole) return <Navigate to="/login" replace />;
  return children;
}
