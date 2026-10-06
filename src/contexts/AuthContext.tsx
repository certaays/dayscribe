import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, type AuthUser, type SyncResult } from '../services/apiClient';
import { db } from '../db/database';

export type SyncState = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  syncState: SyncState;
  lastSyncedAt: Date | null;
  syncError: string | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  triggerSync: () => Promise<SyncResult | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const syncTimeoutRef = useRef<any>(null);

  // Synchronize local database with VPS database
  const triggerSync = useCallback(async (): Promise<SyncResult | null> => {
    if (!apiClient.isAuthenticated()) {
      return null;
    }

    if (!navigator.onLine) {
      setSyncState('offline');
      return null;
    }

    try {
      setSyncState('syncing');
      setSyncError(null);

      // Collect all local records to send
      const [localEntries, localHabits, localHabitLogs, localReminders, localReminderLogs, localSettings] =
        await Promise.all([
          db.journal_entries.toArray(),
          db.habits.toArray(),
          db.habit_logs.toArray(),
          db.reminders.toArray(),
          db.reminder_logs.toArray(),
          db.app_settings.get(1),
        ]);

      const payload = {
        journalEntries: localEntries,
        habits: localHabits,
        habitLogs: localHabitLogs,
        reminders: localReminders,
        reminderLogs: localReminderLogs,
        settings: localSettings,
      };

      const serverRes = await apiClient.bulkSync(payload);
      const serverData = (serverRes as any)?.data || serverRes;

      // Merge server response back into Dexie
      if (serverData?.journalEntries && Array.isArray(serverData.journalEntries)) {
        await db.journal_entries.bulkPut(
          serverData.journalEntries.map((e: any) => ({
            ...e,
            createdAt: new Date(e.createdAt),
            updatedAt: new Date(e.updatedAt),
          }))
        );
      }

      if (serverData?.habits && Array.isArray(serverData.habits)) {
        await db.habits.bulkPut(
          serverData.habits.map((h: any) => ({
            ...h,
            createdAt: new Date(h.createdAt),
          }))
        );
      }

      if (serverData?.habitLogs && Array.isArray(serverData.habitLogs)) {
        await db.habit_logs.bulkPut(
          serverData.habitLogs.map((l: any) => ({
            ...l,
            completedAt: new Date(l.completedAt),
          }))
        );
      }

      if (serverData?.reminders && Array.isArray(serverData.reminders)) {
        await db.reminders.bulkPut(
          serverData.reminders.map((r: any) => ({
            ...r,
            createdAt: new Date(r.createdAt),
          }))
        );
      }

      if (serverData?.reminderLogs && Array.isArray(serverData.reminderLogs)) {
        await db.reminder_logs.bulkPut(
          serverData.reminderLogs.map((rl: any) => ({
            ...rl,
            completedAt: new Date(rl.completedAt),
          }))
        );
      }

      if (serverData?.settings) {
        await db.app_settings.put({
          ...serverData.settings,
          id: 1,
        });
      }

      const syncTime = new Date((serverRes as any)?.syncedAt || Date.now());
      setLastSyncedAt(syncTime);
      setSyncState('synced');

      return serverData;
    } catch (err: any) {
      console.error('Account sync error:', err);
      setSyncState('error');
      setSyncError(err.message || 'Sync failed');
      return null;
    }
  }, []);

  // Check existing token on initial load
  useEffect(() => {
    async function initAuth() {
      if (apiClient.isAuthenticated()) {
        try {
          const profile = await apiClient.getProfile();
          setUser(profile.user);
          await triggerSync();
        } catch (err) {
          console.warn('Initial session check failed:', err);
          setUser(null);
        }
      }
      setIsLoading(false);
    }

    initAuth();

    const handleAuthExpired = () => {
      setUser(null);
      setSyncState('idle');
    };

    const handleOnline = () => {
      if (apiClient.isAuthenticated()) {
        triggerSync();
      }
    };

    // Auto-sync when data changes in repos
    const handleDataChanged = () => {
      if (apiClient.isAuthenticated()) {
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(() => {
          triggerSync();
        }, 800);
      }
    };

    window.addEventListener('dayscribe_auth_expired', handleAuthExpired);
    window.addEventListener('online', handleOnline);
    window.addEventListener('dayscribe_data_changed', handleDataChanged);

    return () => {
      window.removeEventListener('dayscribe_auth_expired', handleAuthExpired);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('dayscribe_data_changed', handleDataChanged);
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [triggerSync]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.login(email, password);
      setUser(res.user);
      setIsAuthModalOpen(false);
      // Clean local cache first so device B only receives user A's cloud data
      await Promise.all([
        db.journal_entries.clear(),
        db.habits.clear(),
        db.habit_logs.clear(),
        db.reminders.clear(),
        db.reminder_logs.clear(),
      ]);
      // Pull fresh data for this account from server
      await triggerSync();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      const res = await apiClient.register(email, password, name);
      setUser(res.user);
      setIsAuthModalOpen(false);
      // Push existing initial data to user's new account
      await triggerSync();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    apiClient.clearToken();
    setUser(null);
    setSyncState('idle');
    setLastSyncedAt(null);
    // Clear local data for clean logout
    try {
      await Promise.all([
        db.journal_entries.clear(),
        db.habits.clear(),
        db.habit_logs.clear(),
        db.reminders.clear(),
        db.reminder_logs.clear(),
      ]);
    } catch (e) {
      console.warn('Error clearing local cache on logout:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        syncState,
        lastSyncedAt,
        syncError,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        register,
        logout,
        triggerSync,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
