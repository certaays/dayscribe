import { Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export async function getSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId,
          displayName: req.user?.name || 'Friend',
          theme: 'dark',
          fontSerif: 'Libre Baskerville',
          fontHand: 'Kalam',
          fontUi: 'DM Sans',
          fontSizeScale: 'normal',
        },
      });
    }

    res.json({
      settings: {
        ...settings,
        customThemeColors: settings.customThemeColors ? JSON.parse(settings.customThemeColors) : undefined,
      },
    });
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Failed to retrieve settings' });
  }
}

export async function updateSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.userId!;
    const {
      displayName,
      theme,
      customThemeColors,
      fontSerif,
      fontHand,
      fontUi,
      fontSizeScale,
    } = req.body;

    const updated = await prisma.userSettings.upsert({
      where: { userId },
      update: {
        ...(displayName !== undefined ? { displayName } : {}),
        ...(theme !== undefined ? { theme } : {}),
        ...(customThemeColors !== undefined ? { customThemeColors: JSON.stringify(customThemeColors) } : {}),
        ...(fontSerif !== undefined ? { fontSerif } : {}),
        ...(fontHand !== undefined ? { fontHand } : {}),
        ...(fontUi !== undefined ? { fontUi } : {}),
        ...(fontSizeScale !== undefined ? { fontSizeScale } : {}),
      },
      create: {
        userId,
        displayName: displayName || 'Friend',
        theme: theme || 'dark',
        customThemeColors: customThemeColors ? JSON.stringify(customThemeColors) : undefined,
        fontSerif: fontSerif || 'Libre Baskerville',
        fontHand: fontHand || 'Kalam',
        fontUi: fontUi || 'DM Sans',
        fontSizeScale: fontSizeScale || 'normal',
      },
    });

    res.json({
      settings: {
        ...updated,
        customThemeColors: updated.customThemeColors ? JSON.parse(updated.customThemeColors) : undefined,
      },
    });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
}
