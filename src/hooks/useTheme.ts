import { useState, useEffect, useCallback } from 'react';
import { db, type Theme } from '../db/database';

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark');

  // Load persisted theme on mount
  useEffect(() => {
    db.app_settings.get(1).then((settings) => {
      const saved = settings?.theme ?? 'dark';
      setThemeState(saved);
      applyTheme(saved);
    });
  }, []);

  const setTheme = useCallback(async (next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    await db.app_settings.update(1, { theme: next });
  }, []);

  const toggleTheme = useCallback(async () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    await setTheme(next);
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
}
