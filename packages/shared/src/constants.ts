/**
 * কোড গুরু — প্ল্যাটফর্মের কেন্দ্রীয় constant তালিকা।
 * Frontend, backend — সবাই এখান থেকেই এই মানগুলো ব্যবহার করবে,
 * যাতে কোথাও বানান বা মান নিয়ে অমিল না হয়।
 */

/** ব্যবহারকারীর ভূমিকা (role) */
export const ROLES = ['student', 'teacher', 'admin'] as const;
export type Role = (typeof ROLES)[number];

/** Skill Card-এর অবস্থা (content review workflow) */
export const CARD_STATUSES = ['draft', 'reviewed', 'approved', 'rejected'] as const;
export type CardStatus = (typeof CARD_STATUSES)[number];

/** Skill Card-এর বিভাগ — Phase 3-এ আরও যোগ হবে */
export const CARD_CATEGORIES = [
  'tools',        // VS Code, Git, Terminal
  'markup',       // HTML5
  'styling',      // CSS3, Tailwind
  'programming',  // JavaScript, TypeScript
  'framework',    // React, Next.js
  'backend',      // Node, Express
  'database',     // MongoDB
  'ai',           // AI tools
  'engineering',  // SE concepts, deployment
] as const;
export type CardCategory = (typeof CARD_CATEGORIES)[number];

/** শেখার স্তর */
export const LEVELS = ['beginner', 'elementary', 'intermediate'] as const;
export type Level = (typeof LEVELS)[number];

/** কুইজ প্রশ্নের ধরন */
export const QUIZ_TYPES = ['mcq', 'true_false', 'fill_blank'] as const;
export type QuizType = (typeof QUIZ_TYPES)[number];
