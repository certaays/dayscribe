import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import './AppShell.css';

export function AppShell() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
