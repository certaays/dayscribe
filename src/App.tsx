import { createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { JournalPage } from './pages/JournalPage';
import { EditorPage } from './pages/EditorPage';
import { HabitsPage } from './pages/HabitsPage';
import { RemindersPage } from './pages/RemindersPage';
import { SettingsPage } from './pages/SettingsPage';
import { useTheme } from './hooks/useTheme';
import type { Theme } from './db/database';

// Theme context so any component can read / toggle the theme
interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}
export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
});
export const useAppTheme = () => useContext(ThemeContext);

export default function App() {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="journal" element={<JournalPage />} />
            <Route path="editor/:id" element={<EditorPage />} />
            <Route path="habits" element={<HabitsPage />} />
            <Route path="reminders" element={<RemindersPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}
