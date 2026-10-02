import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import CheckPage from './pages/CheckPage';
import HistoryPage from './pages/HistoryPage';
import WebsitesPage from './pages/WebsitesPage';
import ReportsPage from './pages/ReportsPage';
import ReportDetailPage from './pages/ReportDetailPage';
import AnalysisPage from './pages/AnalysisPage';
import CategoryPage from './pages/CategoryPage';
import AiPage from './pages/AiPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import SavedPage from './pages/SavedPage';
import ComparePage from './pages/ComparePage';
import HelpPage from './pages/HelpPage';
import { AuthProvider, useAuth } from './context/AuthContext';

function SplashScreen() {
  return (
    <div className="splash-screen">
      <div className="splash-glow splash-glow-1" />
      <div className="splash-glow splash-glow-2" />
      <div className="splash-logo-wrap">
        <svg viewBox="0 0 420 420" className="splash-logo" aria-label="CheckMySite logo" role="img">
          <defs>
            <linearGradient id="splashStroke" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#f8e8d9" />
              <stop offset="35%" stopColor="#edd4b6" />
              <stop offset="75%" stopColor="#c9997a" />
              <stop offset="100%" stopColor="#7f4d3d" />
            </linearGradient>
            <radialGradient id="lensGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff9f3" />
              <stop offset="40%" stopColor="#e7d2bb" />
              <stop offset="100%" stopColor="#8b5847" />
            </radialGradient>
          </defs>

          <path
            d="M103 303 C102 219, 169 116, 237 111 C 288 108, 323 136, 337 174 C 352 216, 322 254, 292 271 C 266 286, 215 289, 190 301 C 163 315, 159 338, 187 349 C 221 363, 271 349, 307 319"
            fill="none"
            stroke="url(#splashStroke)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="splash-s-shape"
          />
          <path
            d="M112 298 C88 231, 108 155, 165 124 C 227 90, 309 94, 338 150 C 365 203, 336 266, 293 294"
            fill="none"
            stroke="url(#splashStroke)"
            strokeWidth="10"
            strokeLinecap="round"
            className="splash-trail splash-trail-1"
          />
          <path
            d="M148 300 C132 268, 130 236, 150 205 C 178 162, 232 140, 280 156 C 327 171, 351 218, 334 260 C 317 300, 284 321, 244 323"
            fill="none"
            stroke="url(#splashStroke)"
            strokeWidth="9"
            strokeLinecap="round"
            className="splash-trail splash-trail-2"
          />
          <circle cx="212" cy="214" r="92" fill="none" stroke="url(#splashStroke)" strokeWidth="14" className="splash-eye-ring" />
          <circle cx="212" cy="214" r="52" fill="rgba(24,18,17,0.18)" stroke="rgba(32,24,22,0.32)" strokeWidth="12" className="splash-eye-core" />
          <circle cx="212" cy="214" r="19" fill="#1e1715" className="splash-eye-pupil" />
          <circle cx="212" cy="214" r="35" fill="url(#lensGlow)" opacity="0.55" className="splash-lens-halo" />
        </svg>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <SplashScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (!loading) {
      const timeout = window.setTimeout(() => setShowSplash(false), 1800);
      return () => window.clearTimeout(timeout);
    }
  }, [loading]);

  if (loading || showSplash) {
    return <SplashScreen />;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
      <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />} />
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/check" element={<ProtectedRoute><Layout><CheckPage /></Layout></ProtectedRoute>} />
      <Route path="/analyze" element={<ProtectedRoute><Layout><CheckPage /></Layout></ProtectedRoute>} />
      <Route path="/websites" element={<ProtectedRoute><Layout><WebsitesPage /></Layout></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><Layout><HistoryPage /></Layout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Layout><ReportsPage /></Layout></ProtectedRoute>} />
      <Route path="/report" element={<ProtectedRoute><Layout><ReportsPage /></Layout></ProtectedRoute>} />
      <Route path="/reports/:id" element={<ProtectedRoute><Layout><ReportDetailPage /></Layout></ProtectedRoute>} />
      <Route path="/report/:id" element={<ProtectedRoute><Layout><ReportDetailPage /></Layout></ProtectedRoute>} />
      <Route path="/analysis/:id" element={<ProtectedRoute><Layout><AnalysisPage /></Layout></ProtectedRoute>} />
      <Route path="/analysis/:id/performance" element={<ProtectedRoute><Layout><CategoryPage /></Layout></ProtectedRoute>} />
      <Route path="/analysis/:id/seo" element={<ProtectedRoute><Layout><CategoryPage /></Layout></ProtectedRoute>} />
      <Route path="/analysis/:id/accessibility" element={<ProtectedRoute><Layout><CategoryPage /></Layout></ProtectedRoute>} />
      <Route path="/analysis/:id/security" element={<ProtectedRoute><Layout><CategoryPage /></Layout></ProtectedRoute>} />
      <Route path="/analysis/:id/mobile" element={<ProtectedRoute><Layout><CategoryPage /></Layout></ProtectedRoute>} />
      <Route path="/analysis/:id/technical" element={<ProtectedRoute><Layout><CategoryPage /></Layout></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute><Layout><SavedPage /></Layout></ProtectedRoute>} />
      <Route path="/compare" element={<ProtectedRoute><Layout><ComparePage /></Layout></ProtectedRoute>} />
      <Route path="/ai" element={<ProtectedRoute><Layout><AiPage /></Layout></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Layout><NotificationsPage /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Layout><SettingsPage /></Layout></ProtectedRoute>} />
      <Route path="/help" element={<ProtectedRoute><Layout><HelpPage /></Layout></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
