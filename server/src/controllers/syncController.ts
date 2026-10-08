import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export async function bulkSync(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const {
      journalEntries = [],
      habits = [],
      habitLogs = [],
      reminders = [],
      reminderLogs = [],
      settings,
      clientId,
    } = req.body;

    // 1. Process client pushed data (upsert)
    if (Array.isArray(journalEntries) && journalEntries.length > 0) {
      for (const entry of journalEntries) {
        if (!entry.date || !entry.content) continue;
        await prisma.journalEntry.upsert({
          where: { id: entry.id },
          update: {
            title: entry.title || null,
            content: entry.content,
            mood: entry.mood || '😌',
            tags: JSON.stringify(Array.isArray(entry.tags) ? entry.tags : []),
            date: entry.date,
            isDeleted: entry.isDeleted || false,
          },
          create: {
            id: entry.id,
            userId,
            date: entry.date,
            title: entry.title || null,
            content: entry.content,
            mood: entry.mood || '😌',
            tags: JSON.stringify(Array.isArray(entry.tags) ? entry.tags : []),
            isDeleted: entry.isDeleted || false,
          },
        });
      }
    }

    if (Array.isArray(habits) && habits.length > 0) {
      for (const h of habits) {
        if (!h.title) continue;
        await prisma.habit.upsert({
          where: { id: h.id },
          update: {
            title: h.title,
            emoji: h.emoji || 'sparkles',
            category: h.category || 'Growth',
            targetType: h.targetType || 'boolean',
            targetCount: typeof h.targetCount === 'number' ? h.targetCount : 1,
            unit: h.unit || null,
            repeatDays: JSON.stringify(Array.isArray(h.repeatDays) ? h.repeatDays : [0, 1, 2, 3, 4, 5, 6]),
            isActive: h.isActive !== undefined ? h.isActive : true,
            identity: h.identity || null,
            stackTrigger: h.stackTrigger || null,
            stackAfterHabitId: h.stackAfterHabitId || null,
            twoMinuteRule: h.twoMinuteRule || null,
            isDeleted: h.isDeleted || false,
          },
          create: {
            id: h.id,
            userId,
            title: h.title,
            emoji: h.emoji || 'sparkles',
            category: h.category || 'Growth',
            targetType: h.targetType || 'boolean',
            targetCount: typeof h.targetCount === 'number' ? h.targetCount : 1,
            unit: h.unit || null,
            repeatDays: JSON.stringify(Array.isArray(h.repeatDays) ? h.repeatDays : [0, 1, 2, 3, 4, 5, 6]),
            isActive: h.isActive !== undefined ? h.isActive : true,
            identity: h.identity || null,
            stackTrigger: h.stackTrigger || null,
            stackAfterHabitId: h.stackAfterHabitId || null,
            twoMinuteRule: h.twoMinuteRule || null,
            isDeleted: h.isDeleted || false,
          },
        });
      }
    }

    if (Array.isArray(habitLogs) && habitLogs.length > 0) {
      for (const log of habitLogs) {
        if (!log.habitId || !log.date) continue;
        // Verify habit exists before upserting log
        const habitExists = await prisma.habit.findUnique({ where: { id: log.habitId } });
        if (!habitExists) continue;

        await prisma.habitLog.upsert({
          where: {
            habitId_date: {
              habitId: log.habitId,
              date: log.date,
            },
          },
          update: {
            completed: log.completed !== undefined ? log.completed : true,
            currentCount: typeof log.currentCount === 'number' ? log.currentCount : 1,
            isTwoMinuteVersion: log.isTwoMinuteVersion !== undefined ? log.isTwoMinuteVersion : false,
          },
          create: {
            id: log.id,
            userId,
            habitId: log.habitId,
            date: log.date,
            completed: log.completed !== undefined ? log.completed : true,
            currentCount: typeof log.currentCount === 'number' ? log.currentCount : 1,
            isTwoMinuteVersion: log.isTwoMinuteVersion !== undefined ? log.isTwoMinuteVersion : false,
          },
        });
      }
    }

    if (Array.isArray(reminders) && reminders.length > 0) {
      for (const r of reminders) {
        if (!r.label || !r.time) continue;
        await prisma.reminder.upsert({
          where: { id: r.id },
          update: {
            label: r.label,
            time: r.time,
            repeatDays: JSON.stringify(Array.isArray(r.repeatDays) ? r.repeatDays : [0, 1, 2, 3, 4, 5, 6]),
            isActive: r.isActive !== undefined ? r.isActive : true,
            notifyEnabled: r.notifyEnabled !== undefined ? r.notifyEnabled : true,
            isDeleted: r.isDeleted || false,
          },
          create: {
            id: r.id,
            userId,
            label: r.label,
            time: r.time,
            repeatDays: JSON.stringify(Array.isArray(r.repeatDays) ? r.repeatDays : [0, 1, 2, 3, 4, 5, 6]),
            isActive: r.isActive !== undefined ? r.isActive : true,
            notifyEnabled: r.notifyEnabled !== undefined ? r.notifyEnabled : true,
            isDeleted: r.isDeleted || false,
          },
        });
      }
    }

    if (Array.isArray(reminderLogs) && reminderLogs.length > 0) {
      for (const log of reminderLogs) {
        if (!log.reminderId || !log.date) continue;
        const reminderExists = await prisma.reminder.findUnique({ where: { id: log.reminderId } });
        if (!reminderExists) continue;

        await prisma.reminderLog.upsert({
          where: {
            reminderId_date: {
              reminderId: log.reminderId,
              date: log.date,
            },
          },
          update: {
            completed: log.completed !== undefined ? log.completed : true,
            completedAt: new Date(),
          },
          create: {
            id: log.id,
            userId,
            reminderId: log.reminderId,
            date: log.date,
            completed: log.completed !== undefined ? log.completed : true,
          },
        });
      }
    }

    if (settings) {
      await prisma.userSettings.upsert({
        where: { userId },
        update: {
          ...(settings.displayName ? { displayName: settings.displayName } : {}),
          ...(settings.theme ? { theme: settings.theme } : {}),
          ...(settings.customThemeColors ? { customThemeColors: JSON.stringify(settings.customThemeColors) } : {}),
          ...(settings.fontSerif ? { fontSerif: settings.fontSerif } : {}),
          ...(settings.fontHand ? { fontHand: settings.fontHand } : {}),
          ...(settings.fontUi ? { fontUi: settings.fontUi } : {}),
          ...(settings.fontSizeScale ? { fontSizeScale: settings.fontSizeScale } : {}),
        },
        create: {
          userId,
          displayName: settings.displayName || 'Friend',
          theme: settings.theme || 'dark',
          customThemeColors: settings.customThemeColors ? JSON.stringify(settings.customThemeColors) : undefined,
          fontSerif: settings.fontSerif || 'Libre Baskerville',
          fontHand: settings.fontHand || 'Kalam',
          fontUi: settings.fontUi || 'DM Sans',
          fontSizeScale: settings.fontSizeScale || 'normal',
        },
      });
    }

    // 2. Fetch all fresh server data for full reconciliation
    const [allEntries, allHabits, allHabitLogs, allReminders, allReminderLogs, userSettings] =
      await Promise.all([
        prisma.journalEntry.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
        prisma.habit.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
        prisma.habitLog.findMany({ where: { userId } }),
        prisma.reminder.findMany({ where: { userId }, orderBy: { time: 'asc' } }),
        prisma.reminderLog.findMany({ where: { userId } }),
        prisma.userSettings.findUnique({ where: { userId } }),
      ]);

    const responseData = {
      journalEntries: allEntries.map((e) => ({
        ...e,
        tags: JSON.parse(e.tags || '[]'),
      })),
      habits: allHabits.map((h) => ({
        ...h,
        repeatDays: JSON.parse(h.repeatDays || '[0,1,2,3,4,5,6]'),
      })),
      habitLogs: allHabitLogs,
      reminders: allReminders.map((r) => ({
        ...r,
        repeatDays: JSON.parse(r.repeatDays || '[0,1,2,3,4,5,6]'),
      })),
      reminderLogs: allReminderLogs,
      settings: userSettings
        ? {
            ...userSettings,
            customThemeColors: userSettings.customThemeColors
              ? JSON.parse(userSettings.customThemeColors)
              : undefined,
          }
        : undefined,
    };

    // Emit event to other devices in the same user room
    const io = req.app.locals.io;
    if (io) {
      // We pass the clientId so the sender knows to ignore it
      io.to(userId).emit('sync_updated', { syncedAt: new Date().toISOString(), clientId });
    }

    res.json({
      success: true,
      syncedAt: new Date().toISOString(),
      data: responseData,
    });
  } catch (err) {
    console.error('Bulk sync error:', err);
    res.status(500).json({ error: 'Failed to perform bulk cloud sync' });
  }
}
