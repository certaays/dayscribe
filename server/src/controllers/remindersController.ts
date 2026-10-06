import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export async function getReminders(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const reminders = await prisma.reminder.findMany({
      where: { userId },
      orderBy: { time: 'asc' },
      include: {
        reminderLogs: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    const parsed = reminders.map((r) => ({
      ...r,
      repeatDays: JSON.parse(r.repeatDays || '[0,1,2,3,4,5,6]'),
    }));

    res.json({ reminders: parsed });
  } catch (err) {
    console.error('Get reminders error:', err);
    res.status(500).json({ error: 'Failed to retrieve reminders' });
  }
}

export async function createReminder(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { id, label, time, repeatDays, isActive, notifyEnabled } = req.body;

    if (!label || !time) {
      res.status(400).json({ error: 'Label and time are required' });
      return;
    }

    const reminder = await prisma.reminder.create({
      data: {
        ...(id ? { id } : {}),
        userId,
        label,
        time,
        repeatDays: JSON.stringify(Array.isArray(repeatDays) ? repeatDays : [0, 1, 2, 3, 4, 5, 6]),
        isActive: isActive !== undefined ? isActive : true,
        notifyEnabled: notifyEnabled !== undefined ? notifyEnabled : true,
      },
    });

    res.status(201).json({
      reminder: {
        ...reminder,
        repeatDays: JSON.parse(reminder.repeatDays),
      },
    });
  } catch (err) {
    console.error('Create reminder error:', err);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
}

export async function updateReminder(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const { label, time, repeatDays, isActive, notifyEnabled } = req.body;

    const existing = await prisma.reminder.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Reminder not found' });
      return;
    }

    const updated = await prisma.reminder.update({
      where: { id },
      data: {
        ...(label !== undefined ? { label } : {}),
        ...(time !== undefined ? { time } : {}),
        ...(repeatDays !== undefined ? { repeatDays: JSON.stringify(repeatDays) } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(notifyEnabled !== undefined ? { notifyEnabled } : {}),
      },
    });

    res.json({
      reminder: {
        ...updated,
        repeatDays: JSON.parse(updated.repeatDays),
      },
    });
  } catch (err) {
    console.error('Update reminder error:', err);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
}

export async function deleteReminder(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;

    const existing = await prisma.reminder.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Reminder not found' });
      return;
    }

    await prisma.reminder.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Reminder deleted' });
  } catch (err) {
    console.error('Delete reminder error:', err);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
}

export async function logReminder(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const reminderId = req.params.id as string;
    const { date } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const log = await prisma.reminderLog.upsert({
      where: {
        reminderId_date: {
          reminderId,
          date: targetDate,
        },
      },
      update: {
        completedAt: new Date(),
      },
      create: {
        userId,
        reminderId,
        date: targetDate,
      },
    });

    res.json({ success: true, log });
  } catch (err) {
    console.error('Log reminder error:', err);
    res.status(500).json({ error: 'Failed to log reminder completion' });
  }
}
