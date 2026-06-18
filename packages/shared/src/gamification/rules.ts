import type { Level } from '../constants.js';

/**
 * Gamification core — সব XP/level/streak হিসাব এখানে, pure function হিসেবে।
 * server ও client এক উৎস ব্যবহার করবে, তাই হিসাব কখনো অমিল হবে না।
 * (Duolingo + RPG ধাঁচ — শেখায় আসক্তি তৈরি করতে।)
 */

/** কার্ডের level অনুযায়ী base XP */
export function xpForCardLevel(level: Level): number {
  if (level === 'beginner') return 10;
  if (level === 'elementary') return 20;
  return 40; // intermediate (advanced)
}

/** মোট XP থেকে level (১০০ XP = ১ level, সর্বোচ্চ ১০০) */
export function levelForXp(totalXp: number): number {
  const lvl = Math.floor(Math.max(0, totalXp) / 100) + 1;
  return Math.min(lvl, 100);
}

/** পরের level-এ যেতে আর কত XP লাগবে (progress bar-এর জন্য) */
export function xpProgressInLevel(totalXp: number): { current: number; needed: number; percent: number } {
  const into = Math.max(0, totalXp) % 100;
  return { current: into, needed: 100, percent: Math.round(into) };
}

/** level → RPG tier (Bengali label) */
export function levelTier(level: number): { key: string; labelBn: string } {
  if (level <= 10) return { key: 'beginner', labelBn: 'নবীন শিক্ষার্থী' };
  if (level <= 30) return { key: 'intermediate', labelBn: 'মাঝারি কোডার' };
  if (level <= 60) return { key: 'advanced', labelBn: 'দক্ষ ডেভেলপার' };
  return { key: 'expert', labelBn: 'AI ডেভেলপার (এক্সপার্ট)' };
}

/** streak (পরপর দিন) → XP গুণক */
export function streakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 2.0;
  if (streakDays >= 7) return 1.5;
  if (streakDays >= 3) return 1.25;
  if (streakDays >= 1) return 1.1;
  return 1.0;
}

/**
 * একটি কার্ড শেষ করলে অর্জিত XP।
 * perfect (কুইজ ১০০%) = +১০% bonus; এরপর streak গুণক।
 */
export function xpForCardCompletion(params: {
  cardLevel: Level;
  perfect: boolean;
  streakDays: number;
}): number {
  let xp = xpForCardLevel(params.cardLevel);
  if (params.perfect) xp = Math.round(xp * 1.1);
  xp = Math.round(xp * streakMultiplier(params.streakDays));
  return xp;
}

/** bonus XP ধ্রুবক */
export const BONUS_XP = {
  dailyStreak: 5,    // প্রতিদিন streak বজায় রাখলে
  moduleComplete: 50,
  milestoneComplete: 200,
  retry: 2,          // ব্যর্থ হয়ে আবার চেষ্টা করলে সামান্য উৎসাহ (শাস্তি নয়)
} as const;

/** mastery bar: একটি module-এ কত কার্ড শেষ → শতাংশ */
export function masteryPercent(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}
