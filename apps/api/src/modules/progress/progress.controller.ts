import type { Request, Response, NextFunction } from 'express';
import { completeCardSchema } from '@kodguru/shared';
import { AppError } from '../../middleware/error-handler.js';
import { completeCard, getMyProgress, getCurriculum, getLearningMap } from './progress.service.js';
import { ensureDbConnected } from './db-guard.js';

export async function postCompleteCard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    ensureDbConnected();
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'AUTH_REQUIRED', 'Login required', 'আগে লগইন করুন।');
    const body = completeCardSchema.parse(req.body);
    const result = await completeCard({ userId, slug: body.slug, quizScore: body.quizScore });
    res.json({ ok: true, data: result });
  } catch (err) { next(err); }
}

export async function getProgressMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    ensureDbConnected();
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'AUTH_REQUIRED', 'Login required', 'আগে লগইন করুন।');
    res.json({ ok: true, data: await getMyProgress(userId) });
  } catch (err) { next(err); }
}

export async function getCurriculumRoute(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    ensureDbConnected();
    res.json({ ok: true, data: await getCurriculum() });
  } catch (err) { next(err); }
}

export async function getMapRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    ensureDbConnected();
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'AUTH_REQUIRED', 'Login required', 'আগে লগইন করুন।');
    res.json({ ok: true, data: await getLearningMap(userId) });
  } catch (err) { next(err); }
}
