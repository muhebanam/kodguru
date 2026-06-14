import type { AiChatResult, AiMessage } from '@kodguru/shared';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import type { AiProvider } from './providers/provider.interface.js';
import { GeminiProvider } from './providers/gemini.provider.js';
import { GroqProvider } from './providers/groq.provider.js';
import { OllamaProvider } from './providers/ollama.provider.js';
import { cacheGet, cacheKey, cacheSet } from './cache.js';

/**
 * AI manager — fallback chain।
 * env.AI_PROVIDER_ORDER অনুযায়ী provider গুলো একে একে চেষ্টা করে।
 * একটা configured ও সফল হলে তার উত্তর; সবাই ব্যর্থ হলে দয়ালু বাংলা বার্তা।
 * cache আগে দেখা হয় — একই প্রশ্নে quota নষ্ট হয় না।
 *
 * providers inject করা যায় (test-এর জন্য); না দিলে env অনুযায়ী বানায়।
 */
const REGISTRY: Record<string, () => AiProvider> = {
  gemini: () => new GeminiProvider(),
  groq: () => new GroqProvider(),
  ollama: () => new OllamaProvider(),
};

function defaultChain(): AiProvider[] {
  return env.AI_PROVIDER_ORDER.split(',')
    .map((n) => n.trim())
    .filter((n) => REGISTRY[n])
    .map((n) => REGISTRY[n]!());
}

export async function generateAiResponse(params: {
  slug: string;
  mode: string;
  systemPrompt: string;
  messages: AiMessage[];
  providers?: AiProvider[]; // test override
}): Promise<AiChatResult> {
  const { slug, mode, systemPrompt, messages } = params;

  // ১) cache
  const key = cacheKey(slug, mode, messages);
  const cached = cacheGet(key);
  if (cached) {
    return { text: cached, provider: 'cache', model: 'cached', cached: true };
  }

  // ২) fallback chain
  const chain = params.providers ?? defaultChain();
  for (const provider of chain) {
    if (!provider.isConfigured()) {
      logger.info(`AI: ${provider.name} configured নয়, পরেরটায় যাই`);
      continue;
    }
    try {
      const text = await provider.chat(systemPrompt, messages);
      cacheSet(key, text);
      const model =
        provider.name === 'gemini' ? env.GEMINI_MODEL
        : provider.name === 'groq' ? env.GROQ_MODEL
        : provider.name === 'ollama' ? env.OLLAMA_MODEL
        : 'unknown';
      return { text, provider: provider.name, model, cached: false };
    } catch (err) {
      logger.warn(`AI: ${provider.name} ব্যর্থ, fallback`, err);
    }
  }

  // ৩) সবাই ব্যর্থ
  return {
    text: 'এখন AI শিক্ষক একটু ব্যস্ত আছে। কিছুক্ষণ পর আবার চেষ্টা করো — অথবা পাঠটা আরেকবার পড়ে দেখো।',
    provider: 'none',
    model: 'fallback',
    cached: false,
  };
}
