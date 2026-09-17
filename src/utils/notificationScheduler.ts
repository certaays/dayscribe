/**
 * Notification Scheduler
 *
 * Runs a timer every minute (aligned to the clock) to check if any
 * active reminders should fire a browser notification right now.
 */

import { db } from '../db/database';
import { toDateString } from './dateHelpers';

let schedulerInterval: ReturnType<typeof setInterval> | null = null;
// Track which reminders already notified this minute to avoid duplicates
const firedThisMinute = new Set<string>();
let lastMinute = '';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function getCurrentHHMM(): string {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

async function checkAndFireReminders(): Promise<void> {
  // Requires browser notification permission — don't rely on DB flag
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    console.debug('[DayScribe] Notifications not granted, skipping');
    return;
  }

  const now = new Date();
  const currentTime = getCurrentHHMM();
  const currentDay = now.getDay(); // 0=Sun … 6=Sat
  const today = toDateString(now);

  // Reset fired-set when the minute changes
  if (currentTime !== lastMinute) {
    firedThisMinute.clear();
    lastMinute = currentTime;
  }

  const reminders = await db.reminders.toArray();

  for (const reminder of reminders) {
    if (!reminder.isActive) continue;
    if (!reminder.notifyEnabled) continue;
    if (reminder.time !== currentTime) continue;
    if (!reminder.repeatDays.includes(currentDay)) continue;

    const notifKey = `${reminder.id}-${today}-${currentTime}`;
    if (firedThisMinute.has(notifKey)) continue; // already fired this minute
    firedThisMinute.add(notifKey);

    console.log(`[DayScribe] Firing notification for: ${reminder.label}`);

    new Notification('🕯️ DayScribe Reminder', {
      body: reminder.label,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: notifKey, // browser deduplication
      requireInteraction: false,
    });
  }
}

/**
 * Start the scheduler aligned to the next clock minute boundary,
 * so checks happen at :00 seconds of every minute.
 */
export function startNotificationScheduler(): void {
  if (schedulerInterval) return; // Already running

  // Do an immediate check in case a reminder is due right now
  checkAndFireReminders();

  // Align to the next minute boundary so we always check at HH:MM:00
  const now = new Date();
  const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

  setTimeout(() => {
    checkAndFireReminders(); // Check at the boundary
    schedulerInterval = setInterval(checkAndFireReminders, 60_000);
    console.log('[DayScribe] Notification scheduler running (aligned to clock)');
  }, msUntilNextMinute);

  console.log(`[DayScribe] Scheduler will align in ${Math.round(msUntilNextMinute / 1000)}s`);
}

export function stopNotificationScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[DayScribe] Notification scheduler stopped');
  }
}

/**
 * Send a test notification immediately — useful for verifying permissions work.
 */
export function sendTestNotification(): boolean {
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;
  new Notification('🕯️ DayScribe', {
    body: 'Notifications are working! You\'ll be reminded on time. ✨',
    icon: '/icons/icon-192.png',
  });
  return true;
}
