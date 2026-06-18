import type { Level } from '../constants.js';
import { xpForCardCompletion, BONUS_XP, levelForXp } from './rules.js';

/**
 * Progress/streak হিসাব — pure ও testable। DB-র সাথে কোনো সম্পর্ক নেই,
 * তাই server নিশ্চিন্তে এগুলো ব্যবহার করতে পারে এবং unit-test হয়।
 * তারিখ "YYYY-MM-DD" string হিসেবে (UTC দিন) ধরা হয়।
 */

/** দুই দিনের মধ্যে কত দিনের ব্যবধান (b - a) */
export function dayDiff(a: string, b: string): number {
  const da = Date.parse(a + 'T00:00:00Z');
  const db = Date.parse(b + 'T00:00:00Z');
  return Math.round((db - da) / 86_400_000);
}

/** আজকের completion-এর পর নতুন streak সংখ্যা */
export function nextStreak(lastActiveDay: string | null, today: string, prevStreak: number): number {
  if (!lastActiveDay) return 1;            // প্রথমবার
  const diff = dayDiff(lastActiveDay, today);
  if (diff === 0) return Math.max(prevStreak, 1); // একই দিনে — অপরিবর্তিত
  if (diff === 1) return prevStreak + 1;          // পরপর দিন — বাড়ল
  return 1;                                        // ফাঁক পড়েছে — রিসেট
}

export interface AwardInput {
  cardLevel: Level;
  perfect: boolean;            // কুইজ ১০০%
  alreadyCompleted: boolean;   // আগে শেষ করেছে কিনা (idempotency)
  prevXp: number;
  prevStreakDays: number;
  lastActiveDay: string | null;
  today: string;
  moduleJustCompleted: boolean;   // এই কার্ডে module শেষ হলো?
  milestoneJustCompleted: boolean;// এই কার্ডে milestone শেষ হলো?
  isNewDay: boolean;              // আজ প্রথম activity?
}

export interface AwardResult {
  awardedXp: number;
  newXp: number;
  newLevel: number;
  newStreakDays: number;
  leveledUp: boolean;
  bonuses: { perfect: boolean; daily: number; module: number; milestone: number };
}

/**
 * একটি কার্ড শেষ করলে কত XP, নতুন total, level, streak — সব হিসাব।
 * আগে শেষ করা থাকলে কিছুই দেওয়া হয় না (double-award আটকানো)।
 */
export function computeAward(input: AwardInput): AwardResult {
  const prevLevel = levelForXp(input.prevXp);

  if (input.alreadyCompleted) {
    return {
      awardedXp: 0,
      newXp: input.prevXp,
      newLevel: prevLevel,
      newStreakDays: input.prevStreakDays,
      leveledUp: false,
      bonuses: { perfect: false, daily: 0, module: 0, milestone: 0 },
    };
  }

  const streakDays = nextStreak(input.lastActiveDay, input.today, input.prevStreakDays);

  // base + perfect + streak গুণক
  let awarded = xpForCardCompletion({
    cardLevel: input.cardLevel,
    perfect: input.perfect,
    streakDays,
  });

  const dailyBonus = input.isNewDay ? BONUS_XP.dailyStreak : 0;
  const moduleBonus = input.moduleJustCompleted ? BONUS_XP.moduleComplete : 0;
  const milestoneBonus = input.milestoneJustCompleted ? BONUS_XP.milestoneComplete : 0;
  awarded += dailyBonus + moduleBonus + milestoneBonus;

  const newXp = input.prevXp + awarded;
  const newLevel = levelForXp(newXp);

  return {
    awardedXp: awarded,
    newXp,
    newLevel,
    newStreakDays: streakDays,
    leveledUp: newLevel > prevLevel,
    bonuses: {
      perfect: input.perfect,
      daily: dailyBonus,
      module: moduleBonus,
      milestone: milestoneBonus,
    },
  };
}
