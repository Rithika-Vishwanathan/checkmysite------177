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
      {/* 9:41 Status Bar */}
      <div className="absolute top-3 inset-x-6 flex items-center justify-between text-xs font-semibold text-[#21130D]">
        <span>9:41</span>
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.8A1 1 0 005.76 21.2l2.19-.62A8.93 8.93 0 0012 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/></svg>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4a8 8 0 00-8 8c0 1.9.66 3.65 1.77 5.03l-1.4 1.4a1 1 0 001.42 1.42l1.4-1.4A7.95 7.95 0 0012 20a8 8 0 008-8 8 8 0 00-8-8z"/></svg>
          <div className="w-5 h-2.5 rounded-sm border border-[#21130D] p-0.5 flex items-center"><div className="w-full h-full bg-[#21130D] rounded-xs"/></div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-6 animate-pulse">
        <EmblemLogo size={180} />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#21130D]/30 rounded-full" />
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
