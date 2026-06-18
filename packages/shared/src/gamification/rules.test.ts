import { describe, it, expect } from 'vitest';
import {
  xpForCardLevel, levelForXp, levelTier, streakMultiplier,
  xpForCardCompletion, masteryPercent, xpProgressInLevel,
} from './rules.js';

describe('gamification rules', () => {
  it('XP by card level', () => {
    expect(xpForCardLevel('beginner')).toBe(10);
    expect(xpForCardLevel('elementary')).toBe(20);
    expect(xpForCardLevel('intermediate')).toBe(40);
  });

  it('level from XP (100 XP = 1 level, cap 100)', () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(99)).toBe(1);
    expect(levelForXp(100)).toBe(2);
    expect(levelForXp(550)).toBe(6);
    expect(levelForXp(999999)).toBe(100);
  });

  it('level tiers', () => {
    expect(levelTier(1).key).toBe('beginner');
    expect(levelTier(11).key).toBe('intermediate');
    expect(levelTier(31).key).toBe('advanced');
    expect(levelTier(61).key).toBe('expert');
  });

  it('streak multiplier steps', () => {
    expect(streakMultiplier(0)).toBe(1.0);
    expect(streakMultiplier(1)).toBe(1.1);
    expect(streakMultiplier(3)).toBe(1.25);
    expect(streakMultiplier(7)).toBe(1.5);
    expect(streakMultiplier(30)).toBe(2.0);
    expect(streakMultiplier(100)).toBe(2.0);
  });

  it('card completion XP: perfect + streak stack', () => {
    // beginner 10, perfect +10% = 11, streak 7d x1.5 = 16.5 → 17
    expect(xpForCardCompletion({ cardLevel: 'beginner', perfect: true, streakDays: 7 })).toBe(17);
    // intermediate 40, no perfect, no streak = 40
    expect(xpForCardCompletion({ cardLevel: 'intermediate', perfect: false, streakDays: 0 })).toBe(40);
  });

  it('mastery + progress', () => {
    expect(masteryPercent(3, 4)).toBe(75);
    expect(masteryPercent(0, 0)).toBe(0);
    expect(xpProgressInLevel(150).percent).toBe(50);
  });
});
