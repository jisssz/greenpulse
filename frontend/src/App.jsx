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
    return (
      <div className="min-h-screen bg-[#F8FAF7] flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-md w-full glass-card rounded-3xl p-8 space-y-6 text-center border border-emerald-600/15 shadow-xl relative z-10">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            {/* Spinning Leaf Spinner */}
            <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-600 animate-spin"></div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center shadow-inner">
              <svg className="w-6 h-6 animate-bounce text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Loading <span className="text-emerald-700 font-extrabold">GreenPulse...</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">Connecting to civic environment portal</p>
          </div>

          {/* Progress Indicator */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-green-400 h-full rounded-full animate-pulse w-3/4"></div>
          </div>

          {/* Eco Feature Badges */}
          <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-semibold text-slate-600">
            <div className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200/50 flex items-center gap-1.5 justify-center">
              <span>🌱 Clean Environment</span>
            </div>
            <div className="p-2 rounded-xl bg-green-50/80 border border-green-200/50 flex items-center gap-1.5 justify-center">
              <span>♻️ Waste Management</span>
            </div>
          </div>
        </div>
      </div>
    );
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
    <div className="min-h-screen bg-[#F8FAF7] text-slate-800 font-sans flex flex-col">
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
