import type { Request, Response } from 'express';
import { skillCardStatusUpdateSchema } from '@kodguru/shared';
import { SkillCardModel } from '../../models/skill-card.model.js';
import { AppError } from '../../middleware/error-handler.js';
import {
  buildImportReport,
  canSetStatus,
  ensureDbConnected,
  parseCardsPayload,
  validateOneCard,
  visibleStatusFilter,
} from './skill-card.utils.js';

function getRole(req: Request) {
  return req.user?.role;
}


function cleanCard(doc: any) {
  const { _id, __v, createdAt, updatedAt, ...card } = doc;
  return { ...card, id: _id ? String(_id) : doc.id, createdAt, updatedAt };
}

export async function listSkillCards(req: Request, res: Response): Promise<void> {
  ensureDbConnected();
  const role = getRole(req);
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const level = typeof req.query.level === 'string' ? req.query.level : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

  const filter: Record<string, unknown> = { ...visibleStatusFilter(role, status) };
  if (category) filter.category = category;
  if (level) filter.level = level;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { banglaName: { $regex: search, $options: 'i' } },
      { simpleMeaning: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
    ];
  }

  const cards = await SkillCardModel.find(filter).sort({ category: 1, slug: 1 }).lean();
  res.json({ ok: true, data: { cards: cards.map(cleanCard), count: cards.length } });
}

export async function getSkillCard(req: Request, res: Response): Promise<void> {
  ensureDbConnected();
  const role = getRole(req);
  const slug = req.params.slug;
  const filter: Record<string, unknown> = { slug, ...visibleStatusFilter(role) };
  const card = await SkillCardModel.findOne(filter).lean();
  if (!card) {
    throw new AppError(404, 'SKILL_CARD_NOT_FOUND', 'Skill card not found', 'এই Skill Card পাওয়া যায়নি।');
  }
  res.json({ ok: true, data: { card: cleanCard(card) } });
}

export async function createSkillCard(req: Request, res: Response): Promise<void> {
  ensureDbConnected();
  const card = validateOneCard(req.body);
  const exists = await SkillCardModel.exists({ slug: card.slug });
  if (exists) {
    throw new AppError(409, 'SLUG_EXISTS', 'Slug already exists', 'এই slug দিয়ে আগে থেকেই Skill Card আছে।');
  }
  const created = await SkillCardModel.create(card);
  res.status(201).json({ ok: true, data: { card: created.toJSON(), messageBn: 'Skill Card তৈরি হয়েছে।' } });
}

export async function updateSkillCard(req: Request, res: Response): Promise<void> {
  ensureDbConnected();
  const slug = req.params.slug;
  const card = validateOneCard({ ...req.body, slug: req.body?.slug ?? slug });

  if (card.slug !== slug) {
    const exists = await SkillCardModel.exists({ slug: card.slug });
    if (exists) {
      throw new AppError(409, 'SLUG_EXISTS', 'Slug already exists', 'নতুন slug দিয়ে আগে থেকেই Skill Card আছে।');
    }
  }

  const updated = await SkillCardModel.findOneAndUpdate({ slug }, card, { new: true, runValidators: true });
  if (!updated) {
    throw new AppError(404, 'SKILL_CARD_NOT_FOUND', 'Skill card not found', 'আপডেট করার মতো Skill Card পাওয়া যায়নি।');
  }
  res.json({ ok: true, data: { card: updated.toJSON(), messageBn: 'Skill Card আপডেট হয়েছে।' } });
}

export async function deleteSkillCard(req: Request, res: Response): Promise<void> {
  ensureDbConnected();
  const deleted = await SkillCardModel.findOneAndDelete({ slug: req.params.slug });
  if (!deleted) {
    throw new AppError(404, 'SKILL_CARD_NOT_FOUND', 'Skill card not found', 'ডিলিট করার মতো Skill Card পাওয়া যায়নি।');
  }
  res.json({ ok: true, data: { messageBn: 'Skill Card ডিলিট হয়েছে।', slug: req.params.slug } });
}

export async function updateSkillCardStatus(req: Request, res: Response): Promise<void> {
  ensureDbConnected();
  const { status, note } = skillCardStatusUpdateSchema.parse(req.body);
  if (!req.user || !canSetStatus(req.user.role, status)) {
    throw new AppError(403, 'FORBIDDEN_STATUS_CHANGE', 'Cannot set this status', 'এই status দেওয়ার অনুমতি আপনার নেই।');
  }
  const update: Record<string, unknown> = {
    status,
    reviewNote: note ?? '',
    reviewedBy: req.user.email,
    reviewedAt: new Date().toISOString(),
  };
  const updated = await SkillCardModel.findOneAndUpdate({ slug: req.params.slug }, update, { new: true });
  if (!updated) {
    throw new AppError(404, 'SKILL_CARD_NOT_FOUND', 'Skill card not found', 'এই Skill Card পাওয়া যায়নি।');
  }
  res.json({ ok: true, data: { card: updated.toJSON(), messageBn: 'Status আপডেট হয়েছে।' } });
}

export async function importSkillCards(req: Request, res: Response): Promise<void> {
  ensureDbConnected();
  const { cards, dryRun, mode } = parseCardsPayload(req.body);
  const report = await buildImportReport(cards, mode);

  if (dryRun) {
    res.json({ ok: true, data: { dryRun: true, report, messageBn: 'Dry run সফল। এখন confirm করলে import হবে।' } });
    return;
  }

  let created = 0;
  let updated = 0;
  for (const card of cards) {
    const result = await SkillCardModel.updateOne({ slug: card.slug }, { $set: card }, { upsert: mode === 'upsert', runValidators: true });
    if (result.upsertedCount > 0) created += 1;
    else if (result.modifiedCount > 0 || result.matchedCount > 0) updated += 1;
  }

  res.json({
    ok: true,
    data: {
      dryRun: false,
      report: { ...report, created, updated, skipped: 0, failed: 0 },
      messageBn: `${created}টি নতুন এবং ${updated}টি আপডেট হয়েছে।`,
    },
  });
}

export async function exportSkillCards(req: Request, res: Response): Promise<void> {
  ensureDbConnected();
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  const cards = await SkillCardModel.find(filter).sort({ category: 1, slug: 1 }).lean();
  const filename = `skill-cards-export${status ? `-${status}` : ''}.json`;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.json({ exportedAt: new Date().toISOString(), count: cards.length, cards: cards.map(cleanCard) });
}
