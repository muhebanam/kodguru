import { env } from '../../config/env.js';

/**
 * প্রতি-user AI rate limit (endpoint-level aiLimiter-এর উপরে অতিরিক্ত স্তর)।
 * এক user যাতে পুরো free quota একা শেষ না করে। in-memory, প্রতি মিনিটে রিসেট।
 */
const counters = new Map<string, { count: number; resetAt: number }>();

export function allowUserRequest(userId: string): boolean {
  const now = Date.now();
  const entry = counters.get(userId);
  if (!entry || now > entry.resetAt) {
    counters.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= env.AI_USER_RPM) return false;
  entry.count++;
  return true;
}

export function resetUserLimits(): void {
  counters.clear();
}
