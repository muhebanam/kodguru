import { describe, it, expect, beforeEach } from 'vitest';
import type { AiProvider } from './providers/provider.interface.js';
import { generateAiResponse } from './ai.manager.js';
import { cacheClear } from './cache.js';

/**
 * AI manager tests — নেটওয়ার্ক ছাড়াই fake provider দিয়ে।
 * যাচাই: fallback chain, configured-skip, cache.
 */

class FakeProvider implements AiProvider {
  constructor(
    public readonly name: string,
    private readonly configured: boolean,
    private readonly behavior: 'ok' | 'throw',
    private readonly reply = 'উত্তর',
  ) {}
  isConfigured() { return this.configured; }
  async chat(): Promise<string> {
    if (this.behavior === 'throw') throw new Error('ফেইল');
    return this.reply;
  }
}

const baseArgs = {
  slug: 'html5',
  mode: 'explain',
  systemPrompt: 'sp',
  messages: [{ role: 'user' as const, content: 'কী?' }],
};

describe('generateAiResponse', () => {
  beforeEach(() => cacheClear());

  it('প্রথম configured+সফল provider-এর উত্তর দেয়', async () => {
    const r = await generateAiResponse({
      ...baseArgs,
      providers: [new FakeProvider('gemini', true, 'ok', 'জেমিনাই উত্তর')],
    });
    expect(r.provider).toBe('gemini');
    expect(r.text).toBe('জেমিনাই উত্তর');
    expect(r.cached).toBe(false);
  });

  it('প্রথমটি throw করলে পরেরটায় fallback করে', async () => {
    const r = await generateAiResponse({
      ...baseArgs,
      messages: [{ role: 'user', content: 'fallback টেস্ট' }],
      providers: [
        new FakeProvider('gemini', true, 'throw'),
        new FakeProvider('groq', true, 'ok', 'গ্রক উত্তর'),
      ],
    });
    expect(r.provider).toBe('groq');
    expect(r.text).toBe('গ্রক উত্তর');
  });

  it('configured নয় এমন provider skip করে', async () => {
    const r = await generateAiResponse({
      ...baseArgs,
      messages: [{ role: 'user', content: 'skip টেস্ট' }],
      providers: [
        new FakeProvider('gemini', false, 'ok'),
        new FakeProvider('ollama', true, 'ok', 'অলামা উত্তর'),
      ],
    });
    expect(r.provider).toBe('ollama');
  });

  it('সবাই ব্যর্থ হলে দয়ালু বাংলা fallback বার্তা', async () => {
    const r = await generateAiResponse({
      ...baseArgs,
      messages: [{ role: 'user', content: 'সব ফেইল' }],
      providers: [new FakeProvider('gemini', true, 'throw')],
    });
    expect(r.provider).toBe('none');
    expect(r.text).toContain('ব্যস্ত');
  });

  it('একই প্রশ্ন দ্বিতীয়বার এলে cache থেকে দেয়', async () => {
    const args = {
      ...baseArgs,
      messages: [{ role: 'user' as const, content: 'cache টেস্ট অনন্য' }],
      providers: [new FakeProvider('gemini', true, 'ok', 'একবারই')],
    };
    const first = await generateAiResponse(args);
    expect(first.cached).toBe(false);
    const second = await generateAiResponse(args);
    expect(second.cached).toBe(true);
    expect(second.text).toBe('একবারই');
  });
});
