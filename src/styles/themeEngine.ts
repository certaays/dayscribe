export type ThemePreset =
  | 'dark'
  | 'light'
  | 'matcha'
  | 'twilight'
  | 'espresso'
  | 'rose'
  | 'onyx'
  | 'custom';

export type Theme = ThemePreset;

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

export interface ThemeMeta {
  id: ThemePreset;
  name: string;
  description: string;
  previewBg: string;
  previewSurface: string;
  previewAccent: string;
  isDark: boolean;
  colors?: CustomThemeColors;
}

export const THEME_PRESETS: ThemeMeta[] = [
  {
    id: 'dark',
    name: 'Midnight Candle',
    description: 'Cozy dark amber candlelight',
    previewBg: '#100e0b',
    previewSurface: '#1a1612',
    previewAccent: '#c8843a',
    isDark: true,
  },
  {
    id: 'light',
    name: 'Clean Parchment',
    description: 'Bright warm paper aesthetic',
    previewBg: '#faf7f2',
    previewSurface: '#ffffff',
    previewAccent: '#b06820',
    isDark: false,
  },
  {
    id: 'matcha',
    name: 'Matcha Sanctuary',
    description: 'Botanical sage & calming olive tones',
    previewBg: '#0e1411',
    previewSurface: '#161e1a',
    previewAccent: '#68a67d',
    isDark: true,
  },
  {
    id: 'twilight',
    name: 'Nordic Twilight',
    description: 'Deep starlight indigo & sapphire',
    previewBg: '#0d111a',
    previewSurface: '#141926',
    previewAccent: '#6366f1',
    isDark: true,
  },
  {
    id: 'espresso',
    name: 'Espresso Roast',
    description: 'Rich warm cocoa & roasted caramel',
    previewBg: '#140f0c',
    previewSurface: '#1e1713',
    previewAccent: '#d97706',
    isDark: true,
  },
  {
    id: 'rose',
    name: 'Rose Velvet',
    description: 'Soft muted burgundy & blush',
    previewBg: '#150d12',
    previewSurface: '#20141b',
    previewAccent: '#e11d48',
    isDark: true,
  },
  {
    id: 'onyx',
    name: 'Onyx Minimal',
    description: 'Pitch-black AMOLED & sleek gold',
    previewBg: '#000000',
    previewSurface: '#0d0d0d',
    previewAccent: '#eab308',
    isDark: true,
  },
  {
    id: 'custom',
    name: 'Custom Theme',
    description: 'Create your own personalized palette',
    previewBg: '#181824',
    previewSurface: '#232336',
    previewAccent: '#ec4899',
    isDark: true,
  },
];

export const DEFAULT_CUSTOM_COLORS: CustomThemeColors = {
  bg: '#12131c',
  surface: '#1b1d2a',
  surface2: '#232638',
  surface3: '#2d3148',
  border: '#393e5c',
  borderSoft: '#292d44',
  textPrimary: '#edf0f8',
  textSecondary: '#9aa3c4',
  textMuted: '#687299',
  amber: '#a855f7',
  amberGlow: '#c084fc',
  amberDim: '#7e22ce',
  isDark: true,
};

export interface FontOption {
  id: string;
  name: string;
  family: string;
  category: 'serif' | 'hand' | 'ui';
  googleFontName?: string;
  sampleText?: string;
}

export const SERIF_FONTS: FontOption[] = [
  { id: 'libre-baskerville', name: 'Libre Baskerville (Default)', family: "'Libre Baskerville', Georgia, serif", category: 'serif', googleFontName: 'Libre+Baskerville:ital,wght@0,400;0,700;1,400' },
  { id: 'playfair-display', name: 'Playfair Display', family: "'Playfair Display', Georgia, serif", category: 'serif', googleFontName: 'Playfair+Display:ital,wght@0,400..700;1,400..700' },
  { id: 'lora', name: 'Lora', family: "'Lora', Georgia, serif", category: 'serif', googleFontName: 'Lora:ital,wght@0,400..700;1,400..700' },
  { id: 'merriweather', name: 'Merriweather', family: "'Merriweather', Georgia, serif", category: 'serif', googleFontName: 'Merriweather:ital,wght@0,300;0,400;0,700;1,300' },
  { id: 'cinzel', name: 'Cinzel Classical', family: "'Cinzel', Georgia, serif", category: 'serif', googleFontName: 'Cinzel:wght@400;600;700' },
  { id: 'eb-garamond', name: 'EB Garamond', family: "'EB Garamond', Georgia, serif", category: 'serif', googleFontName: 'EB+Garamond:ital,wght@0,400..700;1,400..700' },
  { id: 'georgia', name: 'Georgia (System)', family: "Georgia, 'Times New Roman', serif", category: 'serif' },
];

