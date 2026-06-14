import { z } from 'zod';

/**
 * AI টিউটর chat request schema।
 * api (validation) ও web (form typing) দুই জায়গায় এক উৎস।
 */

/** AI-এর সাথে কথোপকথনের একটি বার্তা */
export const aiMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
});

/**
 * Mode — শিক্ষার্থী কোন সাহায্য চাইছে:
 * explain  = স্বাভাবিক ব্যাখ্যা
 * simpler  = আরও সহজ করে বলো
 * village  = গ্রামের উদাহরণ দাও
 * homework = হোমওয়ার্ক দাও
 * check    = আমার কোড check করো (আগে rule-based check, পরে AI ব্যাখ্যা)
 */
export const AI_MODES = ['explain', 'simpler', 'village', 'homework', 'check'] as const;
export type AiMode = (typeof AI_MODES)[number];

export const aiChatRequestSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/), // কোন Skill Card-এর context
  mode: z.enum(AI_MODES).default('explain'),
  messages: z.array(aiMessageSchema).min(1).max(20),
  code: z.string().max(8000).optional(), // 'check' mode-এ শিক্ষার্থীর কোড
});

export type AiMessage = z.infer<typeof aiMessageSchema>;
export type AiChatRequest = z.infer<typeof aiChatRequestSchema>;

export interface AiChatResult {
  text: string;
  provider: string; // gemini | groq | ollama | none
  model: string;
  cached: boolean;
}
