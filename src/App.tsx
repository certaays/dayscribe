import { createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { JournalPage } from './pages/JournalPage';
import { EditorPage } from './pages/EditorPage';
import { HabitsPage } from './pages/HabitsPage';
import { RemindersPage } from './pages/RemindersPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthProvider } from './contexts/AuthContext';
import { AuthModal } from './components/auth/AuthModal';
import { useTheme } from './hooks/useTheme';
import type { Theme, CustomThemeColors, FontSizeScale } from './db/database';

// Theme context so any component can read / update theme and typography
interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  customColors: CustomThemeColors;
  setCustomColors: (colors: CustomThemeColors) => void;
  fontSerif: string;
  setFontSerif: (f: string) => void;
  fontHand: string;
  setFontHand: (f: string) => void;
  fontUi: string;
  setFontUi: (f: string) => void;
  fontSizeScale: FontSizeScale;
  setFontSizeScale: (s: FontSizeScale) => void;
  resetAppearance: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
  setTheme: () => {},
  customColors: {} as CustomThemeColors,
  setCustomColors: () => {},
  fontSerif: 'Libre Baskerville',
  setFontSerif: () => {},
  fontHand: 'Kalam',
  setFontHand: () => {},
  fontUi: 'DM Sans',
  setFontUi: () => {},
  fontSizeScale: 'normal',
  setFontSizeScale: () => {},
  resetAppearance: () => {},
});

export const useAppTheme = () => useContext(ThemeContext);

export default function App() {
  const themeState = useTheme();

  return (
    <ThemeContext.Provider value={themeState}>
      <AuthProvider>
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
          <AuthModal />
        </BrowserRouter>
      </AuthProvider>
    </ThemeContext.Provider>
  );
}
