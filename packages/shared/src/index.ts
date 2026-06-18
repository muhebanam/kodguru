/** @kodguru/shared — পুরো প্ল্যাটফর্মের একমাত্র type/schema উৎস */
export * from './constants.js';
export * from './schemas/skill-card.schema.js';
export * from './schemas/user.schema.js';
export * from './checker/homework-checker.js';
export * from './schemas/ai.schema.js';
export * from './gamification/rules.js';
export * from './gamification/progress.js';
export * from './gamification/achievements.js';
export * from './schemas/progress.schema.js';

/** সব API response-এর সাধারণ খাম (envelope) */
export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; messageBn: string } };
