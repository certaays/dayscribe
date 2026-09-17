import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useJournal } from '../hooks/useJournal';
import { formatDate, MONTH_NAMES, DAY_NAMES, getMonthDays, toDateString, isToday, MOODS } from '../utils/dateHelpers';
import { HabitGrid } from '../components/HabitGrid';
import {
  BookMarked,
  List,
  Calendar,
  MoodIcon,
  ChevronLeft,
  ChevronRight,
  PenTool,
  ArrowRight,
  Flame,
} from '../components/icons/AppIcons';
import './JournalPage.css';

export function JournalPage() {
  const { entries, loading } = useJournal();
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [filterMood, setFilterMood] = useState('');

  const entryDates = new Set(entries.map((e) => e.date));

  const filtered = filterMood
    ? entries.filter((e) => e.mood === filterMood)
    : entries;

  const days = getMonthDays(calYear, calMonth);
  const firstDay = days[0]?.getDay() ?? 0;

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  return (
    <div className="journal-page">
      <header className="journal-header">
        <div>
          <h1 className="journal-title">My Journal</h1>
          <p className="journal-subtitle">
            Today is <span className="today-highlight">{formatDate(new Date(), { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </p>
        </div>
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={15} /> List
          </button>
          <button
            className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            <Calendar size={15} /> Calendar
          </button>
        </div>
      </header>

      {/* Activity Grid */}
      <div className="journal-activity-card">
        <h2 className="journal-section-title">Your Activity</h2>
        <p className="journal-section-desc">Calendar year — journal entries, habits &amp; routines</p>
        <HabitGrid />
      </div>

      {/* Mood filter */}
      <div className="mood-filter">
        <button
          className={`mood-filter-btn ${filterMood === '' ? 'active' : ''}`}
          onClick={() => setFilterMood('')}
        >
          All
        </button>
        {MOODS.map((m) => (
          <button
            key={m.emoji}
            className={`mood-filter-btn ${filterMood === m.emoji ? 'active' : ''}`}
            onClick={() => setFilterMood(filterMood === m.emoji ? '' : m.emoji)}
            title={m.label}
          >
            <MoodIcon mood={m.emoji} size={16} />
          </button>
        ))}
      </div>

      {/* Calendar view */}
      {viewMode === 'calendar' && (
        <div className="calendar animate-scaleIn">
          <div className="cal-nav">
            <button className="cal-nav-btn" onClick={prevMonth} title="Previous month">
              <ChevronLeft size={16} />
            </button>
            <span className="cal-month-label">{MONTH_NAMES[calMonth]} {calYear}</span>
            <button className="cal-nav-btn" onClick={nextMonth} title="Next month">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="cal-grid">
            {DAY_NAMES.map((d) => (
              <div key={d} className="cal-day-name">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="cal-empty" />
            ))}
            {days.map((day) => {
              const dateStr = toDateString(day);
              const hasEntry = entryDates.has(dateStr);
              const entry = entries.find((e) => e.date === dateStr);
              const today = isToday(day);
              return (
                <Link
                  key={dateStr}
                  to={entry ? `/editor/${entry.id}` : `/editor/new?date=${dateStr}`}
                  className={`cal-day ${hasEntry ? 'has-entry' : ''} ${today ? 'today' : ''}`}
                >
                  <span className="cal-day-num">{day.getDate()}</span>
                  {hasEntry && (
                    <span className="cal-entry-dot" title={entry?.mood}>
                      <MoodIcon mood={entry?.mood || ''} size={13} />
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <div className="entries-list">
          {loading && (
            <div className="loading-state">
              <Flame size={20} className="animate-pulse text-amber" />
              <span>Loading entries...</span>
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="empty-journal">
              <div className="empty-journal-icon">
                <BookMarked size={36} color="var(--color-amber)" />
              </div>
              <h3>No entries yet</h3>
              <p>Start writing your first journal entry.</p>
              <Link to="/editor/new" className="btn-write">
                <PenTool size={16} /> Write Today's Entry
              </Link>
            </div>
          )}
          {filtered.map((entry, i) => (
            <Link
              key={entry.id}
              to={`/editor/${entry.id}`}
              className="entry-card animate-fadeInUp"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="entry-card-left">
                <span className="entry-mood-big">
                  <MoodIcon mood={entry.mood} size={24} />
                </span>
              </div>
              <div className="entry-card-body">
                <div className="entry-card-header">
                  <span className="entry-card-date">
                    {formatDate(new Date(entry.date), { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  {isToday(entry.date) && <span className="today-badge">Today</span>}
                </div>
                {entry.title && <h3 className="entry-card-title">{entry.title}</h3>}
                <p className="entry-card-preview">
                  {entry.content.slice(0, 120)}{entry.content.length > 120 ? '…' : ''}
                </p>
                {entry.tags.length > 0 && (
                  <div className="entry-card-tags">
                    {entry.tags.map((t: string) => <span key={t} className="entry-tag">#{t}</span>)}
                  </div>
                )}
              </div>
              <span className="entry-card-arrow">
                <ArrowRight size={18} />
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* FAB */}
      <Link to="/editor/new" className="fab" title="New entry">
        <PenTool size={20} />
      </Link>
    </div>
  );
}

