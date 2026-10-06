import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export async function getHabits(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { date } = req.query;
    const targetDate = typeof date === 'string' ? date : new Date().toISOString().split('T')[0];

    const habits = await prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      include: {
        habitLogs: {
          where: { date: targetDate },
        },
      },
    });

    const parsed = habits.map((h) => {
      const todayLog = h.habitLogs[0];
      return {
        id: h.id,
        title: h.title,
        emoji: h.emoji,
        category: h.category,
        targetType: h.targetType,
        targetCount: h.targetCount,
        unit: h.unit,
        repeatDays: JSON.parse(h.repeatDays || '[0,1,2,3,4,5,6]'),
        isActive: h.isActive,
        identity: h.identity,
        stackTrigger: h.stackTrigger,
        stackAfterHabitId: h.stackAfterHabitId,
        twoMinuteRule: h.twoMinuteRule,
        createdAt: h.createdAt,
        updatedAt: h.updatedAt,
        completed: todayLog?.completed || false,
        currentCount: todayLog?.currentCount || 0,
        isTwoMinuteVersion: todayLog?.isTwoMinuteVersion || false,
      };
    });

    res.json({ habits: parsed });
  } catch (err) {
    console.error('Get habits error:', err);
    res.status(500).json({ error: 'Failed to retrieve habits' });
  }
}

export async function createHabit(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const {
      id,
      title,
      emoji,
      category,
      targetType,
      targetCount,
      unit,
      repeatDays,
      isActive,
      identity,
      stackTrigger,
      stackAfterHabitId,
      twoMinuteRule,
    } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Habit title is required' });
      return;
    }

    const habit = await prisma.habit.create({
      data: {
        ...(id ? { id } : {}),
        userId,
        title,
        emoji: emoji || 'sparkles',
        category: category || 'Growth',
        targetType: targetType || 'boolean',
        targetCount: typeof targetCount === 'number' ? targetCount : 1,
        unit: unit || null,
        repeatDays: JSON.stringify(Array.isArray(repeatDays) ? repeatDays : [0, 1, 2, 3, 4, 5, 6]),
        isActive: isActive !== undefined ? isActive : true,
        identity: identity || null,
        stackTrigger: stackTrigger || null,
        stackAfterHabitId: stackAfterHabitId || null,
        twoMinuteRule: twoMinuteRule || null,
      },
    });

    res.status(201).json({
      habit: {
        ...habit,
        repeatDays: JSON.parse(habit.repeatDays),
        completed: false,
        currentCount: 0,
      },
    });
  } catch (err) {
    console.error('Create habit error:', err);
    res.status(500).json({ error: 'Failed to create habit' });
  }
}

export async function updateHabit(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const {
      title,
      emoji,
      category,
      targetType,
      targetCount,
      unit,
      repeatDays,
      isActive,
      identity,
      stackTrigger,
      stackAfterHabitId,
      twoMinuteRule,
    } = req.body;

    const existing = await prisma.habit.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    const updated = await prisma.habit.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(emoji !== undefined ? { emoji } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(targetType !== undefined ? { targetType } : {}),
        ...(targetCount !== undefined ? { targetCount } : {}),
        ...(unit !== undefined ? { unit } : {}),
        ...(repeatDays !== undefined ? { repeatDays: JSON.stringify(repeatDays) } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(identity !== undefined ? { identity } : {}),
        ...(stackTrigger !== undefined ? { stackTrigger } : {}),
        ...(stackAfterHabitId !== undefined ? { stackAfterHabitId } : {}),
        ...(twoMinuteRule !== undefined ? { twoMinuteRule } : {}),
      },
    });

    res.json({
      habit: {
        ...updated,
        repeatDays: JSON.parse(updated.repeatDays),
      },
    });
  } catch (err) {
    console.error('Update habit error:', err);
    res.status(500).json({ error: 'Failed to update habit' });
  }
}

export async function deleteHabit(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;

    const existing = await prisma.habit.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    await prisma.habit.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Habit deleted' });
  } catch (err) {
    console.error('Delete habit error:', err);
    res.status(500).json({ error: 'Failed to delete habit' });
  }
}

export async function logHabit(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const habitId = req.params.id as string;
    const { date, completed, currentCount, isTwoMinuteVersion } = req.body;

    const targetDate = date || new Date().toISOString().split('T')[0];

    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId },
    });

    if (!habit) {
      res.status(404).json({ error: 'Habit not found' });
      return;
    }

    const log = await prisma.habitLog.upsert({
      where: {
        habitId_date: {
          habitId,
          date: targetDate,
        },
      },
      update: {
        completed: completed !== undefined ? completed : true,
        currentCount: typeof currentCount === 'number' ? currentCount : 1,
        isTwoMinuteVersion: isTwoMinuteVersion !== undefined ? isTwoMinuteVersion : false,
        completedAt: new Date(),
      },
      create: {
        userId,
        habitId,
        date: targetDate,
        completed: completed !== undefined ? completed : true,
        currentCount: typeof currentCount === 'number' ? currentCount : 1,
        isTwoMinuteVersion: isTwoMinuteVersion !== undefined ? isTwoMinuteVersion : false,
      },
    });

    res.json({ success: true, log });
  } catch (err) {
    console.error('Log habit error:', err);
    res.status(500).json({ error: 'Failed to log habit completion' });
  }
}
