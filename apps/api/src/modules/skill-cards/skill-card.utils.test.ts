import { describe, expect, it } from 'vitest';
import { canSetStatus, duplicateSlugs, normalizeSlug, parseCardsPayload, visibleStatusFilter } from './skill-card.utils.js';

const baseCard = {
  slug: 'html5',
  title: 'HTML5',
  banglaName: 'এইচটিএমএল ফাইভ',
  pronunciation: 'এইচ টি এম এল ফাইভ',
  category: 'markup',
  level: 'beginner',
  simpleMeaning: 'ওয়েব পেজের গঠন বানানোর ভাষা।',
  villageAnalogy: 'ঘর বানাতে খুঁটি লাগে, ওয়েব পেজ বানাতে HTML লাগে।',
  whyLearn: 'ওয়েবসাইটের গঠন বানাতে HTML জানা দরকার।',
  learningGoals: ['basic webpage বানাতে পারবে'],
  lessonSteps: [{ order: 1, title: 'HTML কী', content: 'HTML দিয়ে structure বানানো হয়।' }],
  examples: [],
  codeExamples: [],
  commonMistakes: [],
  practiceTasks: [],
  homework: [],
  quiz: [{ type: 'mcq', question: 'HTML কী?', options: ['গঠন', 'রং'], correctAnswer: 'গঠন', explanation: 'HTML structure বানায়।' }],
  aiTeacherGuide: 'সহজ বাংলায় শেখাও।',
  status: 'approved',
  estimatedTime: 20,
  prerequisites: [],
  nextSkills: [],
};

describe('skill card utils', () => {
  it('normalizes title to url-safe slug', () => {
    expect(normalizeSlug('CSS Grid Layout')).toBe('css-grid-layout');
  });

  it('student/public can only see approved cards', () => {
    expect(visibleStatusFilter(undefined)).toEqual({ status: 'approved' });
    expect(visibleStatusFilter('student')).toEqual({ status: 'approved' });
    expect(visibleStatusFilter('admin')).toEqual({});
  });

  it('parses import payload and detects duplicate slugs', () => {
    const parsed = parseCardsPayload({ dryRun: true, cards: [baseCard, { ...baseCard }] });
    expect(parsed.cards).toHaveLength(2);
    expect(duplicateSlugs(parsed.cards)).toEqual(['html5']);
  });
});

describe('review workflow permissions (canSetStatus)', () => {
  it('teacher শুধু reviewed/rejected করতে পারে, approved নয়', () => {
    expect(canSetStatus('teacher', 'reviewed')).toBe(true);
    expect(canSetStatus('teacher', 'rejected')).toBe(true);
    expect(canSetStatus('teacher', 'approved')).toBe(false);
    expect(canSetStatus('teacher', 'draft')).toBe(false);
  });

  it('admin যেকোনো status দিতে পারে (প্রকাশ সহ)', () => {
    expect(canSetStatus('admin', 'approved')).toBe(true);
    expect(canSetStatus('admin', 'rejected')).toBe(true);
    expect(canSetStatus('admin', 'draft')).toBe(true);
  });

  it('student কোনো status বদলাতে পারে না', () => {
    expect(canSetStatus('student', 'reviewed')).toBe(false);
    expect(canSetStatus('student', 'approved')).toBe(false);
  });

  it('visibleStatusFilter: student শুধু approved দেখে, teacher/admin সব', () => {
    expect(visibleStatusFilter('student')).toEqual({ status: 'approved' });
    expect(visibleStatusFilter('teacher', 'draft')).toEqual({ status: 'draft' });
    expect(visibleStatusFilter('admin')).toEqual({});
  });
});
