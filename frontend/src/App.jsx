import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CitizenDashboard from './pages/CitizenDashboard';
import NewReportPage from './pages/NewReportPage';
import ReportDetailPage from './pages/ReportDetailPage';
import ModeratorDashboard from './pages/ModeratorDashboard';
import FieldWorkerDashboard from './pages/FieldWorkerDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';
import CitizenRewardsPage from './pages/CitizenRewardsPage';
import AdminRewardPolicyPage from './pages/AdminRewardPolicyPage';
import AnalyticsPage from './pages/AnalyticsPage';
import NotificationsPage from './pages/NotificationsPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="py-20 text-center text-slate-400 font-bold text-sm">Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Citizen Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <CitizenDashboard />
            </ProtectedRoute>
          } />
          <Route path="/reports/new" element={
            <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
              <NewReportPage />
            </ProtectedRoute>
          } />
          <Route path="/reports/:id" element={
            <ProtectedRoute>
              <ReportDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/rewards" element={
            <ProtectedRoute>
              <CitizenRewardsPage />
            </ProtectedRoute>
          } />

          {/* Authority Routes */}
          <Route path="/enforcement" element={
            <ProtectedRoute allowedRoles={['AUTHORITY_OFFICER', 'ADMIN']}>
              <AuthorityDashboard />
            </ProtectedRoute>
          } />
          <Route path="/enforcement/cases" element={
            <ProtectedRoute allowedRoles={['AUTHORITY_OFFICER', 'ADMIN']}>
              <AuthorityDashboard />
            </ProtectedRoute>
          } />

          {/* Moderator Routes */}
          <Route path="/moderator" element={
            <ProtectedRoute allowedRoles={['MODERATOR', 'ADMIN']}>
              <ModeratorDashboard />
            </ProtectedRoute>
          } />

          {/* Field Worker Routes */}
          <Route path="/field-worker" element={
            <ProtectedRoute allowedRoles={['FIELD_WORKER', 'ADMIN']}>
              <FieldWorkerDashboard />
            </ProtectedRoute>
          } />

          {/* Admin Policy Route */}
          <Route path="/admin/reward-policy" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminRewardPolicyPage />
            </ProtectedRoute>
          } />

          {/* Shared Protected Routes */}
          <Route path="/analytics" element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
