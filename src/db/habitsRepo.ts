import { v4 as uuidv4 } from 'uuid';
import { db, type Habit, type HabitLog } from './database';
import { toDateString } from '../utils/dateHelpers';

export type { Habit, HabitLog };

export const habitsRepo = {
  async getAll(): Promise<Habit[]> {
    return db.habits.toArray();
  },

  async getActive(): Promise<Habit[]> {
    return db.habits.filter((h) => h.isActive).toArray();
  },

  async getById(id: string): Promise<Habit | undefined> {
    return db.habits.get(id);
  },

  async create(data: Omit<Habit, 'id' | 'createdAt'>): Promise<Habit> {
    const habit: Habit = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
    };
    await db.habits.add(habit);
    return habit;
  },

  async update(id: string, data: Partial<Omit<Habit, 'id' | 'createdAt'>>): Promise<void> {
    await db.habits.update(id, data);
  },

  async delete(id: string): Promise<void> {
    await db.transaction('rw', db.habits, db.habit_logs, async () => {
      await db.habits.delete(id);
      await db.habit_logs.where('habitId').equals(id).delete();
    });
  },

  async toggleActive(id: string): Promise<void> {
    const habit = await db.habits.get(id);
    if (habit) {
      await db.habits.update(id, { isActive: !habit.isActive });
    }
  },

  // ----------------------------------------------------
  // Habit Logs & Progress
  // ----------------------------------------------------
  async getLogsForDate(dateStr: string): Promise<HabitLog[]> {
    return db.habit_logs.where('date').equals(dateStr).toArray();
  },

  async getLog(habitId: string, dateStr: string): Promise<HabitLog | undefined> {
    return db.habit_logs
      .where('habitId').equals(habitId)
      .and((log) => log.date === dateStr)
      .first();
  },

  async toggleBooleanHabit(habitId: string, dateStr: string): Promise<void> {
    const habit = await db.habits.get(habitId);
    if (!habit) return;

    const existing = await habitsRepo.getLog(habitId, dateStr);
    if (existing && existing.completed) {
      // Toggle off
      await db.habit_logs.delete(existing.id);
    } else if (existing) {
      // Toggle on
      await db.habit_logs.update(existing.id, {
        completed: true,
        currentCount: habit.targetCount || 1,
        completedAt: new Date(),
      });
    } else {
      // Create new completed log
      const log: HabitLog = {
        id: uuidv4(),
        habitId,
        date: dateStr,
        completed: true,
        currentCount: habit.targetCount || 1,
        completedAt: new Date(),
      };
      await db.habit_logs.add(log);
    }
  },

  async updateCountHabit(habitId: string, dateStr: string, delta: number): Promise<number> {
    const habit = await db.habits.get(habitId);
    if (!habit) return 0;

    const existing = await habitsRepo.getLog(habitId, dateStr);
    const current = existing ? existing.currentCount : 0;
    const nextCount = Math.max(0, current + delta);
    const isCompleted = nextCount >= habit.targetCount;

    if (existing) {
      if (nextCount === 0) {
        await db.habit_logs.delete(existing.id);
      } else {
        await db.habit_logs.update(existing.id, {
          currentCount: nextCount,
          completed: isCompleted,
          completedAt: new Date(),
        });
      }
    } else if (nextCount > 0) {
      const log: HabitLog = {
        id: uuidv4(),
        habitId,
        date: dateStr,
        completed: isCompleted,
        currentCount: nextCount,
        completedAt: new Date(),
      };
      await db.habit_logs.add(log);
    }

    return nextCount;
  },

  // ----------------------------------------------------
  // Streak Calculation
  // ----------------------------------------------------
  async getHabitStreak(habitId: string): Promise<number> {
    const habit = await db.habits.get(habitId);
    if (!habit) return 0;

    const allLogs = await db.habit_logs.where('habitId').equals(habitId).toArray();
    const logByDate = new Map(allLogs.map((l) => [l.date, l]));

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = toDateString(d);
      const dayOfWeek = d.getDay();

      // Check if habit is scheduled for this day
      if (!habit.repeatDays.includes(dayOfWeek)) {
        continue;
      }

      const log = logByDate.get(dateStr);
      const isDone = log ? log.completed : false;

      if (isDone) {
        streak++;
      } else if (i === 0) {
        // If today is not done yet, don't break streak from yesterday
        continue;
      } else {
        break;
      }
    }

    return streak;
  },

  async getRecentHistory(habitId: string, days = 7): Promise<{ date: string; completed: boolean; currentCount: number }[]> {
    const today = new Date();
    const allLogs = await db.habit_logs.where('habitId').equals(habitId).toArray();
    const logByDate = new Map(allLogs.map((l) => [l.date, l]));

    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = toDateString(d);
      const log = logByDate.get(dateStr);
      result.push({
        date: dateStr,
        completed: log ? log.completed : false,
        currentCount: log ? log.currentCount : 0,
      });
    }
    return result;
  },
};
