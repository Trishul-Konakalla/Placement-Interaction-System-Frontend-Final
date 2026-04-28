import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ProtectedRoute from './auth/ProtectedRoute';

import Register from './auth/Register';
import ResetPassword from './auth/ResetPassword';

import Intro from './pages/Intro';
import Login from './auth/Login';
import HeadLogin from './auth/HeadLogin';

import StudentOverview from './dashboards/Student/StudentOverview';
import Profile from './dashboards/Student/Profile';
import JobListings from './dashboards/Student/JobListings';
import ApplicationTracker from './dashboards/Student/ApplicationTracker';

import HeadOverview from './dashboards/PlacementHead/HeadOverview';
import StudentManagement from './dashboards/PlacementHead/StudentManagement';
import CompanyManagement from './dashboards/PlacementHead/CompanyManagement';
import Broadcast from './dashboards/PlacementHead/Broadcast';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Intro />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/login/head" element={<HeadLogin />} />

            <Route path="/student" element={<ProtectedRoute allowedRole="student"><StudentOverview /></ProtectedRoute>} />
            <Route path="/student/profile" element={<ProtectedRoute allowedRole="student"><Profile /></ProtectedRoute>} />
            <Route path="/student/jobs" element={<ProtectedRoute allowedRole="student"><JobListings /></ProtectedRoute>} />
            <Route path="/student/applications" element={<ProtectedRoute allowedRole="student"><ApplicationTracker /></ProtectedRoute>} />

            <Route path="/head" element={<ProtectedRoute allowedRole="head"><HeadOverview /></ProtectedRoute>} />
            <Route path="/head/students" element={<ProtectedRoute allowedRole="head"><StudentManagement /></ProtectedRoute>} />
            <Route path="/head/companies" element={<ProtectedRoute allowedRole="head"><CompanyManagement /></ProtectedRoute>} />
            <Route path="/head/broadcast" element={<ProtectedRoute allowedRole="head"><Broadcast /></ProtectedRoute>} />
            <Route path="/head/analytics" element={<Navigate to="/head" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
}
