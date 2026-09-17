import { NavLink } from 'react-router-dom';
import { useAppTheme } from '../../App';
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

        {/* Theme toggle — desktop */}
        <div className="sidebar-footer">
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

