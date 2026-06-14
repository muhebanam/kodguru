import mongoose from 'mongoose';
import type { CardStatus, Role, SkillCard } from '@kodguru/shared';
import { skillCardImportSchema, skillCardSchema } from '@kodguru/shared';
import { AppError } from '../../middleware/error-handler.js';
import { SkillCardModel } from '../../models/skill-card.model.js';

export function ensureDbConnected(): void {
  if (mongoose.connection.readyState !== 1) {
    throw new AppError(503, 'DB_DISCONNECTED', 'Database is not connected', 'ডাটাবেস connected নয়। আগে MongoDB চালু/সংযুক্ত করুন।');
  }
}

export function asyncRoute(handler: any) {
  return (req: any, res: any, next: any) => Promise.resolve(handler(req, res, next)).catch(next);
}

export function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function parseCardsPayload(body: unknown): { cards: SkillCard[]; dryRun: boolean; mode: 'upsert' | 'createOnly' } {
  const raw = body as any;
  const dryRun = Boolean(raw?.dryRun);
  const mode = raw?.mode === 'createOnly' ? 'createOnly' : 'upsert';
  const cardsInput = Array.isArray(raw) ? raw : raw?.cards;
  const cards = skillCardImportSchema.parse(cardsInput);
  return { cards, dryRun, mode };
}

export function validateOneCard(body: unknown): SkillCard {
  const input = body as any;
  const withSlug = input.slug ? input : { ...input, slug: normalizeSlug(String(input.title ?? '')) };
  return skillCardSchema.parse(withSlug);
}

export function duplicateSlugs(cards: SkillCard[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const card of cards) {
    if (seen.has(card.slug)) duplicates.add(card.slug);
    seen.add(card.slug);
  }
  return [...duplicates];
}

export function visibleStatusFilter(role?: Role, status?: string): Record<string, unknown> {
  if (role === 'admin' || role === 'teacher') {
    return status ? { status } : {};
  }
  return { status: 'approved' };
}

export function canSetStatus(role: Role, nextStatus: CardStatus): boolean {
  if (role === 'admin') return true;
  if (role === 'teacher') return nextStatus === 'reviewed' || nextStatus === 'rejected';
  return false;
}

export async function buildImportReport(cards: SkillCard[], mode: 'upsert' | 'createOnly') {
  const payloadDuplicates = duplicateSlugs(cards);
  if (payloadDuplicates.length > 0) {
    throw new AppError(400, 'DUPLICATE_SLUG_IN_FILE', 'Duplicate slugs in import file', `JSON file-এর ভিতরে একই slug আছে: ${payloadDuplicates.join(', ')}`);
  }

  const slugs = cards.map((card) => card.slug);
  const existing = await SkillCardModel.find({ slug: { $in: slugs } }).select('slug').lean();
  const existingSlugs = new Set(existing.map((item: any) => item.slug));

  if (mode === 'createOnly' && existingSlugs.size > 0) {
    throw new AppError(409, 'DUPLICATE_SLUG_IN_DATABASE', 'Some slugs already exist', `ডাটাবেসে আগে থেকেই এই slug আছে: ${[...existingSlugs].join(', ')}`);
  }

  return {
    total: cards.length,
    valid: cards.length,
    existing: existingSlugs.size,
    willCreate: cards.filter((card) => !existingSlugs.has(card.slug)).length,
    willUpdate: mode === 'upsert' ? cards.filter((card) => existingSlugs.has(card.slug)).length : 0,
    duplicateInFile: payloadDuplicates,
  };
}
