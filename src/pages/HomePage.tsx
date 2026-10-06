import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useReminders } from '../hooks/useReminders';
import { useHabits } from '../hooks/useHabits';
import { useJournal } from '../hooks/useJournal';
import { formatDate, getGreeting, MOODS } from '../utils/dateHelpers';
import { db } from '../db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Flame,
  HabitIcon,
  MoodIcon,
  Check,
  Sparkles,
  Bell,
  BookOpen,
  PenTool,
  ArrowRight,
  Plus,
  Minus,
  UserCheck,
  ShieldAlert,
  Link2,
  Zap,
} from '../components/icons/AppIcons';
import './HomePage.css';

export function HomePage() {
  const navigate = useNavigate();
  const { todayReminders, completedIds, completedCount, progress, streak, toggleCompleted, loading: rLoading } = useReminders();
  const {
    todayHabits,
    toggleHabit,
    incrementCount,
    completedTodayCount,
    totalTodayCount,
    progressPercent: habitProgress,
    totalIdentityVotesToday,
    neverMissTwiceHabits,
    loading: hLoading,
  } = useHabits();
  const { getTodayEntry, entries } = useJournal();
  const [checkingOff, setCheckingOff] = useState<string | null>(null);

  const settings = useLiveQuery(() => db.app_settings.get(1));
  const today = new Date();
  const todayEntry = getTodayEntry();
  const recentEntries = entries.slice(0, 3);

  const handleToggle = async (id: string) => {
    setCheckingOff(id);
    await toggleCompleted(id);
    setTimeout(() => setCheckingOff(null), 400);
  };

  return (
    <div className="home-page">
      {/* Header greeting */}
      <header className="home-header">
        <div className="home-greeting">
          <span className="greeting-candle">
            <Flame size={28} className="flame-icon-svg" />
          </span>
          <div>
            <h1 className="greeting-text">
              {getGreeting()}, <span className="greeting-name">{settings?.displayName ?? 'Friend'}</span>
            </h1>
            <p className="greeting-date">{formatDate(today)}</p>
          </div>
        </div>

        <div className="home-header-badges">
          {totalIdentityVotesToday > 0 && (
            <div className="identity-vote-pill" title="Identity votes cast today via Atomic Habits">
              <UserCheck size={14} color="#38bdf8" />
              <span><strong>{totalIdentityVotesToday}</strong> identity votes today</span>
            </div>
          )}

          {streak > 0 && (
            <div className="streak-badge">
              <span className="streak-fire">
                <Flame size={16} />
              </span>
              <span className="streak-count">{streak}</span>
              <span className="streak-label">day streak</span>
            </div>
          )}
        </div>
      </header>

      {/* Today's mood quick entry */}
      <section className="mood-section animate-fadeInUp delay-1">
        <h2 className="section-title">How are you feeling?</h2>
        <div className="mood-row">
          {MOODS.map((mood) => {
            const isSelected = todayEntry?.mood === mood.emoji;
            return (
              <button
                key={mood.emoji}
                className={`mood-btn ${isSelected ? 'selected' : ''}`}
                title={mood.label}
                style={{ '--mood-color': mood.color } as React.CSSProperties}
                onClick={() => navigate(todayEntry ? `/editor/${todayEntry.id}` : '/editor/new')}
              >
                <MoodIcon mood={mood.emoji} size={22} />
              </button>
            );
          })}
        </div>
      </section>

      {/* Never Miss Twice Priority Comeback (Atomic Habits) */}
      {neverMissTwiceHabits.length > 0 && (
        <section className="home-nmt-priority animate-fadeInUp delay-1">
          <div className="home-nmt-card">
            <div className="home-nmt-icon-box">
              <ShieldAlert size={20} />
            </div>
            <div className="home-nmt-info">
              <span className="home-nmt-title">Never Miss Twice Comeback</span>
              <span className="home-nmt-sub">
                Protect your momentum on <strong>{neverMissTwiceHabits[0].title}</strong> today!
              </span>
            </div>
            <div className="home-nmt-actions">
              {neverMissTwiceHabits[0].twoMinuteRule ? (
                <button
                  className="home-nmt-btn two-min"
                  onClick={() => toggleHabit(neverMissTwiceHabits[0].id, true)}
                  title={`2-Min starter: ${neverMissTwiceHabits[0].twoMinuteRule}`}
                >
                  <Zap size={13} /> 2-Min Rule
                </button>
              ) : (
                <button
                  className="home-nmt-btn"
                  onClick={() => toggleHabit(neverMissTwiceHabits[0].id)}
                >
                  <Check size={13} /> Complete
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Today's Habits Section */}
      <section className="home-habits-section animate-fadeInUp delay-2">
        <div className="section-header">
          <h2 className="section-title">Daily Habits &amp; Rituals</h2>
          <Link to="/habits" className="section-link">All Habits →</Link>
        </div>

        {!hLoading && todayHabits.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">
              <Sparkles size={28} />
            </span>
            <p>No habits scheduled for today.</p>
            <Link to="/habits" className="btn-add-reminder">+ Add Habit</Link>
          </div>
        )}

        {todayHabits.length > 0 && (
          <>
            <div className="progress-bar-wrap">
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${habitProgress}%` }}
                />
              </div>
              <span className="progress-text">
                {completedTodayCount} of {totalTodayCount} done ({habitProgress}%)
              </span>
            </div>

            <div className="home-habits-grid">
              {todayHabits.map((habit) => (
                <div
                  key={habit.id}
                  className={`home-habit-card ${habit.completed ? 'completed' : ''} ${habit.missedYesterday && !habit.completed ? 'home-missed-alert' : ''}`}
                >
                  <span className="home-habit-emoji">
                    <HabitIcon icon={habit.emoji} size={20} />
                  </span>
                  <div className="home-habit-info">
                    <div className="home-habit-topline">
                      <span className="home-habit-title">{habit.title}</span>
                      {habit.identity && (
                        <span className="home-habit-id-tag" title={`Identity: ${habit.identity}`}>
                          <UserCheck size={9} /> {habit.identity}
                        </span>
                      )}
                    </div>
                    {habit.stackTrigger && (
                      <span className="home-stack-cue" title="Stack Cue">
                        <Link2 size={10} /> {habit.stackTrigger}
                      </span>
                    )}
                    <span className="home-habit-sub">
                      {habit.targetType === 'count'
                        ? `${habit.currentCount}/${habit.targetCount} ${habit.unit || ''}`
                        : habit.completed ? 'Completed' : 'To do'}
                      {habit.streak > 0 ? ` · 🔥 ${habit.streak}d` : ''}
                    </span>
                  </div>

                  {habit.targetType === 'boolean' ? (
                    <div className="home-action-group">
                      <button
                        className={`check-btn ${habit.completed ? 'checked' : ''}`}
                        onClick={() => toggleHabit(habit.id)}
                        aria-label={habit.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {habit.completed ? <Check size={14} strokeWidth={3} /> : null}
                      </button>
                    </div>
                  ) : (
                    <div className="home-counter-actions">
                      <button
                        className="counter-btn-mini"
                        onClick={() => incrementCount(habit.id, -1)}
                        disabled={habit.currentCount <= 0}
                        title="Subtract 1"
                      >
                        <Minus size={12} />
                      </button>
                      <button
                        className="counter-btn-mini plus"
                        onClick={() => incrementCount(habit.id, 1)}
                        title="Add 1"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Today's reminders */}
      <section className="reminders-section animate-fadeInUp delay-3">
        <div className="section-header">
          <h2 className="section-title">Today's Routines</h2>
          <Link to="/reminders" className="section-link">Manage →</Link>
        </div>

        {!rLoading && todayReminders.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">
              <Bell size={28} />
            </span>
            <p>No reminders for today.</p>
            <Link to="/reminders" className="btn-add-reminder">+ Add Routine</Link>
          </div>
        )}

        {todayReminders.length > 0 && (
          <>
            <div className="progress-bar-wrap">
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="progress-text">
                {completedCount} of {todayReminders.length} done
              </span>
            </div>

            <ul className="reminder-list">
              {todayReminders.map((r, i) => {
                const done = completedIds.includes(r.id);
                const isAnimating = checkingOff === r.id;
                return (
                  <li
                    key={r.id}
                    className={`reminder-item animate-fadeInUp ${done ? 'completed' : ''} ${isAnimating ? 'checking' : ''}`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <button
                      className={`check-btn ${done ? 'checked' : ''}`}
                      onClick={() => handleToggle(r.id)}
                      aria-label={done ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {done ? <Check size={14} strokeWidth={3} /> : null}
                    </button>
                    <div className="reminder-info">
                      <span className="reminder-label">{r.label}</span>
                      <span className="reminder-time">
                        {r.time.split(':').map(Number).reduce((h, m, i) => {
                          if (i === 0) return m >= 12 ? `${m === 12 ? 12 : m - 12}` : `${m || 12}`;
                          return `${h}:${String(m).padStart(2, '0')} ${Number(r.time.split(':')[0]) >= 12 ? 'PM' : 'AM'}`;
                        }, '')}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      {/* Quick journal entry */}
      <section className="journal-cta animate-fadeInUp delay-3">
        {todayEntry ? (
          <Link to={`/editor/${todayEntry.id}`} className="journal-cta-card existing">
            <div className="journal-cta-icon">
              <BookOpen size={22} />
            </div>
            <div>
              <p className="journal-cta-label">Continue today's entry</p>
              <p className="journal-cta-preview">
                {todayEntry.content.slice(0, 80)}{todayEntry.content.length > 80 ? '…' : ''}
              </p>
            </div>
            <span className="journal-cta-arrow">
              <ArrowRight size={18} />
            </span>
          </Link>
        ) : (
          <Link to="/editor/new" className="journal-cta-card new">
            <div className="journal-cta-icon">
              <PenTool size={22} />
            </div>
            <div>
              <p className="journal-cta-label">Write in your journal</p>
              <p className="journal-cta-subtitle">Capture today's thoughts</p>
            </div>
            <span className="journal-cta-arrow">
              <ArrowRight size={18} />
            </span>
          </Link>
        )}
      </section>

      {/* Recent entries */}
      {recentEntries.length > 0 && (
        <section className="recent-section animate-fadeInUp delay-4">
          <div className="section-header">
            <h2 className="section-title">Recent Entries</h2>
            <Link to="/journal" className="section-link">All entries →</Link>
          </div>
          <div className="recent-list">
            {recentEntries.map((entry) => (
              <Link key={entry.id} to={`/editor/${entry.id}`} className="recent-card">
                <span className="recent-mood">
                  <MoodIcon mood={entry.mood} size={20} />
                </span>
                <div className="recent-info">
                  <span className="recent-date">{formatDate(new Date(entry.date), { month: 'short', day: 'numeric', weekday: 'short' })}</span>
                  <p className="recent-preview">
                    {entry.title || entry.content.slice(0, 60)}{(!entry.title && entry.content.length > 60) ? '…' : ''}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


