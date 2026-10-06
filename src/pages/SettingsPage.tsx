import { useState, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { db, type CustomThemeColors, type FontSizeScale } from '../db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import { sendTestNotification } from '../utils/notificationScheduler';
import { useAppTheme } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { RefreshCw, UserCheck, LogOut, LogIn } from 'lucide-react';
import {
  THEME_PRESETS,
  SERIF_FONTS,
  HANDWRITING_FONTS,
  UI_FONTS,
  FONT_SIZE_SCALES,
  DEFAULT_CUSTOM_COLORS,
} from '../styles/themeEngine';
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
  Palette,
  Type,
  RotateCcw,
  Sliders,
  Sparkles,
  Eye,
} from '../components/icons/AppIcons';
import './SettingsPage.css';

// Preset color starters for custom theme creation
const CUSTOM_PALETTE_STARTERS: { name: string; colors: CustomThemeColors }[] = [
  {
    name: 'Cosmic Violet',
    colors: {
      bg: '#0d0b18',
      surface: '#17142b',
      surface2: '#201c3b',
      surface3: '#2c2652',
      border: '#3b346d',
      borderSoft: '#28234a',
      textPrimary: '#f1efff',
      textSecondary: '#a59ec9',
      textMuted: '#6f6794',
      amber: '#a855f7',
      amberGlow: '#c084fc',
      amberDim: '#7e22ce',
      isDark: true,
    },
  },
  {
    name: 'Emerald Forest',
    colors: {
      bg: '#091510',
      surface: '#11221b',
      surface2: '#183026',
      surface3: '#224235',
      border: '#2e5746',
      borderSoft: '#1c3d30',
      textPrimary: '#eefaf4',
      textSecondary: '#94c2ab',
      textMuted: '#5d8c75',
      amber: '#10b981',
      amberGlow: '#34d399',
      amberDim: '#059669',
      isDark: true,
    },
  },
  {
    name: 'Sunset Peach (Light)',
    colors: {
      bg: '#fff9f5',
      surface: '#ffffff',
      surface2: '#fbede4',
      surface3: '#f6ded2',
      border: '#edd0c1',
      borderSoft: '#f5dfd4',
      textPrimary: '#2d1810',
      textSecondary: '#7d5345',
      textMuted: '#ad8779',
      amber: '#ea580c',
      amberGlow: '#f97316',
      amberDim: '#c2410c',
      isDark: false,
    },
  },
  {
    name: 'Ocean Abyss',
    colors: {
      bg: '#06131e',
      surface: '#0d1f30',
      surface2: '#132b42',
      surface3: '#1b3b5a',
      border: '#244e76',
      borderSoft: '#163858',
      textPrimary: '#ecf6ff',
      textSecondary: '#8cb1d4',
      textMuted: '#527c9f',
      amber: '#0284c7',
      amberGlow: '#38bdf8',
      amberDim: '#0369a1',
      isDark: true,
    },
  },
  {
    name: 'Minimal Slate (Light)',
    colors: {
      bg: '#f8fafc',
      surface: '#ffffff',
      surface2: '#f1f5f9',
      surface3: '#e2e8f0',
      border: '#cbd5e1',
      borderSoft: '#e2e8f0',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      textMuted: '#94a3b8',
      amber: '#0284c7',
      amberGlow: '#38bdf8',
      amberDim: '#0369a1',
      isDark: false,
    },
  },
];

