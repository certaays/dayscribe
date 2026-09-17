import { useCallback } from 'react';
import { db } from '../db/database';

export function useNotifications() {
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;

    const result = await Notification.requestPermission();
    if (result === 'granted') {
      await db.app_settings.update(1, { notificationsEnabled: true });
      return true;
    }
    return false;
  }, []);

  const isSupported = 'Notification' in window;
  const isGranted = isSupported && Notification.permission === 'granted';

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!isGranted) return;
    new Notification(title, {
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      ...options,
    });
  }, [isGranted]);

  return {
    isSupported,
    isGranted,
    permission: isSupported ? Notification.permission : 'unsupported',
    requestPermission,
    showNotification,
  };
}
