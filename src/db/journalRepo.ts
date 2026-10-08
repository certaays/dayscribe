import { v4 as uuidv4 } from 'uuid';
import { db, type JournalEntry } from './database';
export type { JournalEntry };

function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dayscribe_data_changed'));
  }
}

export const journalRepo = {
  async getAll(): Promise<JournalEntry[]> {
    const entries = await db.journal_entries.orderBy('date').reverse().toArray();
    return entries.filter(e => !e.isDeleted);
  },

  async getByDate(date: string): Promise<JournalEntry | undefined> {
    return db.journal_entries.where('date').equals(date).first();
  },

  async getById(id: string): Promise<JournalEntry | undefined> {
    return db.journal_entries.get(id);
  },

  async getDatesWithEntries(): Promise<string[]> {
    const entries = await db.journal_entries.orderBy('date').toArray();
    return entries.map((e) => e.date);
  },

  async create(data: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<JournalEntry> {
    const entry: JournalEntry = {
      ...data,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.journal_entries.add(entry);
    notifyChange();
    return entry;
  },

  async update(id: string, data: Partial<Omit<JournalEntry, 'id' | 'createdAt'>>): Promise<void> {
    await db.journal_entries.update(id, { ...data, updatedAt: new Date() });
    notifyChange();
  },

  async delete(id: string): Promise<void> {
    await db.journal_entries.update(id, { isDeleted: true });
    notifyChange();
  },

  async getRecent(limit = 3): Promise<JournalEntry[]> {
    return db.journal_entries.orderBy('createdAt').reverse().limit(limit).toArray();
  },
};
