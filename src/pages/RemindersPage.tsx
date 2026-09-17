import React, { useState } from 'react';
import { useReminders } from '../hooks/useReminders';
import { useNotifications } from '../hooks/useNotifications';
import { formatTime, DAY_NAMES } from '../utils/dateHelpers';
import type { Reminder } from '../db/database';
import {
  Bell,
  Flame,
  Plus,
  Pencil,
  Trash2,
  Play,
  Pause,
  Check,
  X,
} from '../components/icons/AppIcons';
import './RemindersPage.css';

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

function ReminderModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Partial<Reminder>;
  onSave: (data: Omit<Reminder, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}) {
  const [label, setLabel] = useState(initial?.label ?? '');
  const [time, setTime] = useState(initial?.time ?? '08:00');
  const [repeatDays, setRepeatDays] = useState<number[]>(initial?.repeatDays ?? ALL_DAYS);
  const [notifyEnabled, setNotifyEnabled] = useState(initial?.notifyEnabled ?? true);

  const toggleDay = (d: number) => {
    setRepeatDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onSave({ label: label.trim(), time, repeatDays, isActive: true, notifyEnabled });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-scaleIn">
        <div className="modal-header">
          <h2 className="modal-title">{initial?.id ? 'Edit Reminder' : 'New Reminder'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Activity</label>
            <input
              className="form-input"
              placeholder="e.g. Morning stretch & mindfulness"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Time</label>
            <input
              className="form-input"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Repeat on</label>
            <div className="day-picker">
              {DAY_NAMES.map((name, i) => (
                <button
                  key={i}
                  type="button"
                  className={`day-btn ${repeatDays.includes(i) ? 'active' : ''}`}
                  onClick={() => toggleDay(i)}
                >
                  {name}
                </button>
              ))}
            </div>
            <div className="day-presets">
              <button type="button" className="preset-btn" onClick={() => setRepeatDays(ALL_DAYS)}>Every day</button>
              <button type="button" className="preset-btn" onClick={() => setRepeatDays([1,2,3,4,5])}>Weekdays</button>
              <button type="button" className="preset-btn" onClick={() => setRepeatDays([0,6])}>Weekends</button>
            </div>
          </div>

          <div className="form-group form-row">
            <label className="form-label">Notifications</label>
            <button
              type="button"
              className={`toggle-switch ${notifyEnabled ? 'on' : ''}`}
              onClick={() => setNotifyEnabled((v) => !v)}
              aria-label="Toggle notifications"
            >
              <span className="toggle-thumb" />
            </button>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">
              {initial?.id ? 'Save Changes' : '+ Add Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function RemindersPage() {
  const { reminders, streak, toggleActive, toggleCompleted, completedIds, createReminder, updateReminder, deleteReminder } = useReminders();
  const { isGranted, isSupported, requestPermission } = useNotifications();
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Reminder | undefined>();

  const handleSave = async (data: Omit<Reminder, 'id' | 'createdAt'>) => {
    if (editTarget) {
      await updateReminder(editTarget.id, data);
    } else {
      await createReminder(data);
    }
    setShowModal(false);
    setEditTarget(undefined);
  };

  const handleEdit = (r: Reminder) => {
    setEditTarget(r);
    setShowModal(true);
  };

  return (
    <div className="reminders-page">
      <header className="reminders-header">
        <div>
          <h1 className="reminders-title">Reminders</h1>
          {streak > 0 && (
            <p className="streak-line">
              <Flame size={14} className="inline-icon" /> {streak}-day streak! Keep it up!
            </p>
          )}
        </div>
        <button className="btn-new-reminder" onClick={() => { setEditTarget(undefined); setShowModal(true); }}>
          <Plus size={15} /> New
        </button>
      </header>

      {/* Notification permission banner */}
      {isSupported && !isGranted && (
        <div className="notification-banner animate-fadeInDown">
          <span className="banner-icon">
            <Bell size={22} color="var(--color-amber)" />
          </span>
          <div>
            <p className="banner-title">Enable notifications</p>
            <p className="banner-desc">Get reminded when it's time for your activities.</p>
          </div>
          <button className="btn-enable-notif" onClick={requestPermission}>
            Enable
          </button>
        </div>
      )}

      {reminders.length === 0 && (
        <div className="empty-reminders">
          <span className="empty-r-icon">
            <Bell size={36} color="var(--color-amber)" />
          </span>
          <h3>No reminders yet</h3>
          <p>Add your first daily activity to start building better habits.</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Add Your First Reminder
          </button>
        </div>
      )}

      <ul className="reminders-full-list">
        {reminders.map((r, i) => {
          const done = completedIds.includes(r.id);
          return (
            <li
              key={r.id}
              className={`reminder-full-item animate-fadeInUp ${!r.isActive ? 'inactive' : ''}`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <button
                className={`check-btn-lg ${done ? 'checked' : ''}`}
                onClick={() => toggleCompleted(r.id)}
                aria-label={done ? 'Mark incomplete' : 'Mark complete'}
              >
                {done ? <Check size={16} strokeWidth={3} /> : null}
              </button>

              <div className="reminder-full-info">
                <span className="reminder-full-label">{r.label}</span>
                <div className="reminder-full-meta">
                  <span className="reminder-full-time">{formatTime(r.time)}</span>
                  <span className="reminder-full-days">
                    {r.repeatDays.length === 7
                      ? 'Every day'
                      : r.repeatDays.map((d) => DAY_NAMES[d]).join(', ')}
                  </span>
                  {r.notifyEnabled && (
                    <span className="reminder-notif-badge">
                      <Bell size={11} />
                    </span>
                  )}
                </div>
              </div>

              <div className="reminder-full-actions">
                <button
                  className={`active-toggle ${r.isActive ? 'on' : ''}`}
                  onClick={() => toggleActive(r.id)}
                  title={r.isActive ? 'Pause' : 'Activate'}
                  aria-label={r.isActive ? 'Pause' : 'Activate'}
                >
                  {r.isActive ? <Pause size={13} /> : <Play size={13} />}
                </button>
                <button className="edit-btn" onClick={() => handleEdit(r)} title="Edit" aria-label="Edit">
                  <Pencil size={15} />
                </button>
                <button className="delete-btn" onClick={() => deleteReminder(r.id)} title="Delete" aria-label="Delete">
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {showModal && (
        <ReminderModal
          initial={editTarget}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditTarget(undefined); }}
        />
      )}
    </div>
  );
}

