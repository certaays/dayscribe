import { useState, useMemo, useRef } from 'react';
import { useHabitData, type DayActivity } from '../hooks/useHabitData';
import { MONTH_NAMES, formatDate, toDateString } from '../utils/dateHelpers';
import { Sparkles, Calendar, ChevronLeft, ChevronRight } from './icons/AppIcons';
import './HabitGrid.css';

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function parseDateParts(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, monthIndex: m - 1, day: d };
}

function getLevelLabel(day: DayActivity): string {
  if (day.isFuture) return 'Future date';
  if (day.level === 0) return 'No activity recorded';
  const parts: string[] = [];
  if (day.journaled) parts.push('Journaled');
  if (day.habitsCompleted > 0) parts.push(`${day.habitsCompleted}/${day.habitsTotal} habits`);
  if (day.remindersCompleted > 0) parts.push(`${day.remindersCompleted}/${day.remindersTotal} routines`);
  return parts.length > 0 ? parts.join(' · ') : 'Activity recorded';
}

export function HabitGrid() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const { data, loading } = useHabitData(selectedYear);
  const [tooltip, setTooltip] = useState<{ day: DayActivity; x: number; y: number } | null>(null);
  const gridWrapRef = useRef<HTMLDivElement>(null);

  const today = toDateString(new Date());

  // Group days into weeks (columns of 7)
  const weeks = useMemo(() => {
    if (!data.length) return [];
    const result: (DayActivity | null)[][] = [];

    const firstDay = parseDateParts(data[0].date);
    const firstDayOfWeek = new Date(firstDay.year, firstDay.monthIndex, firstDay.day).getDay();

    let currentWeek: (DayActivity | null)[] = Array(firstDayOfWeek).fill(null);

    for (const day of data) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      result.push(currentWeek);
    }
    return result;
  }, [data]);

  // Month label positions (where each month begins)
  const monthLabels = useMemo(() => {
    const labels: { col: number; label: string }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, colIndex) => {
      const firstRealDay = week.find(Boolean);
      if (firstRealDay) {
        const { monthIndex } = parseDateParts(firstRealDay.date);
        if (monthIndex !== lastMonth) {
          labels.push({ col: colIndex, label: MONTH_NAMES[monthIndex].slice(0, 3) });
          lastMonth = monthIndex;
        }
      }
    });

    return labels;
  }, [weeks]);

  // Stats
  const totalJournaled = useMemo(() => data.filter((d) => d.journaled && !d.isFuture).length, [data]);
  const totalPerfect = useMemo(() => data.filter((d) => d.level === 4 && !d.isFuture).length, [data]);
  const currentStreak = useMemo(() => {
    let streak = 0;
    const pastDays = data.filter((d) => !d.isFuture).reverse();
    for (const d of pastDays) {
      if (d.level > 0) streak++;
      else break;
    }
    return streak;
  }, [data]);

  if (loading) {
    return (
      <div className="habit-grid-loading">
        <Sparkles size={18} className="animate-spin text-amber" />
        <span>Loading activity...</span>
      </div>
    );
  }

  return (
    <div className="habit-grid-wrap" ref={gridWrapRef}>
      {/* Stats row & Year selector & Today date */}
      <div className="habit-stats-row">
        <div className="habit-stats">
          <div className="habit-stat">
            <span className="habit-stat-value">{totalJournaled}</span>
            <span className="habit-stat-label">days journaled</span>
          </div>
          <div className="habit-stat">
            <span className="habit-stat-value">{totalPerfect}</span>
            <span className="habit-stat-label">perfect days</span>
          </div>
          <div className="habit-stat">
            <span className="habit-stat-value">{currentStreak}</span>
            <span className="habit-stat-label">day streak</span>
          </div>
        </div>

        <div className="habit-controls-right">
          {/* Today Indicator Pill */}
          <div className="grid-today-badge">
            <span className="today-badge-dot">
              <Calendar size={13} />
            </span>
            <span>Today: {formatDate(new Date(), { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>

          {/* Year toggle */}
          <div className="grid-year-picker">
            <button
              className="year-nav-btn"
              onClick={() => setSelectedYear((y) => y - 1)}
              title="Previous year"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="year-display">{selectedYear}</span>
            <button
              className="year-nav-btn"
              onClick={() => setSelectedYear((y) => y + 1)}
              disabled={selectedYear >= new Date().getFullYear()}
              title="Next year"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="habit-grid-container">
        {/* Month labels: Jan (1) to Dec (12) */}
        <div className="habit-month-row">
          <div className="habit-day-label-col" />
          {weeks.map((_, col) => {
            const label = monthLabels.find((m) => m.col === col);
            return (
              <div key={col} className="habit-month-cell">
                {label && <span className="habit-month-text">{label.label}</span>}
              </div>
            );
          })}
        </div>

        {/* Grid body */}
        <div className="habit-grid-body">
          {/* Day labels column */}
          <div className="habit-day-label-col">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="habit-day-label">{label}</div>
            ))}
          </div>

          {/* Week columns */}
          {weeks.map((week, col) => (
            <div key={col} className="habit-week-col">
              {week.map((day, row) => {
                if (!day) return <div key={row} className="habit-cell empty" />;
                const isToday = day.date === today;
                return (
                  <div
                    key={row}
                    className={`habit-cell level-${day.level} ${isToday ? 'today' : ''} ${day.isFuture ? 'future' : ''}`}
                    onMouseEnter={(e) => {
                      if (!gridWrapRef.current) return;
                      const gridRect = gridWrapRef.current.getBoundingClientRect();
                      const cellRect = e.currentTarget.getBoundingClientRect();
                      const x = cellRect.left - gridRect.left + cellRect.width / 2;
                      const y = cellRect.top - gridRect.top - 6;
                      setTooltip({ day, x, y });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="habit-legend-row">
        <div className="habit-legend">
          <span className="habit-legend-label">Less</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <div key={l} className={`habit-cell level-${l}`} />
          ))}
          <span className="habit-legend-label">More</span>
        </div>

        <div className="habit-legend-today">
          <div className="habit-cell today" />
          <span className="habit-legend-label">Today's date</span>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="habit-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="habit-tooltip-date">
            {(() => {
              const { year, monthIndex, day } = parseDateParts(tooltip.day.date);
              const isTodayCell = tooltip.day.date === today;
              const dateText = new Date(year, monthIndex, day).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              });
              return isTodayCell ? `Today · ${dateText}` : dateText;
            })()}
          </div>
          <div className="habit-tooltip-activity">
            {getLevelLabel(tooltip.day)}
          </div>
        </div>
      )}
    </div>
  );
}
