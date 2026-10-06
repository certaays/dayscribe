import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  X,
  Mail,
  Lock,
  User,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import './AuthModal.css';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register, lastSyncedAt, user, logout } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setError('Mohon isi email dan password.');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegisterMode) {
        await register(email, password, name);
        setSuccessMessage('Akun berhasil dibuat! Selamat datang di DayScribe.');
      } else {
        await login(email, password);
        setSuccessMessage('Berhasil masuk! Memuat datamu...');
      }
      setTimeout(() => {
        closeAuthModal();
      }, 900);
    } catch (err: any) {
      setError(err.message || 'Gagal masuk. Periksa kembali email dan password kamu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={closeAuthModal}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Glow Accent Header */}
        <div className="auth-modal-glow-line" />

        {/* Close Button */}
        <button onClick={closeAuthModal} className="auth-modal-close-btn" title="Tutup">
          <X size={16} />
        </button>

        {user ? (
          /* User Profile View (Logged in) */
          <div className="auth-profile-box">
            <div className="auth-profile-header">
              <div className="auth-profile-avatar">
                <User size={26} />
              </div>
              <div>
                <h3 className="auth-profile-name">{user.name || 'Pengguna DayScribe'}</h3>
                <p className="auth-profile-email">{user.email}</p>
              </div>
            </div>

            <div className="auth-profile-status-card">
              <div className="auth-status-row">
                <span className="auth-status-label">
                  <ShieldCheck size={14} className="text-emerald-400" /> Status Akun
                </span>
                <span className="auth-status-active">
                  <span className="auth-status-pulse-dot" />
                  Tersambung ke Server
                </span>
              </div>
              {lastSyncedAt && (
                <div className="auth-status-row">
                  <span className="auth-status-label">Sinkronisasi Terakhir</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    {new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>

            <p className="auth-profile-desc">
              Semua jurnal, Atomic Habits, dan pengaturan tampilan tersimpan aman di akun server VPS kamu.
            </p>

            <button
              onClick={async () => {
                await logout();
                closeAuthModal();
              }}
              className="auth-logout-btn"
            >
              <LogOut size={16} /> Keluar dari Akun (Logout)
            </button>
          </div>
        ) : (
          /* Login / Register Form */
          <div>
            <div className="auth-modal-header">
              <div className="auth-icon-badge">
                <Sparkles size={22} />
              </div>
              <h3 className="auth-modal-title">
                {isRegisterMode ? 'Buat Akun DayScribe' : 'Masuk ke DayScribe'}
              </h3>
              <p className="auth-modal-subtitle">
                {isRegisterMode
                  ? 'Daftar untuk menyimpan semua jurnal dan habitmu di server VPS.'
                  : 'Masuk dengan email & password untuk mengakses datamu.'}
              </p>
            </div>

            {error && (
              <div className="auth-alert-error">
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="auth-alert-success">
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {isRegisterMode && (
                <div className="auth-form-group">
                  <label className="auth-form-label">Nama Kamu</label>
                  <div className="auth-input-wrapper">
                    <span className="auth-input-icon"><User size={16} /></span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Caca"
                      className="auth-input-field"
                    />
                  </div>
                </div>
              )}

              <div className="auth-form-group">
                <label className="auth-form-label">Email</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon"><Mail size={16} /></span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="auth-input-field"
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <label className="auth-form-label">Password</label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon"><Lock size={16} /></span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="auth-input-field"
                  />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="auth-submit-btn">
                {isLoading ? (
                  <span className="auth-spinner" />
                ) : (
                  <>
                    <span>{isRegisterMode ? 'Buat Akun' : 'Masuk ke Akun'}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-switch-mode">
              {isRegisterMode ? (
                <span>
                  Sudah punya akun?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(false);
                      setError(null);
                    }}
                    className="auth-switch-btn"
                  >
                    Masuk di sini
                  </button>
                </span>
              ) : (
                <span>
                  Belum punya akun?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(true);
                      setError(null);
                    }}
                    className="auth-switch-btn"
                  >
                    Daftar di sini
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
