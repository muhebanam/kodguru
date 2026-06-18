import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { skillCardImportSchema } from '@kodguru/shared';
import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { UserModel } from '../models/user.model.js';
import { SkillCardModel } from '../models/skill-card.model.js';
import { CurriculumModel } from '../models/curriculum.model.js';

/**
 * Seed script — `npm run seed`।
 * দুইটি কাজ করে, যা ছাড়া fresh deploy অচল:
 *   1. প্রথম admin তৈরি/promote (ADMIN_EMAIL/ADMIN_PASSWORD env থেকে)।
 *      কারণ: register সবাইকে 'student' বানায়; admin না থাকলে কেউ
 *      card import বা approve করতে পারবে না।
 *   2. Skill card seed import (default: ১৩২টি; SEED_FILE দিয়ে বদলানো যায়)।
 *      একই slug থাকলে skip — বারবার চালালেও duplicate হবে না (idempotent)।
 *
 * ব্যবহার:
 *   ADMIN_EMAIL=you@x.com ADMIN_PASSWORD=secret123 npm run seed
 *   SEED_FILE=seeds/mvp-3-approved-cards.json npm run seed   (শুধু ৩টি)
 */
const here = dirname(fileURLToPath(import.meta.url));
const apiRoot = join(here, '..', '..'); // dist/.. → apps/api ; src চালালেও মেলে

async function seedAdmin(): Promise<void> {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    logger.warn('ADMIN_EMAIL/ADMIN_PASSWORD নেই — admin bootstrap এড়ানো হলো।');
    return;
  }
  const email = env.ADMIN_EMAIL.toLowerCase().trim();
  const existing = await UserModel.findOne({ email });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      logger.info(`✅ বিদ্যমান ব্যবহারকারী admin করা হলো: ${email}`);
    } else {
      logger.info(`admin আগে থেকেই আছে: ${email}`);
    }
    return;
  }
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
  await UserModel.create({ name: env.ADMIN_NAME, email, passwordHash, role: 'admin' });
  logger.info(`✅ নতুন admin তৈরি হলো: ${email}`);
}

async function seedCards(): Promise<void> {
  const file = process.env.SEED_FILE ?? 'seeds/skill-cards-seed-132.json';
  const path = join(apiRoot, file);
  const raw = JSON.parse(readFileSync(path, 'utf8'));

  // আসল Zod schema দিয়ে validate — ভুল data DB-তে ঢুকবে না
  const cards = skillCardImportSchema.parse(raw);

  let inserted = 0;
  let skipped = 0;
  for (const card of cards) {
    const exists = await SkillCardModel.exists({ slug: card.slug });
    if (exists) {
      skipped++;
      continue;
    }
    await SkillCardModel.create(card);
    inserted++;
  }
  logger.info(`✅ Skill card seed: ${inserted}টি যোগ, ${skipped}টি আগে থেকেই ছিল (${file})`);
}


async function seedCurriculum(): Promise<void> {
  const path = join(apiRoot, 'seeds', 'curriculum.json');
  let raw: any;
  try {
    raw = JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    logger.warn('curriculum.json নেই — gamification mapping এড়ানো হলো। (npm run gen:curriculum চালান)');
    return;
  }
  // 1) milestones/modules collection-এ রাখি
  await CurriculumModel.findOneAndUpdate(
    { key: 'main' },
    { key: 'main', version: raw.version, milestones: raw.milestones, modules: raw.modules },
    { upsert: true },
  );
  // 2) প্রতিটি কার্ডে scId/moduleId/milestoneId/globalOrder বসাই
  let patched = 0;
  for (const [slug, fields] of Object.entries(raw.cardPatch as Record<string, any>)) {
    const r = await SkillCardModel.updateOne({ slug }, { $set: fields });
    if (r.matchedCount > 0) patched++;
  }
  logger.info(`✅ Curriculum: ${raw.milestones.length} milestone, ${raw.modules.length} module; ${patched} কার্ডে mapping বসানো হলো`);
}

async function main(): Promise<void> {
  await connectDB();
  await seedAdmin();
  await seedCards();
  await seedCurriculum();
  await disconnectDB();
  logger.info('🌱 Seed সম্পন্ন।');
  process.exit(0);
}

main().catch((err) => {
  logger.error('Seed ব্যর্থ', err);
  process.exit(1);
});
