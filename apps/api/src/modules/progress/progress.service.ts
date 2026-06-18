import { computeAward, levelForXp, levelTier, computeAchievements } from '@kodguru/shared';
import type { Level } from '@kodguru/shared';
import { UserModel } from '../../models/user.model.js';
import { ProgressModel } from '../../models/progress.model.js';
import { SkillCardModel } from '../../models/skill-card.model.js';
import { CurriculumModel } from '../../models/curriculum.model.js';
import { AppError } from '../../middleware/error-handler.js';

/** আজকের UTC দিন "YYYY-MM-DD" */
function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * একটি কার্ড শেষ করা — XP award সহ। idempotent: আগে শেষ করা থাকলে আবার XP দেয় না।
 * module/milestone-এর সব কার্ড শেষ হলে bonus যোগ হয় (একবারই)।
 */
export async function completeCard(params: {
  userId: string;
  slug: string;
  quizScore: number;
}): Promise<{
  awardedXp: number;
  totalXp: number;
  level: number;
  tierBn: string;
  streakDays: number;
  leveledUp: boolean;
  moduleCompleted: boolean;
  milestoneCompleted: boolean;
  alreadyDone: boolean;
}> {
  const card = await SkillCardModel.findOne({ slug: params.slug }).lean();
  if (!card) {
    throw new AppError(404, 'CARD_NOT_FOUND', 'Card not found', 'এই পাঠটি পাওয়া যায়নি।');
  }
  const user = await UserModel.findById(params.userId);
  if (!user) {
    throw new AppError(401, 'AUTH_REQUIRED', 'Login required', 'আগে লগইন করুন।');
  }

  const existing = await ProgressModel.findOne({ userId: user._id, cardSlug: params.slug });
  const alreadyCompleted = Boolean(existing?.completed);
  const perfect = params.quizScore >= 100;
  const today = todayUTC();
  const isNewDay = user.lastActiveDay !== today;

  // এই কার্ড শেষ করলে module/milestone শেষ হবে কিনা আগেই হিসাব
  const moduleId = (card as { moduleId?: string }).moduleId;
  const milestoneId = (card as { milestoneId?: string }).milestoneId;

  let moduleJustCompleted = false;
  let milestoneJustCompleted = false;

  if (!alreadyCompleted && moduleId && !user.completedModules.includes(moduleId)) {
    const totalInModule = await SkillCardModel.countDocuments({ moduleId });
    const doneInModule = await ProgressModel.countDocuments({
      userId: user._id, moduleId, completed: true,
    });
    // এই কার্ড শেষ হলে done+1 — সব শেষ?
    if (totalInModule > 0 && doneInModule + 1 >= totalInModule) moduleJustCompleted = true;
  }
  if (!alreadyCompleted && milestoneId && !user.completedMilestones.includes(milestoneId)) {
    const totalInMs = await SkillCardModel.countDocuments({ milestoneId });
    const doneInMs = await ProgressModel.countDocuments({
      userId: user._id, milestoneId, completed: true,
    });
    if (totalInMs > 0 && doneInMs + 1 >= totalInMs) milestoneJustCompleted = true;
  }

  const award = computeAward({
    cardLevel: (card as unknown as { level: Level }).level,
    perfect,
    alreadyCompleted,
    prevXp: user.xp,
    prevStreakDays: user.streakDays,
    lastActiveDay: user.lastActiveDay,
    today,
    moduleJustCompleted,
    milestoneJustCompleted,
    isNewDay,
  });

  // progress record (idempotent upsert)
  if (!alreadyCompleted) {
    await ProgressModel.findOneAndUpdate(
      { userId: user._id, cardSlug: params.slug },
      {
        userId: user._id, cardSlug: params.slug, moduleId, milestoneId,
        completed: true, perfect, quizScore: params.quizScore,
        xpAwarded: award.awardedXp, completedAt: new Date().toISOString(),
      },
      { upsert: true },
    );

    user.xp = award.newXp;
    user.streakDays = award.newStreakDays;
    user.lastActiveDay = today;
    if (moduleJustCompleted && moduleId) user.completedModules.push(moduleId);
    if (milestoneJustCompleted && milestoneId) {
      user.completedMilestones.push(milestoneId);
      if (!user.badges.includes(milestoneId)) user.badges.push(milestoneId);
    }
    await user.save();
  }

  return {
    awardedXp: award.awardedXp,
    totalXp: user.xp,
    level: levelForXp(user.xp),
    tierBn: levelTier(levelForXp(user.xp)).labelBn,
    streakDays: user.streakDays,
    leveledUp: award.leveledUp,
    moduleCompleted: moduleJustCompleted,
    milestoneCompleted: milestoneJustCompleted,
    alreadyDone: alreadyCompleted,
  };
}

