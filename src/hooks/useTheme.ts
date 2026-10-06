import { useState, useEffect, useCallback } from 'react';
import { db, type Theme, type CustomThemeColors, type FontSizeScale } from '../db/database';
import {
  applyAppearanceSettings,
  DEFAULT_CUSTOM_COLORS,
  preloadCommonFonts,
} from '../styles/themeEngine';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [customColors, setCustomColorsState] = useState<CustomThemeColors>(DEFAULT_CUSTOM_COLORS);
  const [fontSerif, setFontSerifState] = useState<string>('Libre Baskerville');
  const [fontHand, setFontHandState] = useState<string>('Kalam');
  const [fontUi, setFontUiState] = useState<string>('DM Sans');
  const [fontSizeScale, setFontSizeScaleState] = useState<FontSizeScale>('normal');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted theme & appearance on mount
  useEffect(() => {
    preloadCommonFonts();

    db.app_settings.get(1).then((settings) => {
      const savedTheme = (settings?.theme as Theme) ?? 'dark';
      const savedCustom = settings?.customThemeColors ?? DEFAULT_CUSTOM_COLORS;
      const savedSerif = settings?.fontSerif ?? 'Libre Baskerville';
      const savedHand = settings?.fontHand ?? 'Kalam';
      const savedUi = settings?.fontUi ?? 'DM Sans';
      const savedScale = settings?.fontSizeScale ?? 'normal';

      setThemeState(savedTheme);
      setCustomColorsState(savedCustom);
      setFontSerifState(savedSerif);
      setFontHandState(savedHand);
      setFontUiState(savedUi);
      setFontSizeScaleState(savedScale);
      setIsLoaded(true);

      applyAppearanceSettings({
        theme: savedTheme,
        customColors: savedCustom,
        fontSerif: savedSerif,
        fontHand: savedHand,
        fontUi: savedUi,
        fontSizeScale: savedScale,
      });
    });
  }, []);

  const setTheme = useCallback(async (next: Theme) => {
    setThemeState(next);
    applyAppearanceSettings({
      theme: next,
      customColors,
      fontSerif,
      fontHand,
      fontUi,
      fontSizeScale,
    });
    await db.app_settings.update(1, { theme: next });
  }, [customColors, fontSerif, fontHand, fontUi, fontSizeScale]);

  const setCustomColors = useCallback(async (colors: CustomThemeColors) => {
    setCustomColorsState(colors);
    applyAppearanceSettings({
      theme,
      customColors: colors,
      fontSerif,
      fontHand,
      fontUi,
      fontSizeScale,
    });
    await db.app_settings.update(1, { customThemeColors: colors });
  }, [theme, fontSerif, fontHand, fontUi, fontSizeScale]);

  const setFontSerif = useCallback(async (serif: string) => {
    setFontSerifState(serif);
    applyAppearanceSettings({
      theme,
      customColors,
      fontSerif: serif,
      fontHand,
      fontUi,
      fontSizeScale,
    });
    await db.app_settings.update(1, { fontSerif: serif });
  }, [theme, customColors, fontHand, fontUi, fontSizeScale]);

  const setFontHand = useCallback(async (hand: string) => {
    setFontHandState(hand);
    applyAppearanceSettings({
      theme,
      customColors,
      fontSerif,
      fontHand: hand,
      fontUi,
      fontSizeScale,
    });
    await db.app_settings.update(1, { fontHand: hand });
  }, [theme, customColors, fontSerif, fontUi, fontSizeScale]);

  const setFontUi = useCallback(async (ui: string) => {
    setFontUiState(ui);
    applyAppearanceSettings({
      theme,
      customColors,
      fontSerif,
      fontHand,
      fontUi: ui,
      fontSizeScale,
    });
    await db.app_settings.update(1, { fontUi: ui });
  }, [theme, customColors, fontSerif, fontHand, fontSizeScale]);

  const setFontSizeScale = useCallback(async (scale: FontSizeScale) => {
    setFontSizeScaleState(scale);
    applyAppearanceSettings({
      theme,
      customColors,
      fontSerif,
      fontHand,
      fontUi,
      fontSizeScale: scale,
    });
    await db.app_settings.update(1, { fontSizeScale: scale });
  }, [theme, customColors, fontSerif, fontHand, fontUi]);

  const toggleTheme = useCallback(async () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    await setTheme(next);
  }, [theme, setTheme]);

  const resetAppearance = useCallback(async () => {
    const defaultTheme: Theme = 'dark';
    const defaultCustom = DEFAULT_CUSTOM_COLORS;
    const defaultSerif = 'Libre Baskerville';
    const defaultHand = 'Kalam';
    const defaultUi = 'DM Sans';
    const defaultScale: FontSizeScale = 'normal';

    setThemeState(defaultTheme);
    setCustomColorsState(defaultCustom);
    setFontSerifState(defaultSerif);
    setFontHandState(defaultHand);
    setFontUiState(defaultUi);
    setFontSizeScaleState(defaultScale);

    applyAppearanceSettings({
      theme: defaultTheme,
      customColors: defaultCustom,
      fontSerif: defaultSerif,
      fontHand: defaultHand,
      fontUi: defaultUi,
      fontSizeScale: defaultScale,
    });

    await db.app_settings.update(1, {
      theme: defaultTheme,
      customThemeColors: defaultCustom,
      fontSerif: defaultSerif,
      fontHand: defaultHand,
      fontUi: defaultUi,
      fontSizeScale: defaultScale,
    });
  }, []);

  return {
    theme,
    setTheme,
    toggleTheme,
    customColors,
    setCustomColors,
    fontSerif,
    setFontSerif,
    fontHand,
    setFontHand,
    fontUi,
    setFontUi,
    fontSizeScale,
    setFontSizeScale,
    resetAppearance,
    isLoaded,
  };
}