export const HANDWRITING_FONTS: FontOption[] = [
  { id: 'kalam', name: 'Kalam (Default)', family: "'Kalam', cursive", category: 'hand', googleFontName: 'Kalam:wght@300;400;700' },
  { id: 'caveat', name: 'Caveat', family: "'Caveat', cursive", category: 'hand', googleFontName: 'Caveat:wght@400..700' },
  { id: 'patrick-hand', name: 'Patrick Hand', family: "'Patrick Hand', cursive", category: 'hand', googleFontName: 'Patrick+Hand' },
  { id: 'dancing-script', name: 'Dancing Script', family: "'Dancing Script', cursive", category: 'hand', googleFontName: 'Dancing+Script:wght@400..700' },
  { id: 'indie-flower', name: 'Indie Flower', family: "'Indie Flower', cursive", category: 'hand', googleFontName: 'Indie+Flower' },
  { id: 'marck-script', name: 'Marck Script', family: "'Marck Script', cursive", category: 'hand', googleFontName: 'Marck+Script' },
];

export const UI_FONTS: FontOption[] = [
  { id: 'dm-sans', name: 'DM Sans (Default)', family: "'DM Sans', system-ui, sans-serif", category: 'ui', googleFontName: 'DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,400' },
  { id: 'inter', name: 'Inter Clean', family: "'Inter', system-ui, sans-serif", category: 'ui', googleFontName: 'Inter:wght@300;400;500;600;700' },
  { id: 'outfit', name: 'Outfit Modern', family: "'Outfit', system-ui, sans-serif", category: 'ui', googleFontName: 'Outfit:wght@300;400;500;600;700' },
  { id: 'plus-jakarta', name: 'Plus Jakarta Sans', family: "'Plus Jakarta Sans', system-ui, sans-serif", category: 'ui', googleFontName: 'Plus+Jakarta+Sans:wght@300;400;500;600;700' },
  { id: 'nunito', name: 'Nunito Friendly', family: "'Nunito', system-ui, sans-serif", category: 'ui', googleFontName: 'Nunito:wght@300;400;600;700' },
  { id: 'system', name: 'System Default', family: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", category: 'ui' },
];

export type FontSizeScale = 'compact' | 'normal' | 'large';

export const FONT_SIZE_SCALES: { id: FontSizeScale; label: string; px: string; desc: string }[] = [
  { id: 'compact', label: 'Compact', px: '14px', desc: 'Dense and compact layout' },
  { id: 'normal', label: 'Standard', px: '16px', desc: 'Balanced default readability' },
  { id: 'large', label: 'Comfortable', px: '18px', desc: 'Relaxed reading experience' },
];

// Dynamically load Google Font families
const loadedGoogleFonts = new Set<string>();

export function loadGoogleFont(googleFontQuery: string) {
  if (!googleFontQuery || loadedGoogleFonts.has(googleFontQuery)) return;
  try {
    const linkId = `google-font-${googleFontQuery.replace(/[^a-zA-Z0-9]/g, '-')}`;
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${googleFontQuery}&display=swap`;
      document.head.appendChild(link);
    }
    loadedGoogleFonts.add(googleFontQuery);
  } catch (err) {
    console.warn('Failed to load dynamic font:', err);
  }
}

// Ensure preloading standard fonts
export function preloadCommonFonts() {
  const allFonts = [...SERIF_FONTS, ...HANDWRITING_FONTS, ...UI_FONTS];
  for (const font of allFonts) {
    if (font.googleFontName) {
      loadGoogleFont(font.googleFontName);
    }
  }
}

/**
 * Applies all appearance settings directly to the DOM in real-time
 */
export function applyAppearanceSettings({
  theme,
  customColors,
  fontSerif,
  fontHand,
  fontUi,
  fontSizeScale,
}: {
  theme: ThemePreset;
  customColors?: CustomThemeColors;
  fontSerif?: string;
  fontHand?: string;
  fontUi?: string;
  fontSizeScale?: FontSizeScale;
}) {
  const root = document.documentElement;

  // Set Theme attribute
  root.setAttribute('data-theme', theme);

  // Apply custom theme colors if 'custom' is active
  if (theme === 'custom' && customColors) {
    root.style.setProperty('--color-bg', customColors.bg);
    root.style.setProperty('--color-surface', customColors.surface);
    root.style.setProperty('--color-surface-2', customColors.surface2);
    root.style.setProperty('--color-surface-3', customColors.surface3);
    root.style.setProperty('--color-border', customColors.border);
    root.style.setProperty('--color-border-soft', customColors.borderSoft);
    root.style.setProperty('--color-text-primary', customColors.textPrimary);
    root.style.setProperty('--color-text-secondary', customColors.textSecondary);
    root.style.setProperty('--color-text-muted', customColors.textMuted);
    root.style.setProperty('--color-amber', customColors.amber);
    root.style.setProperty('--color-amber-glow', customColors.amberGlow);
    root.style.setProperty('--color-amber-dim', customColors.amberDim);
    root.style.setProperty('--color-amber-subtle', `${customColors.amber}18`);
    root.style.setProperty('--color-amber-muted', `${customColors.amber}25`);
    root.style.setProperty('color-scheme', customColors.isDark ? 'dark' : 'light');
  } else {
    // Clean up inline color styles to let CSS tokens take over
    root.style.removeProperty('--color-bg');
    root.style.removeProperty('--color-surface');
    root.style.removeProperty('--color-surface-2');
    root.style.removeProperty('--color-surface-3');
    root.style.removeProperty('--color-border');
    root.style.removeProperty('--color-border-soft');
    root.style.removeProperty('--color-text-primary');
    root.style.removeProperty('--color-text-secondary');
    root.style.removeProperty('--color-text-muted');
    root.style.removeProperty('--color-amber');
    root.style.removeProperty('--color-amber-glow');
    root.style.removeProperty('--color-amber-dim');
    root.style.removeProperty('--color-amber-subtle');
    root.style.removeProperty('--color-amber-muted');
    root.style.removeProperty('color-scheme');
  }

  // Apply Fonts
  if (fontSerif) {
    const fontObj = SERIF_FONTS.find((f) => f.id === fontSerif || f.name === fontSerif || f.family === fontSerif);
    if (fontObj?.googleFontName) loadGoogleFont(fontObj.googleFontName);
    root.style.setProperty('--font-serif', fontObj ? fontObj.family : fontSerif);
  } else {
    root.style.removeProperty('--font-serif');
  }

  if (fontHand) {
    const fontObj = HANDWRITING_FONTS.find((f) => f.id === fontHand || f.name === fontHand || f.family === fontHand);
    if (fontObj?.googleFontName) loadGoogleFont(fontObj.googleFontName);
    root.style.setProperty('--font-hand', fontObj ? fontObj.family : fontHand);
  } else {
    root.style.removeProperty('--font-hand');
  }

  if (fontUi) {
    const fontObj = UI_FONTS.find((f) => f.id === fontUi || f.name === fontUi || f.family === fontUi);
    if (fontObj?.googleFontName) loadGoogleFont(fontObj.googleFontName);
    root.style.setProperty('--font-ui', fontObj ? fontObj.family : fontUi);
  } else {
    root.style.removeProperty('--font-ui');
  }

  // Apply Font Size Scale
  const scale = fontSizeScale || 'normal';
  const scalePx = scale === 'compact' ? '14px' : scale === 'large' ? '18px' : '16px';
  root.style.fontSize = scalePx;
}
