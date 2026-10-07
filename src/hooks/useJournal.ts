import { useState, useEffect, useCallback } from 'react';
import { journalRepo, type JournalEntry } from '../db/journalRepo';
import { toDateString } from '../utils/dateHelpers';

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = useCallback(async () => {
    const all = await journalRepo.getAll();
    setEntries(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEntries();

    const handleSync = () => {
      loadEntries();
    };

    window.addEventListener('dayscribe_sync_completed', handleSync);
    window.addEventListener('dayscribe_data_changed', handleSync);

    return () => {
      window.removeEventListener('dayscribe_sync_completed', handleSync);
      window.removeEventListener('dayscribe_data_changed', handleSync);
    };
  }, [loadEntries]);

  const createEntry = useCallback(
    async (data: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
      const entry = await journalRepo.create(data);
      setEntries((prev) => [entry, ...prev]);
      return entry;
    },
    []
  );

  const updateEntry = useCallback(
    async (id: string, data: Partial<Omit<JournalEntry, 'id' | 'createdAt'>>) => {
      await journalRepo.update(id, data);
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...data, updatedAt: new Date() } : e))
      );
    },
    []
  );

  const deleteEntry = useCallback(async (id: string) => {
    await journalRepo.delete(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const getTodayEntry = useCallback(() => {
    const today = toDateString(new Date());
    return entries.find((e) => e.date === today);
  }, [entries]);

  const getEntryByDate = useCallback(
    (date: string) => entries.find((e) => e.date === date),
    [entries]
  );

  return {
    entries,
    loading,
    createEntry,
    updateEntry,
    deleteEntry,
    getTodayEntry,
    getEntryByDate,
    reload: loadEntries,
  };
}
