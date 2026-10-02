import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../firebase';

const sidebarItems = [
  { label: 'Home', path: '/dashboard', icon: 'home' },
  { label: 'Analyze Website', path: '/check', icon: 'search' },
  { label: 'My Reports', path: '/reports', icon: 'report' },
  { label: 'Saved', path: '/saved', icon: 'saved' },
  { label: 'Compare', path: '/compare', icon: 'compare' },
  { label: 'AI Consultant', path: '/ai', icon: 'ai' },
  { label: 'Settings', path: '/settings', icon: 'settings' },
  { label: 'Help & Support', path: '/help', icon: 'help' },
  { label: 'Logout', path: '/login', icon: 'logout', action: 'logout' },
];

function SideIcon({ type }: { type: string }) {
  const common = 'h-4 w-4 stroke-[1.7]';
  switch (type) {
    case 'home':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={common}><path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V20h14V9.5" /><path d="M9 20v-6h6v6" /></svg>;
    case 'search':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={common}><circle cx="11" cy="11" r="5.5" /><path d="M16 16l5 5" /></svg>;
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

  return (
    <div className="app-shell">
      <div className="mobile-backdrop" onClick={() => setMobileOpen(false)} data-open={mobileOpen ? 'true' : 'false'} />
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-brand">
            <div className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 80 80">
                <path d="M18 56c-6-18 11-36 30-35 15 1 25 11 20 23-5 14-24 11-29 23-4 10 9 16 22 12" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="40" cy="40" r="17" fill="none" stroke="currentColor" strokeWidth="6" />
                <circle cx="40" cy="40" r="8" fill="currentColor" />
              </svg>
            </div>
            <span>CheckMySite</span>
          </div>
          <button type="button" className="close-drawer" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            ×
          </button>
        </div>

        <nav className="nav-list">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={async () => {
                setMobileOpen(false);
                if (item.label === 'Logout') {
                  await logout();
                }
              }}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon"><SideIcon type={item.icon} /></span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main-panel">
        <header className="topbar">
          <button type="button" className="menu-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
          <div className="topbar-actions">
            <button type="button" className="icon-pill" aria-label="Notifications" onClick={() => navigate('/notifications')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
            </button>
            <button type="button" className="profile-avatar" aria-label="Profile" onClick={() => navigate('/profile')}>R</button>
          </div>
        </header>

        <main className="content-shell">{children}</main>
        <div className="home-indicator" aria-hidden="true" />
      </div>
    </div>
  );
}
