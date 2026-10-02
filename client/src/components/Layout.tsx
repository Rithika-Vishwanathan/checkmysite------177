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
];

function SideIcon({ type }: { type: string }) {
  const common = 'w-5 h-5 stroke-[1.9]';
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
    case 'help':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={common}><circle cx="12" cy="12" r="9" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3" /></svg>;
    default:
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={common}><circle cx="12" cy="12" r="8" /></svg>;
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  const userName = user?.displayName || user?.name || user?.email?.split('@')[0] || 'User';
  const avatarLetter = userName.charAt(0).toUpperCase();

  return (
    <div className="app-shell">
      {/* Desktop Persistent Left Glass Sidebar */}
      <aside className="hidden lg:flex desktop-sidebar">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3.5 pb-6 border-b border-[#21130D]/10">
            <EmblemLogo size={46} />
            <div>
              <div className="font-extrabold text-lg tracking-tight text-[#21130D]">CheckMySite</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#796B64]">Web Platform • Pro</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1.5">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#591620] to-[#3B0D14] text-white shadow-md shadow-[#591620]/25'
                      : 'text-[#4A3B34] hover:bg-white/70 hover:text-[#21130D]'
                  }`
                }
              >
                <SideIcon type={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom User Card */}
        <div className="pt-4 border-t border-[#21130D]/10">
          <div className="p-3 rounded-2xl glass-panel flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#591620] to-[#3B0D14] text-white font-bold text-sm flex items-center justify-center shadow-md flex-shrink-0">
                {avatarLetter}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-[#21130D] truncate">{userName}</div>
                <div className="text-[10px] text-[#796B64] truncate">{user?.email || 'Logged in'}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              title="Logout"
              className="p-1.5 rounded-xl hover:bg-rose-100/60 text-[#591620] transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop & Drawer Content */}
      {mobileOpen && (
        <div className="drawer-backdrop lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {mobileOpen && (
        <aside className="drawer-content lg:hidden">
          <div className="flex items-center justify-between pb-6 mb-4 border-b border-[#21130D]/10">
            <div className="flex items-center gap-3">
              <EmblemLogo size={42} />
              <div>
                <span className="font-bold text-lg tracking-tight text-[#21130D]">CheckMySite</span>
                <div className="text-[10px] font-bold text-[#796B64] tracking-wider uppercase">Luxury Web</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="w-9 h-9 glass-pill flex items-center justify-center text-lg font-medium"
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
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#591620] to-[#3B0D14] text-white font-semibold shadow-md'
                      : 'text-[#4A3B34] hover:bg-white/70 hover:text-[#21130D]'
                  }`
                }
              >
                <SideIcon type={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="pt-4 border-t border-[#21130D]/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#591620] text-white font-bold text-xs flex items-center justify-center">
                {avatarLetter}
              </div>
              <span className="text-xs font-bold text-[#21130D]">{userName}</span>
            </div>
            <button
              type="button"
              onClick={() => { setMobileOpen(false); logout(); }}
              className="text-xs font-bold text-[#591620]"
            >
              Logout
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="main-content-wrap">
        {/* Top Desktop Web App Navigation Header */}
        <header className="sticky top-0 z-30 px-6 py-4 backdrop-blur-2xl bg-white/40 border-b border-white/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden w-10 h-10 glass-pill flex items-center justify-center text-[#21130D]"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 glass-pill text-xs text-[#796B64] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-time Engine Active</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="w-10 h-10 glass-pill flex items-center justify-center text-[#21130D] relative"
              aria-label="Notifications"
              onClick={() => navigate('/notifications')}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#591620]" />
            </button>

            <div 
              onClick={() => navigate('/profile')}
              className="glass-pill px-3.5 py-1.5 flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#591620] to-[#3B0D14] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {avatarLetter}
              </div>
              <span className="hidden md:inline text-xs font-bold text-[#21130D]">{userName}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="main-container">
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
