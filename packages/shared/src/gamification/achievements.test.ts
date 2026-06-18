import { describe, it, expect } from 'vitest';
import { computeAchievements, earnedCount } from './achievements.js';

const base = { level: 1, streakDays: 0, completedCards: 0, completedModules: 0, completedMilestones: 0 };

describe('achievements', () => {
  it('nothing earned at start', () => {
    expect(earnedCount(base)).toBe(0);
  });
  it('first card unlocks first_card', () => {
    const a = computeAchievements({ ...base, completedCards: 1 });
    expect(a.find((x) => x.id === 'first_card')?.earned).toBe(true);
    expect(a.find((x) => x.id === 'ten_cards')?.earned).toBe(false);
  });
  it('streak + level thresholds', () => {
    const a = computeAchievements({ ...base, streakDays: 7, level: 30 });
    expect(a.find((x) => x.id === 'streak_3')?.earned).toBe(true);
    expect(a.find((x) => x.id === 'streak_7')?.earned).toBe(true);
    expect(a.find((x) => x.id === 'streak_30')?.earned).toBe(false);
    expect(a.find((x) => x.id === 'level_30')?.earned).toBe(true);
    expect(a.find((x) => x.id === 'level_60')?.earned).toBe(false);
  });
  it('all 132 cards = guru', () => {
    expect(computeAchievements({ ...base, completedCards: 132 }).find((x) => x.id === 'all_cards')?.earned).toBe(true);
  });
});
