import { useState, useEffect, useCallback } from 'react';
import { habitsRepo, type Habit, type HabitLog } from '../db/habitsRepo';
import { toDateString } from '../utils/dateHelpers';

export interface HabitWithStatus extends Habit {
  completed: boolean;
  currentCount: number;
  streak: number;
  history: { date: string; completed: boolean; currentCount: number }[];
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<Record<string, { date: string; completed: boolean; currentCount: number }[]>>({});
  const [loading, setLoading] = useState(true);

  const today = toDateString(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    const [allHabits, todayLogs] = await Promise.all([
      habitsRepo.getAll(),
      habitsRepo.getLogsForDate(today),
    ]);

    setHabits(allHabits);
    setLogs(todayLogs);

    // Load streaks and 7-day history for all active habits
    const streakMap: Record<string, number> = {};
    const historyMap: Record<string, { date: string; completed: boolean; currentCount: number }[]> = {};

    await Promise.all(
      allHabits.map(async (h) => {
        const [s, hist] = await Promise.all([
          habitsRepo.getHabitStreak(h.id),
          habitsRepo.getRecentHistory(h.id, 7),
        ]);
        streakMap[h.id] = s;
        historyMap[h.id] = hist;
      })
    );

    setStreaks(streakMap);
    setHistory(historyMap);
    setLoading(false);
  }, [today]);

  useEffect(() => {
    load();
  }, [load]);

  const logMap = new Map(logs.map((l) => [l.habitId, l]));

  const enrichedHabits: HabitWithStatus[] = habits.map((h) => {
    const log = logMap.get(h.id);
    return {
      ...h,
      completed: log ? log.completed : false,
      currentCount: log ? log.currentCount : 0,
      streak: streaks[h.id] ?? 0,
      history: history[h.id] ?? [],
    };
  });

  const dayOfWeek = new Date().getDay();
  const todayHabits = enrichedHabits.filter(
    (h) => h.isActive && h.repeatDays.includes(dayOfWeek)
  );

  const completedTodayCount = todayHabits.filter((h) => h.completed).length;
  const progressPercent = todayHabits.length > 0
    ? Math.round((completedTodayCount / todayHabits.length) * 100)
    : 0;

  const bestStreak = Math.max(0, ...Object.values(streaks));

  // ----------------------------------------------------
  // Actions
  // ----------------------------------------------------
  const toggleHabit = useCallback(
    async (id: string) => {
      const habit = habits.find((h) => h.id === id);
      if (!habit) return;

      if (habit.targetType === 'boolean') {
        await habitsRepo.toggleBooleanHabit(id, today);
      } else {
        const log = logMap.get(id);
        const isDone = log ? log.completed : false;
        if (isDone) {
          // Reset
          await habitsRepo.updateCountHabit(id, today, -habit.targetCount);
        } else {
          // Mark fully complete
          const current = log ? log.currentCount : 0;
          await habitsRepo.updateCountHabit(id, today, habit.targetCount - current);
        }
      }

      await load();
    },
    [habits, logMap, today, load]
  );

  const incrementCount = useCallback(
    async (id: string, delta: number) => {
      await habitsRepo.updateCountHabit(id, today, delta);
      await load();
    },
    [today, load]
  );

  const createHabit = useCallback(
    async (data: Omit<Habit, 'id' | 'createdAt'>) => {
      const created = await habitsRepo.create(data);
      await load();
      return created;
    },
    [load]
  );

  const updateHabit = useCallback(
    async (id: string, data: Partial<Omit<Habit, 'id' | 'createdAt'>>) => {
      await habitsRepo.update(id, data);
      await load();
    },
    [load]
  );

  const deleteHabit = useCallback(
    async (id: string) => {
      await habitsRepo.delete(id);
      await load();
    },
    [load]
  );

  const toggleActive = useCallback(
    async (id: string) => {
      await habitsRepo.toggleActive(id);
      await load();
    },
    [load]
  );

  return {
    habits: enrichedHabits,
    todayHabits,
    completedTodayCount,
    totalTodayCount: todayHabits.length,
    progressPercent,
    bestStreak,
    loading,
    toggleHabit,
    incrementCount,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleActive,
    reload: load,
  };
}
