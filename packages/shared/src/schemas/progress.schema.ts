import { z } from 'zod';

/** কার্ড শেষ করার request — quizScore ০–১০০ */
export const completeCardSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  quizScore: z.number().min(0).max(100).default(0),
});
export type CompleteCardInput = z.infer<typeof completeCardSchema>;
