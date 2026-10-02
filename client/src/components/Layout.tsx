import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import EmblemLogo from './EmblemLogo';
import { useAuth } from '../context/AuthContext';

const sidebarItems = [
  { label: 'Home', path: '/dashboard', icon: 'home' },
  { label: 'Analyze Website', path: '/check', icon: 'search' },
  { label: 'My Reports', path: '/reports', icon: 'report' },
  { label: 'Saved', path: '/saved', icon: 'saved' },
  { label: 'Compare', path: '/compare', icon: 'compare' },
  { label: 'AI Consultant', path: '/ai', icon: 'ai' },
  { label: 'Settings', path: '/settings', icon: 'settings' },
  { label: 'Help & Support', path: '/help', icon: 'help' },
  { label: 'Logout', path: '/login', icon: 'logout' },
];

function SideIcon({ type }: { type: string }) {
  const common = 'w-5 h-5 stroke-[1.8]';
  switch (type) {
    case 'home':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={common}><path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V20h14V9.5" /><path d="M9 20v-6h6v6" /></svg>;
    case 'search':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={common}><circle cx="11" cy="11" r="6" /><path d="M16 16l5 5" /></svg>;
    case 'report':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={common}><path d="M7 4.5h7l5 5V19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2Z" /><path d="M14 4.5v5h5" /><path d="M8 12h8M8 15h8" /></svg>;
    case 'saved':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={common}><path d="M7 4.5h10a2 2 0 0 1 2 2V20l-7-4-7 4V6.5a2 2 0 0 1 2-2Z" /></svg>;
    case 'compare':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={common}><path d="M6.5 18.5V9.5M12 18.5V5.5M17.5 18.5v-7" /><path d="M4 18.5h16" /></svg>;
    case 'ai':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={common}><path d="M12 3v3M12 18v3M4.93 4.93l2.12 2.12M17 17l2.12 2.12M3 12h3M18 12h3M4.93 19.07l2.12-2.12M17 7l2.12-2.12" /><circle cx="12" cy="12" r="4" /></svg>;
    case 'settings':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={common}><circle cx="12" cy="12" r="3" /><path d="M19 12a7.2 7.2 0 0 0-.15-1.46l2.08-1.62-2-3.46-2.52 1.02a7.36 7.36 0 0 0-2.52-1.46L13.3 2h-2.6l-.59 2.98a7.36 7.36 0 0 0-2.52 1.46L5.07 5.42l-2 3.46 2.08 1.62A7.2 7.2 0 0 0 5 12c0 .5.05 1 .15 1.46L3.07 15.08l2 3.46 2.52-1.02c.78.58 1.64 1.04 2.52 1.46l.59 2.98h2.6l.59-2.98a7.36 7.36 0 0 0 2.52-1.46l2.52 1.02 2-3.46-2.08-1.62A7.2 7.2 0 0 0 19 12Z" /></svg>;
    case 'logout':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={common}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>;
    default:
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={common}><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></svg>;
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const avatarLetter = (user?.displayName || user?.name || user?.email || 'R').charAt(0).toUpperCase();

  return (
    <div className="app-shell">
      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div className="drawer-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {mobileOpen && (
        <aside className="drawer-content">
          <div className="flex items-center justify-between pb-6 mb-4 border-b border-[#21130D]/10">
            <div className="flex items-center gap-3">
              <EmblemLogo size={42} />
              <span className="font-bold text-lg tracking-tight text-[#21130D]">CheckMySite</span>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="w-9 h-9 rounded-2xl bg-white/60 border border-white/80 text-[#21130D] flex items-center justify-center text-xl font-medium shadow-sm hover:bg-white"
              aria-label="Close drawer"
            >
              ✕
            </button>
          </div>

          <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={() => {
                  setMobileOpen(false);
                  if (item.label === 'Logout') {
                    logout();
                  }
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#611722]/15 to-[#611722]/5 text-[#611722] font-semibold border border-[#611722]/20 shadow-sm'
                      : 'text-[#4A3B34] hover:bg-white/60 hover:text-[#21130D]'
                  }`
                }
              >
                <SideIcon type={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="pt-4 border-t border-[#21130D]/10 text-xs text-[#796B64] text-center">
            CheckMySite v2.0 • Luxury Edition
          </div>
        </aside>
      )}

      {/* Main Panel Content */}
      <div className="main-container">
        {/* iOS 9:41 Status Bar */}
        <div className="flex items-center justify-between pt-1 pb-3 text-xs font-semibold text-[#21130D]">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.8A1 1 0 005.76 21.2l2.19-.62A8.93 8.93 0 0012 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/></svg>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4a8 8 0 00-8 8c0 1.9.66 3.65 1.77 5.03l-1.4 1.4a1 1 0 001.42 1.42l1.4-1.4A7.95 7.95 0 0012 20a8 8 0 008-8 8 8 0 00-8-8z"/></svg>
            <div className="w-5 h-2.5 rounded-sm border border-[#21130D] p-0.5 flex items-center"><div className="w-full h-full bg-[#21130D] rounded-xs"/></div>
          </div>
        </div>

        {/* Top Header Bar */}
        <header className="flex items-center justify-between mb-4">
          <button
            type="button"
            className="w-10 h-10 rounded-2xl bg-white/60 border border-white/80 shadow-sm backdrop-blur-md flex items-center justify-center text-[#21130D] hover:bg-white transition"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="w-10 h-10 rounded-2xl bg-white/60 border border-white/80 shadow-sm backdrop-blur-md flex items-center justify-center text-[#21130D] relative hover:bg-white transition"
              aria-label="Notifications"
              onClick={() => navigate('/notifications')}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#611722]" />
            </button>

            <button
              type="button"
              className="w-10 h-10 rounded-full bg-[#611722] text-white font-bold text-sm flex items-center justify-center shadow-md shadow-[#611722]/20 hover:opacity-95 transition"
              aria-label="Profile"
              onClick={() => navigate('/profile')}
            >
              {avatarLetter}
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main>{children}</main>

        {/* Bottom Home Indicator */}
        <div className="w-32 h-1 bg-[#21130D]/25 rounded-full mx-auto mt-6" />
      </div>
    </div>
  );
}
