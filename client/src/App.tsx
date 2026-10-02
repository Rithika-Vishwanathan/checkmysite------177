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
import EmblemLogo from './components/EmblemLogo';

function SplashScreen() {
  return (
    <div className="splash-container">


      <div className="flex flex-col items-center justify-center gap-6 animate-pulse">
        <EmblemLogo size={180} />
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
      const timeout = window.setTimeout(() => setShowSplash(false), 1600);
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
