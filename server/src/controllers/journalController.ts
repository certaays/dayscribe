import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export async function getJournalEntries(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { date, tag, search } = req.query;

    const where: any = { userId };

    if (date && typeof date === 'string') {
      where.date = date;
    }

    const entries = await prisma.journalEntry.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    let filtered = entries.map((entry) => ({
      ...entry,
      tags: JSON.parse(entry.tags || '[]'),
    }));

    if (tag && typeof tag === 'string') {
      filtered = filtered.filter((e) => e.tags.includes(tag));
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (e) => (e.title && e.title.toLowerCase().includes(q)) || e.content.toLowerCase().includes(q)
      );
    }

    res.json({ entries: filtered });
  } catch (err) {
    console.error('Get journal entries error:', err);
    res.status(500).json({ error: 'Failed to retrieve journal entries' });
  }
}

export async function createJournalEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const { id, date, title, content, mood, tags } = req.body;

    if (!date || !content) {
      res.status(400).json({ error: 'Date and content are required' });
      return;
    }

    const entry = await prisma.journalEntry.create({
      data: {
        ...(id ? { id } : {}),
        userId,
        date,
        title: title || null,
        content,
        mood: mood || '😌',
        tags: JSON.stringify(Array.isArray(tags) ? tags : []),
      },
    });

    res.status(201).json({
      entry: {
        ...entry,
        tags: JSON.parse(entry.tags),
      },
    });
  } catch (err) {
    console.error('Create journal entry error:', err);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
}

export async function updateJournalEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;
    const { title, content, mood, tags, date } = req.body;

    const existing = await prisma.journalEntry.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Journal entry not found' });
      return;
    }

    const updated = await prisma.journalEntry.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(mood !== undefined ? { mood } : {}),
        ...(date !== undefined ? { date } : {}),
        ...(tags !== undefined ? { tags: JSON.stringify(Array.isArray(tags) ? tags : []) } : {}),
      },
    });

    res.json({
      entry: {
        ...updated,
        tags: JSON.parse(updated.tags),
      },
    });
  } catch (err) {
    console.error('Update journal entry error:', err);
    res.status(500).json({ error: 'Failed to update journal entry' });
  }
}

export async function deleteJournalEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const id = req.params.id as string;

    const existing = await prisma.journalEntry.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      res.status(404).json({ error: 'Journal entry not found' });
      return;
    }

    await prisma.journalEntry.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Journal entry deleted' });
  } catch (err) {
    console.error('Delete journal entry error:', err);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
}
