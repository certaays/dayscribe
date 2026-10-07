import { useState, useEffect, useCallback, useMemo } from 'react';
import { habitsRepo, type Habit, type HabitLog } from '../db/habitsRepo';
import { toDateString } from '../utils/dateHelpers';

export interface HabitWithStatus extends Habit {
  completed: boolean;
  currentCount: number;
  streak: number;
  history: { date: string; completed: boolean; currentCount: number }[];
  missedYesterday: boolean; // Atomic Habits: "Never Miss Twice" indicator
  isTwoMinuteVersion?: boolean;
}

export interface IdentityVoteStat {
  identity: string;
  totalHabits: number;
  completedToday: number;
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [yesterdayLogs, setYesterdayLogs] = useState<HabitLog[]>([]);
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<Record<string, { date: string; completed: boolean; currentCount: number }[]>>({});
  const [loading, setLoading] = useState(true);

  const today = toDateString(new Date());

  // Yesterday date string and day of week
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = toDateString(yesterdayDate);
  const yesterdayDayOfWeek = yesterdayDate.getDay();

  const load = useCallback(async () => {
    setLoading(true);
    const [allHabits, todayLogs, yLogs] = await Promise.all([
      habitsRepo.getAll(),
      habitsRepo.getLogsForDate(today),
      habitsRepo.getLogsForDate(yesterday),
    ]);

    setHabits(allHabits);
    setLogs(todayLogs);
    setYesterdayLogs(yLogs);

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
  }, [today, yesterday]);

  useEffect(() => {
    load();

    const handleSync = () => {
      load();
    };

    window.addEventListener('dayscribe_sync_completed', handleSync);
    window.addEventListener('dayscribe_data_changed', handleSync);

    return () => {
      window.removeEventListener('dayscribe_sync_completed', handleSync);
      window.removeEventListener('dayscribe_data_changed', handleSync);
    };
  }, [load]);

  const logMap = new Map(logs.map((l) => [l.habitId, l]));
  const yesterdayLogMap = new Map(yesterdayLogs.map((l) => [l.habitId, l]));

  const enrichedHabits: HabitWithStatus[] = habits.map((h) => {
    const log = logMap.get(h.id);
    const yLog = yesterdayLogMap.get(h.id);

    // Never Miss Twice: Was it scheduled yesterday and not completed?
    const wasScheduledYesterday = h.repeatDays.includes(yesterdayDayOfWeek);
    const missedYesterday = wasScheduledYesterday && (!yLog || !yLog.completed);

    return {
      ...h,
      completed: log ? log.completed : false,
      currentCount: log ? log.currentCount : 0,
      streak: streaks[h.id] ?? 0,
      history: history[h.id] ?? [],
      missedYesterday,
      isTwoMinuteVersion: log?.isTwoMinuteVersion,
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

  // Identity votes aggregation (Atomic Habits Identity-Based Habits)
  const identityStats = useMemo(() => {
    const map = new Map<string, { total: number; done: number }>();
    for (const h of todayHabits) {
      const idName = h.identity?.trim() || 'Mindful Self';
      if (!map.has(idName)) {
        map.set(idName, { total: 0, done: 0 });
      }
      const entry = map.get(idName)!;
      entry.total++;
      if (h.completed) entry.done++;
    }

    const list: IdentityVoteStat[] = [];
    for (const [identity, data] of map.entries()) {
      list.push({
        identity,
        totalHabits: data.total,
        completedToday: data.done,
      });
    }
    return list;
  }, [todayHabits]);

  const totalIdentityVotesToday = completedTodayCount;

  // Habits at risk of "Missing Twice" (missed yesterday & not yet done today)
  const neverMissTwiceHabits = useMemo(() => {
    return todayHabits.filter((h) => h.missedYesterday && !h.completed);
  }, [todayHabits]);

  // ----------------------------------------------------
  // Actions
  // ----------------------------------------------------
  const toggleHabit = useCallback(
    async (id: string, isTwoMinute = false) => {
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

      if (isTwoMinute) {
        // Tag log with isTwoMinuteVersion
        const currentLog = await habitsRepo.getLog(id, today);
        if (currentLog) {
          await habitsRepo.update(id, {});
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
    identityStats,
    totalIdentityVotesToday,
    neverMissTwiceHabits,
    toggleHabit,
    incrementCount,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleActive,
    reload: load,
  };
}

