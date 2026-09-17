import {
  Droplets,
  BookOpen,
  Heart,
  Footprints,
  Activity,
  Apple,
  Pill,
  PenTool,
  Target,
  Moon,
  Coffee,
  Palette,
  Music,
  Sparkles,
  Flame,
  Check,
  Plus,
  Minus,
  Trash2,
  Pencil,
  Settings,
  Bell,
  Calendar,
  CalendarCheck,
  List,
  Search,
  Download,
  Upload,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Home,
  BookMarked,
  Sun,
  CloudRain,
  Frown,
  Smile,
  Zap,
  Smartphone,
  Tag,
  X,
  type LucideProps,
} from 'lucide-react';

export {
  Droplets,
  BookOpen,
  Heart,
  Footprints,
  Activity,
  Apple,
  Pill,
  PenTool,
  Target,
  Moon,
  Coffee,
  Palette,
  Music,
  Sparkles,
  Flame,
  Check,
  Plus,
  Minus,
  Trash2,
  Pencil,
  Settings,
  Bell,
  Calendar,
  CalendarCheck,
  List,
  Search,
  Download,
  Upload,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Home,
  BookMarked,
  Sun,
  CloudRain,
  Frown,
  Smile,
  Zap,
  Smartphone,
  Tag,
  X,
};

// Preset habit icons for selection in Habit Modal
export const HABIT_ICON_PRESETS = [
  { id: 'water', label: 'Water', icon: Droplets, color: '#38bdf8' },
  { id: 'reading', label: 'Reading', icon: BookOpen, color: '#fbbf24' },
  { id: 'mindfulness', label: 'Meditation', icon: Heart, color: '#f43f5e' },
  { id: 'walk', label: 'Walking', icon: Footprints, color: '#34d399' },
  { id: 'fitness', label: 'Workout', icon: Activity, color: '#f97316' },
  { id: 'nutrition', label: 'Health / Food', icon: Apple, color: '#4ade80' },
  { id: 'medicine', label: 'Vitamins / Meds', icon: Pill, color: '#a78bfa' },
  { id: 'journal', label: 'Journaling', icon: PenTool, color: '#e8a84c' },
  { id: 'target', label: 'Goals', icon: Target, color: '#ef4444' },
  { id: 'sleep', label: 'Sleep', icon: Moon, color: '#818cf8' },
  { id: 'coffee', label: 'Coffee / Break', icon: Coffee, color: '#d97706' },
  { id: 'art', label: 'Creative / Art', icon: Palette, color: '#ec4899' },
  { id: 'music', label: 'Music', icon: Music, color: '#06b6d4' },
  { id: 'sparkles', label: 'Routine / Habit', icon: Sparkles, color: '#eab308' },
];

/**
 * HabitIcon renders a crisp SVG Lucide icon based on either emoji string or preset ID
 */
export function HabitIcon({
  icon,
  size = 18,
  className = '',
  color,
  ...props
}: {
  icon: string;
  size?: number;
  className?: string;
  color?: string;
} & LucideProps) {
  switch (icon) {
    case '💧':
    case 'water':
    case 'droplet':
      return <Droplets size={size} className={className} color={color || '#38bdf8'} {...props} />;
    case '📖':
    case 'reading':
    case 'book':
      return <BookOpen size={size} className={className} color={color || '#fbbf24'} {...props} />;
    case '🧘':
    case 'mindfulness':
    case 'meditation':
    case 'heart':
      return <Heart size={size} className={className} color={color || '#f43f5e'} {...props} />;
    case '🚶':
    case 'walk':
    case 'walking':
    case 'steps':
      return <Footprints size={size} className={className} color={color || '#34d399'} {...props} />;
    case '🏃':
    case 'fitness':
    case 'running':
    case 'workout':
      return <Activity size={size} className={className} color={color || '#f97316'} {...props} />;
    case '🥦':
    case '🍎':
    case 'nutrition':
    case 'food':
      return <Apple size={size} className={className} color={color || '#4ade80'} {...props} />;
    case '💊':
    case 'medicine':
    case 'vitamins':
      return <Pill size={size} className={className} color={color || '#a78bfa'} {...props} />;
    case '✍️':
    case 'journal':
    case 'writing':
      return <PenTool size={size} className={className} color={color || '#e8a84c'} {...props} />;
    case '🎯':
    case 'target':
    case 'goal':
      return <Target size={size} className={className} color={color || '#ef4444'} {...props} />;
    case '🌙':
    case 'sleep':
    case 'night':
      return <Moon size={size} className={className} color={color || '#818cf8'} {...props} />;
    case '☕':
    case 'coffee':
    case 'tea':
      return <Coffee size={size} className={className} color={color || '#d97706'} {...props} />;
    case '🎨':
    case 'art':
    case 'design':
      return <Palette size={size} className={className} color={color || '#ec4899'} {...props} />;
    case '🎸':
    case 'music':
      return <Music size={size} className={className} color={color || '#06b6d4'} {...props} />;
    case '🧹':
    case 'clean':
    case 'sparkles':
    case '✨':
      return <Sparkles size={size} className={className} color={color || '#eab308'} {...props} />;
    default:
      return <Sparkles size={size} className={className} color={color || 'var(--color-amber)'} {...props} />;
  }
}

/**
 * MoodIcon renders a modern SVG icon for moods
 */
export function MoodIcon({
  mood,
  size = 20,
  className = '',
}: {
  mood: string;
  size?: number;
  className?: string;
}) {
  switch (mood) {
    case '🤩':
    case 'excited':
      return <Sparkles size={size} className={className} color="var(--mood-excited, #f59e0b)" />;
    case '😊':
    case 'happy':
      return <Smile size={size} className={className} color="var(--mood-happy, #10b981)" />;
    case '😌':
    case 'calm':
      return <Heart size={size} className={className} color="var(--mood-calm, #38bdf8)" />;
    case '😴':
    case 'tired':
      return <Moon size={size} className={className} color="var(--mood-tired, #818cf8)" />;
    case '😔':
    case 'sad':
      return <Frown size={size} className={className} color="var(--mood-sad, #64748b)" />;
    case '😤':
    case 'stressed':
      return <Zap size={size} className={className} color="var(--mood-angry, #ef4444)" />;
    default:
      return <Smile size={size} className={className} color="var(--color-amber)" />;
  }
}
