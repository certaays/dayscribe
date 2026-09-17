import { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { db } from '../db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import { sendTestNotification } from '../utils/notificationScheduler';
import { useAppTheme } from '../App';
import {
  Settings,
  Moon,
  Sun,
  Bell,
  Flame,
  Smartphone,
  Download,
  Trash2,
  Check,
} from '../components/icons/AppIcons';
import './SettingsPage.css';

export function SettingsPage() {
  const settings = useLiveQuery(() => db.app_settings.get(1));
  const { isSupported, isGranted, permission, requestPermission } = useNotifications();
  const { theme, setTheme } = useAppTheme();
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (settings?.displayName) setName(settings.displayName);
  }, [settings]);

  const saveName = async () => {
    if (!name.trim()) return;
    await db.app_settings.update(1, { displayName: name.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportJournal = async () => {
    const entries = await db.journal_entries.toArray();
    const json = JSON.stringify(entries, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dayscribe-journal-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = async () => {
    if (!confirm('Are you sure? This will delete ALL your journal entries and reminders. This cannot be undone.')) return;
    await db.journal_entries.clear();
    await db.reminders.clear();
    await db.reminder_logs.clear();
    await db.habits.clear();
    await db.habit_logs.clear();
    alert('All data cleared.');
  };

  const handleTestNotif = () => {
    const sent = sendTestNotification();
    if (sent) {
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } else {
      alert('Notifications are not enabled. Please enable them first.');
    }
  };

  const notifColor =
    permission === 'granted' ? 'green' :
    permission === 'denied'  ? 'red' : 'amber';

  return (
    <div className="settings-page">
      <h1 className="settings-title">
        <Settings size={24} className="inline-icon" /> Settings
      </h1>

      {/* Display name */}
      <section className="settings-card animate-fadeInUp">
        <h2 className="settings-card-title">Your Name</h2>
        <p className="settings-card-desc">This appears in your daily greeting.</p>
        <div className="name-input-row">
          <input
            className="form-input name-input"
            placeholder="Enter your name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveName()}
            maxLength={40}
          />
          <button className="btn-save-name" onClick={saveName}>
            {saved ? '✓ Saved!' : 'Save'}
          </button>
        </div>
      </section>

      {/* Appearance */}
      <section className="settings-card animate-fadeInUp delay-1">
        <h2 className="settings-card-title">Appearance</h2>
        <p className="settings-card-desc">Choose the look that feels right for you.</p>
        <div className="theme-picker">
          <button
            className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => setTheme('dark')}
          >
            <span className="theme-option-icon">
              <Moon size={20} />
            </span>
            <span className="theme-option-label">Dark</span>
            <span className="theme-option-desc">Candlelight at night</span>
          </button>
          <button
            className={`theme-option ${theme === 'light' ? 'active' : ''}`}
            onClick={() => setTheme('light')}
          >
            <span className="theme-option-icon">
              <Sun size={20} />
            </span>
            <span className="theme-option-label">Light</span>
            <span className="theme-option-desc">Clean &amp; bright paper</span>
          </button>
        </div>
      </section>

      {/* Notifications */}
      <section className="settings-card animate-fadeInUp delay-2">
        <h2 className="settings-card-title">Notifications</h2>
        <div className="notif-status">
          <span className={`notif-dot ${notifColor}`} />
          <span className="notif-label">
            {permission === 'granted' ? 'Notifications are enabled' :
             permission === 'denied' ? 'Notifications are blocked by browser' :
             'Notifications not yet enabled'}
          </span>
        </div>
        {!isGranted && isSupported && permission !== 'denied' && (
          <button className="btn-primary mt-2" onClick={requestPermission}>
            <Bell size={16} /> Enable Notifications
          </button>
        )}
        {isGranted && (
          <button className="btn-test-notif mt-2" onClick={handleTestNotif}>
            {testSent ? (
              <>
                <Check size={16} /> Sent! Check your notifications
              </>
            ) : (
              <>
                <Bell size={16} /> Send Test Notification
              </>
            )}
          </button>
        )}
        {permission === 'denied' && (
          <p className="notif-hint">
            To enable, go to your browser settings → Site Settings → Notifications → allow this site.
          </p>
        )}
      </section>

      {/* App info */}
      <section className="settings-card animate-fadeInUp delay-2">
        <h2 className="settings-card-title">About DayScribe</h2>
        <div className="about-content">
          <div className="about-candle">
            <Flame size={26} color="var(--color-amber-glow)" />
          </div>
          <div>
            <p className="about-name">DayScribe</p>
            <p className="about-desc">Your cozy daily companion for building routines and keeping a journal. Private by design — all data lives on your device.</p>
          </div>
        </div>
        <div className="settings-divider" />
        <div className="pwa-info">
          <p className="pwa-label">
            <Smartphone size={16} className="inline-icon" /> Install as App
          </p>
          <p className="pwa-desc">Open this page in your phone's browser and tap "Add to Home Screen" to install DayScribe as a native-feeling app.</p>
        </div>
      </section>

      {/* Data */}
      <section className="settings-card animate-fadeInUp delay-3">
        <h2 className="settings-card-title">Your Data</h2>
        <div className="data-actions">
          <button className="btn-export" onClick={exportJournal}>
            <Download size={16} /> Export Journal (JSON)
          </button>
          <button className="btn-danger" onClick={clearAllData}>
            <Trash2 size={16} /> Clear All Data
          </button>
        </div>
      </section>
    </div>
  );
}

