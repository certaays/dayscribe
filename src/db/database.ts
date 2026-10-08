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
  isDeleted?: boolean;
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
  isDeleted?: boolean;
  createdAt: Date;
}

export interface ReminderLog {
  id: string;
  reminderId: string;
  date: string;       // "YYYY-MM-DD"
  completed?: boolean;
  completedAt: Date;
}

export type Theme = 'dark' | 'light' | 'matcha' | 'twilight' | 'espresso' | 'rose' | 'onyx' | 'custom';

export interface CustomThemeColors {
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;
  border: string;
  borderSoft: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  amber: string;
  amberGlow: string;
  amberDim: string;
  isDark: boolean;
}

export type FontSizeScale = 'compact' | 'normal' | 'large';

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
  // Atomic Habits (James Clear) Blueprint Fields
  identity?: string;               // e.g., "Mindful Reader", "Healthy & Energized Person"
  stackTrigger?: string;           // e.g., "After I pour my morning tea ☕"
  stackAfterHabitId?: string;      // ID of habit this stacks upon
  twoMinuteRule?: string;          // e.g., "Read 1 single page", "Do 2 deep breaths"
  isDeleted?: boolean;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;                    // "YYYY-MM-DD"
  completed: boolean;
  currentCount: number;            // count completed on that day
  completedAt: Date;
  isTwoMinuteVersion?: boolean;    // recorded via micro 2-minute rule
}

export interface AppSettings {
  id: 1;             // singleton
  displayName: string;
  notificationsEnabled: boolean;
  theme: Theme;
  customThemeColors?: CustomThemeColors;
  fontSerif?: string;
  fontHand?: string;
  fontUi?: string;
  fontSizeScale?: FontSizeScale;
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
    // Version 4: Atomic Habits blueprint indexing
    this.version(4).stores({
      journal_entries: 'id, date, mood, createdAt',
      reminders:       'id, time, isActive',
      reminder_logs:   'id, reminderId, date',
      app_settings:    'id',
      habits:          'id, category, identity, isActive, createdAt',
      habit_logs:      'id, habitId, date, [habitId+date]',
    });
    // Version 5: Custom theme palettes and typography settings
    this.version(5).stores({
      journal_entries: 'id, date, mood, createdAt',
      reminders:       'id, time, isActive',
      reminder_logs:   'id, reminderId, date',
      app_settings:    'id',
      habits:          'id, category, identity, isActive, createdAt',
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
      fontSerif: 'Libre Baskerville',
      fontHand: 'Kalam',
      fontUi: 'DM Sans',
      fontSizeScale: 'normal',
    });
  }
});

// Seed default starter habits with Atomic Habits attributes
db.habits.count().then(async (count) => {
  if (count === 0) {
    const defaultHabits: Habit[] = [
      {
        id: 'habit-water',
        title: 'Drink 8 Glasses of Water',
        emoji: 'water',
        category: 'Health',
        targetType: 'count',
        targetCount: 8,
        unit: 'glasses',
        repeatDays: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
        identity: 'Healthy & Energized Person',
        stackTrigger: 'After I wake up and stretch',
        twoMinuteRule: 'Drink 1 fresh glass of water immediately',
        createdAt: new Date(),
      },
      {
        id: 'habit-reading',
        title: 'Read a Book or Reflect',
        emoji: 'reading',
        category: 'Growth',
        targetType: 'count',
        targetCount: 15,
        unit: 'mins',
        repeatDays: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
        identity: 'Lifelong Learner',
        stackTrigger: 'After drinking my morning tea / coffee ☕',
        twoMinuteRule: 'Read 1 single page or paragraph',
        createdAt: new Date(),
      },
      {
        id: 'habit-mindfulness',
        title: 'Morning Mindfulness & Stretch',
        emoji: 'mindfulness',
        category: 'Mind',
        targetType: 'boolean',
        targetCount: 1,
        repeatDays: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
        identity: 'Calm & Grounded Thinker',
        stackTrigger: 'After getting out of bed',
        twoMinuteRule: 'Take 3 slow, deep conscious breaths',
        createdAt: new Date(),
      },
      {
        id: 'habit-walk',
        title: 'Outdoor Walk or Sunlight',
        emoji: 'walk',
        category: 'Health',
        targetType: 'boolean',
        targetCount: 1,
        repeatDays: [0, 1, 2, 3, 4, 5, 6],
        isActive: true,
        identity: 'Active & Mindful Walker',
        stackTrigger: 'After finishing afternoon work',
        twoMinuteRule: 'Step outside into the fresh air for 2 minutes',
        createdAt: new Date(),
      },
    ];
    await db.habits.bulkAdd(defaultHabits);
  }
});
