import Dexie, { type Table } from 'dexie';

/* ============================================================
   DayScribe — IndexedDB Database Schema (via Dexie.js)
   ============================================================ */

export interface JournalEntry {
  id: string;
  date: string;       // "YYYY-MM-DD"
  title?: string;
  content: string;
  mood: string;       // emoji
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Reminder {
  id: string;
  label: string;
  time: string;           // "HH:mm"
  repeatDays: number[];   // 0=Sun … 6=Sat
  isActive: boolean;
  notifyEnabled: boolean;
  createdAt: Date;
}

export interface ReminderLog {
  id: string;
  reminderId: string;
  date: string;       // "YYYY-MM-DD"
  completedAt: Date;
}

export type Theme = 'dark' | 'light';

export interface Habit {
  id: string;
  title: string;
  emoji: string;
  category: 'Health' | 'Mind' | 'Growth' | 'Productivity' | 'Other';
  targetType: 'boolean' | 'count'; // boolean check or counter (e.g., 8 glasses)
  targetCount: number;             // e.g. 1 for boolean, 8 for glasses
  unit?: string;                   // 'glasses', 'pages', 'mins', etc.
  repeatDays: number[];            // 0=Sun … 6=Sat
  isActive: boolean;
  createdAt: Date;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;                    // "YYYY-MM-DD"
  completed: boolean;
  currentCount: number;            // count completed on that day
  completedAt: Date;
}

export interface AppSettings {
  id: 1;             // singleton
  displayName: string;
  notificationsEnabled: boolean;
  theme: Theme;
}

class DayScribeDatabase extends Dexie {
  journal_entries!: Table<JournalEntry>;
  reminders!: Table<Reminder>;
  reminder_logs!: Table<ReminderLog>;
  habits!: Table<Habit>;
  habit_logs!: Table<HabitLog>;
  app_settings!: Table<AppSettings>;

  constructor() {
    super('dayscribe_db');
    this.version(1).stores({
      journal_entries: 'id, date, mood, createdAt',
      reminders:       'id, time, isActive',
      reminder_logs:   'id, reminderId, date',
      app_settings:    'id',
    });
    // Version 2: theme now supports 'light' | 'dark'
    this.version(2).stores({
      journal_entries: 'id, date, mood, createdAt',
      reminders:       'id, time, isActive',
      reminder_logs:   'id, reminderId, date',
      app_settings:    'id',
    });
    // Version 3: habit tracker tables
    this.version(3).stores({
      journal_entries: 'id, date, mood, createdAt',
      reminders:       'id, time, isActive',
      reminder_logs:   'id, reminderId, date',
      app_settings:    'id',
      habits:          'id, category, isActive, createdAt',
      habit_logs:      'id, habitId, date, [habitId+date]',
    });
  }
}

export const db = new DayScribeDatabase();

// Seed default settings if not present
db.app_settings.get(1).then((settings) => {
  if (!settings) {
    db.app_settings.put({
      id: 1,
      displayName: 'Friend',
      notificationsEnabled: false,
      theme: 'dark',
    });
  }
});

// Seed default starter habits if none present
db.habits.count().then(async (count) => {
  if (count === 0) {
    const defaultHabits: Habit[] = [
      {
        id: 'habit-water',
        title: 'Drink 8 Glasses of Water',
        emoji: '💧',
        category: 'Health',
        targetType: 'count',
        targetCount: 8,
        unit: 'glasses',
        repeatDays: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 'habit-reading',
        title: 'Read a Book or Journal',
        emoji: '📖',
        category: 'Growth',
        targetType: 'count',
        targetCount: 15,
        unit: 'mins',
        repeatDays: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 'habit-mindfulness',
        title: 'Morning Mindfulness & Stretch',
        emoji: '🧘',
        category: 'Mind',
        targetType: 'boolean',
        targetCount: 1,
        repeatDays: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: 'habit-walk',
        title: 'Outdoor Walk or Sunlight',
        emoji: '🚶',
        category: 'Health',
        targetType: 'boolean',
        targetCount: 1,
        repeatDays: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
        createdAt: new Date(),
      },
    ];
    await db.habits.bulkAdd(defaultHabits);
  }
});
