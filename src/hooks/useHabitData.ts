import { useState, useEffect } from 'react';
import { db } from '../db/database';
import { toDateString } from '../utils/dateHelpers';

export interface DayActivity {
  date: string;         // "YYYY-MM-DD"
  journaled: boolean;
  remindersTotal: number;
  remindersCompleted: number;
  habitsTotal: number;
  habitsCompleted: number;
  level: 0 | 1 | 2 | 3 | 4; // intensity: 0=none, 4=perfect
  isFuture: boolean;
}

/**
 * Loads activity data for the full calendar year (Jan 1 to Dec 31).
 * Returns an array ordered Jan 1 → Dec 31.
 */
export function useHabitData(year = new Date().getFullYear()) {
  const [data, setData] = useState<DayActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);

      const todayStr = toDateString(new Date());
      const result: DayActivity[] = [];

      // Pull journal entries, reminder logs, and habit logs in bulk
      const [allEntries, allRemLogs, allReminders, allHabitLogs, allHabits] = await Promise.all([
        db.journal_entries.toArray(),
        db.reminder_logs.toArray(),
        db.reminders.toArray(),
        db.habit_logs.toArray(),
        db.habits.toArray(),
      ]);

      const journaledDates = new Set(allEntries.map((e) => e.date));

      // Map: date → set of completed reminderIds
      const completedRemByDate = new Map<string, Set<string>>();
      for (const log of allRemLogs) {
        if (!completedRemByDate.has(log.date)) completedRemByDate.set(log.date, new Set());
        completedRemByDate.get(log.date)!.add(log.reminderId);
      }

      // Map: date → set of completed habitIds
      const completedHabitsByDate = new Map<string, Set<string>>();
      for (const log of allHabitLogs) {
        if (log.completed) {
          if (!completedHabitsByDate.has(log.date)) completedHabitsByDate.set(log.date, new Set());
          completedHabitsByDate.get(log.date)!.add(log.habitId);
        }
      }

      const activeReminders = allReminders.filter((r) => r.isActive);
      const activeHabits = allHabits.filter((h) => h.isActive);

      // Loop Jan 1 to Dec 31 of specified year
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = toDateString(d);
        const dayOfWeek = d.getDay();
        const isFuture = dateStr > todayStr;

        const journaled = journaledDates.has(dateStr);

        // Reminders for this day
        const applicableRem = activeReminders.filter((r) =>
          r.repeatDays.includes(dayOfWeek)
        );
        const remindersTotal = applicableRem.length;
        const doneRemSet = completedRemByDate.get(dateStr) ?? new Set<string>();
        const remindersCompleted = applicableRem.filter((r) => doneRemSet.has(r.id)).length;

        // Habits for this day
        const applicableHabits = activeHabits.filter((h) =>
          h.repeatDays.includes(dayOfWeek)
        );
        const habitsTotal = applicableHabits.length;
        const doneHabitSet = completedHabitsByDate.get(dateStr) ?? new Set<string>();
        const habitsCompleted = applicableHabits.filter((h) => doneHabitSet.has(h.id)).length;

        // Compute composite score for intensity
        let maxScore = 0;
        let earnedScore = 0;

        if (!isFuture) {
          // Journal contributes 2 points
          maxScore += 2;
          if (journaled) earnedScore += 2;

          // Habits contribute up to 3 points
          if (habitsTotal > 0) {
            maxScore += 3;
            earnedScore += (habitsCompleted / habitsTotal) * 3;
          }

          // Reminders contribute up to 1 point
          if (remindersTotal > 0) {
            maxScore += 1;
            earnedScore += (remindersCompleted / remindersTotal) * 1;
          }
        }

        const ratio = maxScore > 0 ? earnedScore / maxScore : 0;

        let level: 0 | 1 | 2 | 3 | 4 = 0;
        if (!isFuture) {
          if (ratio >= 0.85 && (journaled || habitsCompleted === habitsTotal)) {
            level = 4; // Perfect / near perfect
          } else if (ratio >= 0.6) {
            level = 3;
          } else if (ratio >= 0.3) {
            level = 2;
          } else if (ratio > 0) {
            level = 1;
          }
        }

        result.push({
          date: dateStr,
          journaled,
          remindersTotal,
          remindersCompleted,
          habitsTotal,
          habitsCompleted,
          level,
          isFuture,
        });
      }

      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [year]);

  return { data, loading, year };
}