/** ব্যবহারকারীর সম্পূর্ণ progress snapshot (dashboard/RPG UI-র জন্য) */
export async function getMyProgress(userId: string) {
  const user = await UserModel.findById(userId).lean();
  if (!user) throw new AppError(401, 'AUTH_REQUIRED', 'Login required', 'আগে লগইন করুন।');

  const done = await ProgressModel.find({ userId, completed: true }).select('cardSlug moduleId milestoneId').lean();
  const level = levelForXp(user.xp);
  const achievements = computeAchievements({
    level,
    streakDays: user.streakDays,
    completedCards: done.length,
    completedModules: user.completedModules.length,
    completedMilestones: user.completedMilestones.length,
  });

  return {
    xp: user.xp,
    level,
    tierBn: levelTier(level).labelBn,
    streakDays: user.streakDays,
    badges: user.badges,
    completedCards: done.map((d) => d.cardSlug),
    completedModules: user.completedModules,
    completedMilestones: user.completedMilestones,
    achievements,
  };
}

/** পুরো curriculum (milestones/modules) — unlock map আঁকতে */
export async function getCurriculum() {
  const c = await CurriculumModel.findOne({ key: 'main' }).lean();
  if (!c) throw new AppError(404, 'NO_CURRICULUM', 'Curriculum not seeded', 'Curriculum এখনো লোড হয়নি। seed চালান।');
  const cc = c as unknown as { milestones: unknown; modules: unknown };
  return { milestones: cc.milestones, modules: cc.modules };
}

/**
 * RPG Learning Map — milestone → module → card, প্রতিটির unlock/completion/mastery সহ।
 * Unlock নিয়ম: milestone N খোলে আগের milestone শেষ হলে; module M খোলে
 * milestone খোলা থাকলে ও আগের module শেষ হলে। card খোলে module খোলা + approved হলে।
 */
export async function getLearningMap(userId: string) {
  const user = await UserModel.findById(userId).lean();
  if (!user) throw new AppError(401, 'AUTH_REQUIRED', 'Login required', 'আগে লগইন করুন।');

  const cur = await CurriculumModel.findOne({ key: 'main' }).lean();
  if (!cur) throw new AppError(404, 'NO_CURRICULUM', 'Curriculum not seeded', 'Curriculum এখনো লোড হয়নি। seed চালান।');
  const cc = cur as unknown as { milestones: any[]; modules: any[] };

  const done = await ProgressModel.find({ userId, completed: true }).select('cardSlug').lean();
  const doneSet = new Set(done.map((d) => d.cardSlug));
  const completedModules = new Set(user.completedModules);
  const completedMilestones = new Set(user.completedMilestones);

  // কার্ডের প্রদর্শন তথ্য (slug → {banglaName, status})
  const cards = await SkillCardModel.find({}).select('slug banglaName title status moduleId').lean();
  const cardMap = new Map(cards.map((c: any) => [c.slug, c]));

  const moduleById = new Map(cc.modules.map((m) => [m.moduleId, m]));

  const milestones = cc.milestones.map((ms) => {
    const msUnlocked = !ms.unlockAfterMilestone || completedMilestones.has(ms.unlockAfterMilestone);

    const modules = (ms.moduleIds as string[]).map((modId) => {
      const mod = moduleById.get(modId);
      const modUnlocked = msUnlocked && (!mod.unlockAfterModule || completedModules.has(mod.unlockAfterModule));
      const slugs: string[] = mod.cardSlugs;
      const doneCount = slugs.filter((s) => doneSet.has(s)).length;

      return {
        moduleId: modId,
        titleBn: mod.titleBn,
        bonusXp: mod.bonusXp,
        unlocked: modUnlocked,
        completed: completedModules.has(modId),
        masteryPercent: slugs.length ? Math.round((doneCount / slugs.length) * 100) : 0,
        cards: slugs.map((s) => {
          const c = cardMap.get(s);
          const approved = c?.status === 'approved';
          return {
            slug: s,
            banglaName: c?.banglaName ?? s,
            completed: doneSet.has(s),
            approved,
            locked: !modUnlocked || !approved, // module বন্ধ অথবা এখনো approved নয়
          };
        }),
      };
    });

    return {
      milestoneId: ms.milestoneId,
      order: ms.order,
      titleBn: ms.titleBn,
      subtitleBn: ms.subtitleBn,
      bossProjectBn: ms.bossProjectBn,
      rewardXp: ms.rewardXp,
      unlocked: msUnlocked,
      completed: completedMilestones.has(ms.milestoneId),
      modules,
    };
  });

  return { milestones };
}
