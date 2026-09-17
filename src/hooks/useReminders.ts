import { useState, useEffect, useCallback } from 'react';
import { remindersRepo } from '../db/remindersRepo';
import type { Reminder } from '../db/database';
import { toDateString } from '../utils/dateHelpers';

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const today = toDateString(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    const [all, done, s] = await Promise.all([
      remindersRepo.getAll(),
      remindersRepo.getCompletedForDate(today),
      remindersRepo.getStreak(),
    ]);
    setReminders(all);
    setCompletedIds(done);
    setStreak(s);
    setLoading(false);
  }, [today]);

  useEffect(() => {
    load();
  }, [load]);

  const createReminder = useCallback(
    async (data: Omit<Reminder, 'id' | 'createdAt'>) => {
      const r = await remindersRepo.create(data);
      setReminders((prev) => [...prev, r].sort((a, b) => a.time.localeCompare(b.time)));
      return r;
    },
    []
  );

  const updateReminder = useCallback(
    async (id: string, data: Partial<Omit<Reminder, 'id' | 'createdAt'>>) => {
      await remindersRepo.update(id, data);
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
    },
    []
  );

  const deleteReminder = useCallback(async (id: string) => {
    await remindersRepo.delete(id);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleActive = useCallback(async (id: string) => {
    await remindersRepo.toggleActive(id);
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  }, []);

  const toggleCompleted = useCallback(
    async (id: string) => {
      const isCompleted = completedIds.includes(id);
      if (isCompleted) {
        await remindersRepo.removeCompletion(id, today);
        setCompletedIds((prev) => prev.filter((cid) => cid !== id));
      } else {
        await remindersRepo.logCompletion(id, today);
        setCompletedIds((prev) => [...prev, id]);
      }
      const s = await remindersRepo.getStreak();
      setStreak(s);
    },
    [completedIds, today]
  );

  const todayReminders = reminders.filter((r) => {
    if (!r.isActive) return false;
    const day = new Date().getDay();
    return r.repeatDays.includes(day);
  });

  const completedCount = todayReminders.filter((r) => completedIds.includes(r.id)).length;
  const progress = todayReminders.length > 0 ? (completedCount / todayReminders.length) * 100 : 0;

  return {
    reminders,
    todayReminders,
    completedIds,
    completedCount,
    progress,
    streak,
    loading,
    createReminder,
    updateReminder,
    deleteReminder,
    toggleActive,
    toggleCompleted,
    reload: load,
  };
}
