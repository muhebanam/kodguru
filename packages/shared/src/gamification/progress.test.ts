import { describe, it, expect } from 'vitest';
import { dayDiff, nextStreak, computeAward } from './progress.js';

describe('streak logic', () => {
  it('dayDiff counts days', () => {
    expect(dayDiff('2026-06-01', '2026-06-01')).toBe(0);
    expect(dayDiff('2026-06-01', '2026-06-02')).toBe(1);
    expect(dayDiff('2026-06-01', '2026-06-05')).toBe(4);
  });

  it('nextStreak: first time = 1', () => {
    expect(nextStreak(null, '2026-06-10', 0)).toBe(1);
  });
  it('nextStreak: same day unchanged', () => {
    expect(nextStreak('2026-06-10', '2026-06-10', 5)).toBe(5);
  });
  it('nextStreak: consecutive day increments', () => {
    expect(nextStreak('2026-06-10', '2026-06-11', 5)).toBe(6);
  });
  it('nextStreak: gap resets to 1', () => {
    expect(nextStreak('2026-06-10', '2026-06-13', 5)).toBe(1);
  });
});

describe('computeAward', () => {
  const base = {
    cardLevel: 'beginner' as const,
    perfect: false,
    alreadyCompleted: false,
    prevXp: 0,
    prevStreakDays: 0,
    lastActiveDay: null,
    today: '2026-06-10',
    moduleJustCompleted: false,
    milestoneJustCompleted: false,
    isNewDay: true,
  };

  it('already completed → awards nothing (idempotent)', () => {
    const r = computeAward({ ...base, alreadyCompleted: true, prevXp: 50 });
    expect(r.awardedXp).toBe(0);
    expect(r.newXp).toBe(50);
  });

  it('first beginner card on new day: 10 base + 5 daily = 15', () => {
    const r = computeAward(base);
    // streak becomes 1 → x1.1 on base 10 = 11, + daily 5 = 16
    expect(r.awardedXp).toBe(16);
    expect(r.newStreakDays).toBe(1);
  });

  it('module + milestone bonuses stack', () => {
    const r = computeAward({
      ...base, isNewDay: false, lastActiveDay: '2026-06-10', prevStreakDays: 1,
      moduleJustCompleted: true, milestoneJustCompleted: true,
    });
    // base 10 x1.1 (streak1) = 11, +50 module +200 milestone = 261
    expect(r.bonuses.module).toBe(50);
    expect(r.bonuses.milestone).toBe(200);
    expect(r.awardedXp).toBe(261);
  });

  it('level up detected', () => {
    const r = computeAward({ ...base, prevXp: 95, cardLevel: 'intermediate' });
    expect(r.newXp).toBeGreaterThanOrEqual(100);
    expect(r.leveledUp).toBe(true);
    expect(r.newLevel).toBe(2);
  });
});
