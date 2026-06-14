import { createHash } from 'node:crypto';
import type { AiMessage } from '@kodguru/shared';

/**
 * সহজ in-memory cache — একই প্রশ্ন বারবার এলে API call বাঁচায়
 * (free quota রক্ষা করে)। সার্ভার restart-এ মুছে যায় — personal/small scale-এ ঠিক আছে।
 * সীমা: সর্বশেষ ~300টি; পূর্ণ হলে সবচেয়ে পুরোনোটা বাদ।
 */
const MAX_ENTRIES = 300;
const store = new Map<string, string>();

export function cacheKey(slug: string, mode: string, messages: AiMessage[]): string {
  const raw = JSON.stringify({ slug, mode, messages });
  return createHash('sha256').update(raw).digest('hex');
}

export function cacheGet(key: string): string | undefined {
  return store.get(key);
}

export function cacheSet(key: string, value: string): void {
  if (store.size >= MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest) store.delete(oldest);
  }
  store.set(key, value);
}

/** test-এর জন্য */
export function cacheClear(): void {
  store.clear();
}