export function SettingsPage() {
  const settings = useLiveQuery(() => db.app_settings.get(1));
  const { isSupported, isGranted, permission, requestPermission } = useNotifications();
  const { user, isAuthenticated, syncState, lastSyncedAt, triggerSync, openAuthModal, logout } = useAuth();
  const [manualSyncing, setManualSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const {
    theme,
    setTheme,
    customColors,
    setCustomColors,
    fontSerif,
    setFontSerif,
    fontHand,
    setFontHand,
    fontUi,
    setFontUi,
    fontSizeScale,
    setFontSizeScale,
    resetAppearance,
  } = useAppTheme();

  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [customFontInput, setCustomFontInput] = useState('');
  const [customFontCategory, setCustomFontCategory] = useState<'serif' | 'hand' | 'ui'>('serif');

  useEffect(() => {
    if (settings?.displayName) setName(settings.displayName);
  }, [settings]);

  const saveName = async () => {
    if (!name.trim()) return;
    await db.app_settings.update(1, { displayName: name.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCustomColorChange = (key: keyof CustomThemeColors, value: string | boolean) => {
    const nextColors = { ...customColors, [key]: value };
    // Auto-derive border and secondary tones when key colors change
    if (key === 'bg' && typeof value === 'string') {
      const isLight = !nextColors.isDark;
      if (isLight) {
        nextColors.surface2 = nextColors.surface2 || '#f5f0e8';
        nextColors.border = nextColors.border || '#e2d9cc';
      }
    }
    setCustomColors(nextColors);
    if (theme !== 'custom') {
      setTheme('custom');
    }
  };

  const applyStarterPalette = (starter: CustomThemeColors) => {
    setCustomColors(starter);
    setTheme('custom');
  };

  const handleApplyCustomFont = () => {
    const trimmed = customFontInput.trim();
    if (!trimmed) return;
    if (customFontCategory === 'serif') setFontSerif(trimmed);
    if (customFontCategory === 'hand') setFontHand(trimmed);
    if (customFontCategory === 'ui') setFontUi(trimmed);
    setCustomFontInput('');
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
    if (!confirm('Are you sure? This will delete ALL your journal entries, habits, and reminders. This cannot be undone.')) return;
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
      <div className="settings-header-row">
        <h1 className="settings-title">
          <Settings size={26} className="inline-icon" /> Settings &amp; Personalization
        </h1>
        <button
          className="btn-reset-appearance"
          onClick={() => {
            if (confirm('Reset all theme colors and typography to defaults?')) {
              resetAppearance();
            }
          }}
          title="Reset theme and fonts to defaults"
        >
          <RotateCcw size={14} /> Reset Defaults
        </button>
      </div>

      {/* Profile / Display name */}
      <section className="settings-card animate-fadeInUp">
        <h2 className="settings-card-title">Your Name</h2>
        <p className="settings-card-desc">This appears in your daily greeting and identity habits.</p>
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

      {/* Theme Presets Selection */}
      <section className="settings-card animate-fadeInUp delay-1">
        <div className="settings-section-head">
          <div>
            <h2 className="settings-card-title">
              <Palette size={20} className="inline-icon" /> Color Themes &amp; Palettes
            </h2>
            <p className="settings-card-desc">Choose from curated aesthetics or design your own custom color scheme.</p>
          </div>
        </div>

        <div className="theme-presets-grid">
          {THEME_PRESETS.map((preset) => {
            const isActive = theme === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                className={`theme-preset-card ${isActive ? 'active' : ''}`}
                onClick={() => setTheme(preset.id)}
              >
                <div className="theme-swatch-bar" style={{ background: preset.previewBg }}>
                  <span className="swatch-bubble" style={{ background: preset.previewSurface, borderColor: preset.previewAccent }} />
                  <span className="swatch-accent" style={{ background: preset.previewAccent }} />
                </div>
                <div className="theme-preset-info">
                  <span className="theme-preset-name">
                    {preset.name}
                    {isActive && <Check size={14} className="theme-check-icon" />}
                  </span>
                  <span className="theme-preset-desc">{preset.description}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Theme Studio (Active or Expandable) */}
        <div className={`custom-theme-studio ${theme === 'custom' ? 'open' : ''}`}>
          <div className="custom-studio-header">
            <div className="custom-studio-title">
              <Sliders size={16} />
              <span>Custom Theme Studio</span>
            </div>
            <div className="mode-toggle-group">
              <button
                type="button"
                className={`mode-btn ${customColors.isDark ? 'active' : ''}`}
                onClick={() => handleCustomColorChange('isDark', true)}
              >
                <Moon size={13} /> Dark Base
              </button>
              <button
                type="button"
                className={`mode-btn ${!customColors.isDark ? 'active' : ''}`}
                onClick={() => handleCustomColorChange('isDark', false)}
              >
                <Sun size={13} /> Light Base
              </button>
            </div>
          </div>

          <p className="custom-studio-subtitle">
            Pick your exact colors below or click a starter palette:
          </p>

          {/* Quick starter palettes */}
          <div className="starter-palettes-row">
            {CUSTOM_PALETTE_STARTERS.map((starter) => (
              <button
                key={starter.name}
                type="button"
                className="starter-palette-chip"
                onClick={() => applyStarterPalette(starter.colors)}
              >
                <span className="starter-dot" style={{ background: starter.colors.bg }} />
                <span className="starter-dot" style={{ background: starter.colors.amber }} />
                <span>{starter.name}</span>
              </button>
            ))}
          </div>

          {/* Color pickers grid */}
          <div className="custom-colors-grid">
            <div className="color-picker-item">
              <label className="color-picker-label">Background Color</label>
              <div className="color-picker-control">
                <input
                  type="color"
                  className="color-input-swatch"
                  value={customColors.bg || DEFAULT_CUSTOM_COLORS.bg}
                  onChange={(e) => handleCustomColorChange('bg', e.target.value)}
                />
                <input
                  type="text"
                  className="color-input-hex"
                  value={customColors.bg || ''}
                  onChange={(e) => handleCustomColorChange('bg', e.target.value)}
                />
              </div>
            </div>

            <div className="color-picker-item">
              <label className="color-picker-label">Surface &amp; Cards</label>
              <div className="color-picker-control">
                <input
                  type="color"
                  className="color-input-swatch"
                  value={customColors.surface || DEFAULT_CUSTOM_COLORS.surface}
                  onChange={(e) => handleCustomColorChange('surface', e.target.value)}
                />
                <input
                  type="text"
                  className="color-input-hex"
                  value={customColors.surface || ''}
                  onChange={(e) => handleCustomColorChange('surface', e.target.value)}
                />
              </div>
            </div>

            <div className="color-picker-item">
              <label className="color-picker-label">Primary Text</label>
              <div className="color-picker-control">
                <input
                  type="color"
                  className="color-input-swatch"
                  value={customColors.textPrimary || DEFAULT_CUSTOM_COLORS.textPrimary}
                  onChange={(e) => handleCustomColorChange('textPrimary', e.target.value)}
                />
                <input
                  type="text"
                  className="color-input-hex"
                  value={customColors.textPrimary || ''}
                  onChange={(e) => handleCustomColorChange('textPrimary', e.target.value)}
                />
              </div>
            </div>

            <div className="color-picker-item">
              <label className="color-picker-label">Accent &amp; Glow (Amber)</label>
              <div className="color-picker-control">
                <input
                  type="color"
                  className="color-input-swatch"
                  value={customColors.amber || DEFAULT_CUSTOM_COLORS.amber}
                  onChange={(e) => {
                    const nextVal = e.target.value;
                    handleCustomColorChange('amber', nextVal);
                    handleCustomColorChange('amberGlow', nextVal);
                  }}
                />
                <input
                  type="text"
                  className="color-input-hex"
                  value={customColors.amber || ''}
                  onChange={(e) => {
                    const nextVal = e.target.value;
                    handleCustomColorChange('amber', nextVal);
                    handleCustomColorChange('amberGlow', nextVal);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Typography & Custom Font Studio */}
      <section className="settings-card animate-fadeInUp delay-2">
        <div className="settings-section-head">
          <div>
            <h2 className="settings-card-title">
              <Type size={20} className="inline-icon" /> Typography &amp; Custom Fonts
            </h2>
            <p className="settings-card-desc">Personalize your reading, journaling, and interface typography.</p>
          </div>
        </div>

        {/* 1. Heading Serif Font */}
        <div className="font-group-block">
          <div className="font-group-header">
            <span className="font-group-title">📖 Heading &amp; Title Font</span>
            <span className="font-group-current">{fontSerif}</span>
          </div>
          <div className="font-chips-row">
            {SERIF_FONTS.map((font) => {
              const isSelected = fontSerif === font.name || fontSerif === font.id || fontSerif === font.family;
              return (
                <button
                  key={font.id}
                  type="button"
                  className={`font-chip ${isSelected ? 'active' : ''}`}
                  style={{ fontFamily: font.family }}
                  onClick={() => setFontSerif(font.name)}
                >
                  <span>{font.name}</span>
                  {isSelected && <Check size={12} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Handwriting Script Font */}
        <div className="font-group-block">
          <div className="font-group-header">
            <span className="font-group-title">✍️ Handwriting &amp; Journal Font</span>
            <span className="font-group-current">{fontHand}</span>
          </div>
          <div className="font-chips-row">
            {HANDWRITING_FONTS.map((font) => {
              const isSelected = fontHand === font.name || fontHand === font.id || fontHand === font.family;
              return (
                <button
                  key={font.id}
                  type="button"
                  className={`font-chip script-chip ${isSelected ? 'active' : ''}`}
                  style={{ fontFamily: font.family }}
                  onClick={() => setFontHand(font.name)}
                >
                  <span>{font.name}</span>
                  {isSelected && <Check size={12} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. UI & Body Font */}
        <div className="font-group-block">
          <div className="font-group-header">
            <span className="font-group-title">🖥️ UI &amp; Body Font</span>
            <span className="font-group-current">{fontUi}</span>
          </div>
          <div className="font-chips-row">
            {UI_FONTS.map((font) => {
              const isSelected = fontUi === font.name || fontUi === font.id || fontUi === font.family;
              return (
                <button
                  key={font.id}
                  type="button"
                  className={`font-chip ${isSelected ? 'active' : ''}`}
                  style={{ fontFamily: font.family }}
                  onClick={() => setFontUi(font.name)}
                >
                  <span>{font.name}</span>
                  {isSelected && <Check size={12} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Font Input Option */}
        <div className="custom-font-input-box">
          <span className="custom-font-input-title">Use Any Custom Google / System Font</span>
          <div className="custom-font-row">
            <select
              className="custom-font-select"
              value={customFontCategory}
              onChange={(e) => setCustomFontCategory(e.target.value as 'serif' | 'hand' | 'ui')}
            >
              <option value="serif">Apply to Headings</option>
              <option value="hand">Apply to Handwriting</option>
              <option value="ui">Apply to UI Body</option>
            </select>
            <input
              type="text"
              className="form-input custom-font-text-input"
              placeholder="e.g. Fira Code, Poppins, Sacramento, Cinzel..."
              value={customFontInput}
              onChange={(e) => setCustomFontInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyCustomFont()}
            />
            <button
              type="button"
              className="btn-apply-font"
              onClick={handleApplyCustomFont}
              disabled={!customFontInput.trim()}
            >
              Apply Font
            </button>
          </div>
        </div>

        {/* 4. Font Size Scale */}
        <div className="font-group-block">
          <div className="font-group-header">
            <span className="font-group-title">📏 Text Size &amp; Density</span>
          </div>
          <div className="scale-picker-row">
            {FONT_SIZE_SCALES.map((scale) => {
              const isSelected = fontSizeScale === scale.id;
              return (
                <button
                  key={scale.id}
                  type="button"
                  className={`scale-option-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => setFontSizeScale(scale.id as FontSizeScale)}
                >
                  <span className="scale-label">{scale.label}</span>
                  <span className="scale-desc">{scale.desc} ({scale.px})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Typography & Theme Preview Card */}
        <div className="live-preview-box">
          <div className="live-preview-badge">
            <Eye size={13} /> Live Preview
          </div>
          <div className="live-preview-content">
            <div className="live-preview-date">September 24, 2026 — DayScribe Journal</div>
            <h3 className="live-preview-heading">Your thoughts, illuminated by candlelight.</h3>
            <p className="live-preview-body">
              "Every action you take is a vote for the person you wish to become. No single instance will transform your beliefs, but as the votes build up, so does the evidence of your new identity."
            </p>
            <div className="live-preview-actions">
              <span className="live-preview-pill">
                <Sparkles size={13} /> 1% Better Every Day
              </span>
              <button type="button" className="live-preview-btn">
                Sample Action
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="settings-card animate-fadeInUp delay-3">
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
      <section className="settings-card animate-fadeInUp delay-3">
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

      {/* User Account & Cloud Sync */}
      <section className="settings-card animate-fadeInUp delay-3">
        <h2 className="settings-card-title">
          <UserCheck size={18} style={{ color: 'var(--color-amber)' }} /> Akun Pengguna
        </h2>
        <p className="settings-card-desc">
          {isAuthenticated
            ? `Masuk sebagai ${user?.name || user?.email}. Semua data tersimpan aman di database server.`
            : 'Masuk dengan akun kamu agar data jurnal & habit tersimpan aman di server VPS.'}
        </p>

        <div className="account-card-body">
          {isAuthenticated ? (
            <div>
              <div className="account-user-banner">
                <div className="account-user-info">
                  <div className="account-user-avatar">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <div className="account-user-title">{user?.name || 'Pengguna DayScribe'}</div>
                    <div className="account-user-email">{user?.email}</div>
                  </div>
                </div>
                <div className="account-user-status">
                  <span className="account-active-badge">
                    <span className="account-online-dot" /> Akun Aktif
                  </span>
                  {lastSyncedAt && (
                    <span className="account-sync-time">
                      Sinkron: {new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>

              {syncSuccessMsg && (
                <div className="account-sync-msg">
                  {syncSuccessMsg}
                </div>
              )}

              <div className="account-actions-row">
                <button
                  type="button"
                  disabled={manualSyncing || syncState === 'syncing'}
                  onClick={async () => {
                    setManualSyncing(true);
                    setSyncSuccessMsg(null);
                    await triggerSync();
                    setManualSyncing(false);
                    setSyncSuccessMsg('Data akun berhasil disinkronkan dengan server!');
                    setTimeout(() => setSyncSuccessMsg(null), 3000);
                  }}
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '13px' }}
                >
                  <RefreshCw size={14} className={manualSyncing || syncState === 'syncing' ? 'animate-spin' : ''} />
                  {manualSyncing || syncState === 'syncing' ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                  }}
                  className="btn-danger"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 16px', fontSize: '13px' }}
                >
                  <LogOut size={14} /> Keluar (Logout)
                </button>
              </div>
            </div>
          ) : (
            <div className="account-actions-row">
              <button
                type="button"
                onClick={openAuthModal}
                className="btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', fontSize: '14px' }}
              >
                <LogIn size={16} /> Masuk / Buat Akun Baru
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Data Management */}
      <section className="settings-card animate-fadeInUp delay-4">
        <h2 className="settings-card-title">Data &amp; Privacy</h2>
        <p className="settings-card-desc">
          DayScribe is 100% offline-first. All data is stored securely in your browser's IndexedDB.
        </p>
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

