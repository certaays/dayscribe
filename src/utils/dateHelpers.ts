/* ============================================================
   Date helper utilities
   ============================================================ */

export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
}

export function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export function isSameDay(a: Date | string, b: Date | string): boolean {
  return toDateString(typeof a === 'string' ? new Date(a) : a) ===
         toDateString(typeof b === 'string' ? new Date(b) : b);
}

export function isToday(date: Date | string): boolean {
  return isSameDay(date, new Date());
}

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
                            'July', 'August', 'September', 'October', 'November', 'December'];

export const MOODS = [
  { emoji: '🤩', label: 'Excited',  color: 'var(--mood-excited)' },
  { emoji: '😊', label: 'Happy',    color: 'var(--mood-happy)'   },
  { emoji: '😌', label: 'Calm',     color: 'var(--mood-calm)'    },
  { emoji: '😴', label: 'Tired',    color: 'var(--mood-tired)'   },
  { emoji: '😔', label: 'Sad',      color: 'var(--mood-sad)'     },
  { emoji: '😤', label: 'Stressed', color: 'var(--mood-angry)'   },
];
