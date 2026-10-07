import { v4 as uuidv4 } from 'uuid';
import { db, type Reminder, type ReminderLog } from './database';

function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dayscribe_data_changed'));
  }
}

export const remindersRepo = {
  async getAll(): Promise<Reminder[]> {
    return db.reminders.orderBy('time').toArray();
  },

  async getById(id: string): Promise<Reminder | undefined> {
    return db.reminders.get(id);
  },

  async create(data: Omit<Reminder, 'id' | 'createdAt'>): Promise<Reminder> {
    const reminder: Reminder = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
    };
    await db.reminders.add(reminder);
    notifyChange();
    return reminder;
  },

  async update(id: string, data: Partial<Omit<Reminder, 'id' | 'createdAt'>>): Promise<void> {
    await db.reminders.update(id, data);
    notifyChange();
  },

  async delete(id: string): Promise<void> {
    await db.reminders.delete(id);
    notifyChange();
  },

  async toggleActive(id: string): Promise<void> {
    const reminder = await db.reminders.get(id);
    if (reminder) {
      await db.reminders.update(id, { isActive: !reminder.isActive });
      notifyChange();
    }
  },

  // Logs
  async logCompletion(reminderId: string, date: string): Promise<void> {
    const existing = await db.reminder_logs
      .where('reminderId').equals(reminderId)
      .and((log) => log.date === date)
      .first();
    if (!existing) {
      const log: ReminderLog = {
        id: uuidv4(),
        reminderId,
        date,
        completed: true,
        completedAt: new Date(),
      };
      await db.reminder_logs.add(log);
      notifyChange();
    }
  },

  async removeCompletion(reminderId: string, date: string): Promise<void> {
    const existing = await db.reminder_logs
      .where('reminderId').equals(reminderId)
      .and((log) => log.date === date)
      .first();
    if (existing) {
      await db.reminder_logs.update(existing.id, {
        completed: false,
        completedAt: new Date(),
      });
    }
    notifyChange();
  },

  async getCompletedForDate(date: string): Promise<string[]> {
    const logs = await db.reminder_logs.where('date').equals(date).toArray();
    return logs.filter(l => l.completed !== false).map((l) => l.reminderId);
  },

  async getStreak(): Promise<number> {
    let streak = 0;
    const today = new Date();
    const allReminders = await db.reminders.toArray().then((r) => r.filter((x) => x.isActive));
    if (allReminders.length === 0) return 0;

    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();

      const applicableReminders = allReminders.filter((r) =>
        r.repeatDays.includes(dayOfWeek)
      );
      if (applicableReminders.length === 0) continue;

      const completedIds = await remindersRepo.getCompletedForDate(dateStr);
      const allDone = applicableReminders.every((r) => completedIds.includes(r.id));

      if (allDone) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  },
};
