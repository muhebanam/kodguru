import { describe, it, expect } from 'vitest';
import { checkHomeworkSubmission } from './homework-checker';

/**
 * Homework checker tests — Phase 4-এর rule-based checker নির্ভুল কাজ করে কিনা।
 * এই checker-ই শিক্ষার্থীকে তাৎক্ষণিক feedback দেয়, তাই এর সঠিকতা জরুরি।
 */
describe('checkHomeworkSubmission', () => {
  it('html_contains: সব tag থাকলে pass', () => {
    const r = checkHomeworkSubmission('<h1>হাই</h1><p>লেখা</p>', { type: 'html_contains', tags: ['h1', 'p'] });
    expect(r.passed).toBe(true);
  });

  it('html_contains: কোনো tag না থাকলে fail এবং missing জানায়', () => {
    const r = checkHomeworkSubmission('<h1>হাই</h1>', { type: 'html_contains', tags: ['h1', 'p', 'img'] });
    expect(r.passed).toBe(false);
    expect((r.details?.missing as string[]) ?? []).toEqual(expect.arrayContaining(['p', 'img']));
  });

  it('css_contains: property ও selector দুটোই দরকার', () => {
    const ok = checkHomeworkSubmission('.box { color: red; }', {
      type: 'css_contains', properties: ['color'], selectors: ['.box'],
    });
    expect(ok.passed).toBe(true);

    const bad = checkHomeworkSubmission('div { margin: 0; }', {
      type: 'css_contains', properties: ['color'], selectors: ['.box'],
    });
    expect(bad.passed).toBe(false);
  });

  it('js_contains: keyword খোঁজে', () => {
    expect(checkHomeworkSubmission('const x = 1;', { type: 'js_contains', keywords: ['const'] }).passed).toBe(true);
    expect(checkHomeworkSubmission('var x = 1;', { type: 'js_contains', keywords: ['const'] }).passed).toBe(false);
  });

  it('text_min_length: কম লিখলে fail', () => {
    expect(checkHomeworkSubmission('ছোট', { type: 'text_min_length', minLength: 50 }).passed).toBe(false);
    expect(checkHomeworkSubmission('ক'.repeat(60), { type: 'text_min_length', minLength: 50 }).passed).toBe(true);
  });

  it('checklist: সবসময় pass (teacher পরে দেখবে)', () => {
    expect(checkHomeworkSubmission('', { type: 'checklist', items: ['a', 'b'] }).passed).toBe(true);
  });

  it('rule নেই: pass, teacher review বার্তা', () => {
    expect(checkHomeworkSubmission('যেকোনো কিছু', {}).passed).toBe(true);
  });

  it('অজানা type: fail, বাংলায় জানায়', () => {
    const r = checkHomeworkSubmission('x', { type: 'banana' });
    expect(r.passed).toBe(false);
    expect(r.messageBn).toContain('অজানা');
  });
});
