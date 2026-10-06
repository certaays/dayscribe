import { NavLink } from 'react-router-dom';
import { useAppTheme } from '../../App';
import { useAuth } from '../../contexts/AuthContext';
import {
  Flame,
  Home,
  BookMarked,
  Sparkles,
  Bell,
  Settings,
  Sun,
  Moon,
} from '../icons/AppIcons';
import { User, LogIn } from 'lucide-react';
import './Navbar.css';

const NAV_ITEMS = [
  { to: '/',          icon: Home,       label: 'Home'     },
  { to: '/journal',   icon: BookMarked, label: 'Journal'  },
  { to: '/habits',    icon: Sparkles,   label: 'Habits'   },
  { to: '/reminders', icon: Bell,       label: 'Reminders'},
  { to: '/settings',  icon: Settings,   label: 'Settings' },
];

export function Navbar() {
  const { theme, toggleTheme } = useAppTheme();
  const { user, openAuthModal } = useAuth();
  const isDark = theme === 'dark';

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-flame">
            <Flame size={26} className="flame-icon-svg" />
          </span>
          <span className="brand-name">DayScribe</span>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon"><Icon size={19} /></span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Account Profile & Theme toggle — desktop */}
        <div className="sidebar-footer">
          {/* User Account Button */}
          <button
            className="user-account-btn"
            onClick={openAuthModal}
            title={user ? `Akun: ${user.name || user.email}` : 'Masuk atau buat akun baru'}
          >
            <div className="user-account-info">
              <div className="user-avatar-badge">
                {user ? <User size={15} className="text-amber-400" /> : <LogIn size={15} className="text-[var(--color-text-muted)]" />}
              </div>
              <div className="user-account-text">
                <span className="user-account-name">
                  {user ? (user.name || 'Akun Saya') : 'Masuk / Daftar'}
                </span>
                <span className="user-account-sub">
                  {user ? 'Tersimpan di Server' : 'Simpan datamu'}
                </span>
              </div>
            </div>
            {user && <span className="account-online-dot" />}
          </button>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className="theme-toggle-icon">
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </span>
            <span className="theme-toggle-label">{isDark ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <p className="sidebar-quote">"A life worth living<br/>is a life worth recording."</p>
        </div>
      </aside>

      {/* Mobile bottom navigation */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="bottom-nav-icon"><Icon size={20} /></span>
              <span className="bottom-nav-label">{item.label}</span>
            </NavLink>
          );
        })}
        {/* User Account Button — mobile */}
        <button
          className="bottom-nav-item account-mobile-item"
          onClick={openAuthModal}
          title={user ? `Akun: ${user.name || user.email}` : 'Masuk / Daftar'}
        >
          <span className="bottom-nav-icon">
            {user ? <User size={20} className="text-amber-400" /> : <LogIn size={20} />}
          </span>
          <span className="bottom-nav-label">{user ? 'Akun' : 'Masuk'}</span>
        </button>
        {/* Theme toggle — mobile */}
        <button
          className="bottom-nav-item theme-toggle-mobile"
          onClick={toggleTheme}
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          <span className="bottom-nav-icon">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </span>
          <span className="bottom-nav-label">{isDark ? 'Light' : 'Dark'}</span>
        </button>
      </nav>
    </>
  );
}
