import type { Request, Response, NextFunction } from 'express';
import type { SkillCard } from '@kodguru/shared';
import { aiChatRequestSchema, checkHomeworkSubmission } from '@kodguru/shared';
import { AppError } from '../../middleware/error-handler.js';
import { SkillCardModel } from '../../models/skill-card.model.js';
import { buildSystemPrompt } from './prompt-builder.js';
import { generateAiResponse } from './ai.manager.js';
import { allowUserRequest } from './rate-limit.js';

/**
 * POST /api/ai/chat — AI টিউটরের সাথে কথা।
 * গার্ডরেইল ক্রম:
 *  1. লগইন আবশ্যক (authenticate middleware আগে চলে)।
 *  2. প্রতি-user rate limit।
 *  3. শুধু APPROVED card-এর context ব্যবহার — draft/rejected হলে AI সাহায্য করবে না।
 *     (অননুমোদিত content দিয়ে AI পড়াবে না — এটাই hallucination + content guardrail।)
 *  4. 'check' mode-এ আগে rule-based static check, তারপর AI সেই ফলাফল ব্যাখ্যা করে।
 */
export async function aiChat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError(401, 'AUTH_REQUIRED', 'Login required', 'আগে লগইন করুন।');
    }

    if (!allowUserRequest(userId)) {
      throw new AppError(
        429,
        'AI_RATE_LIMITED',
        'Too many AI requests',
        'একটু আস্তে! কিছুক্ষণ পর আবার AI শিক্ষককে জিজ্ঞেস করো।',
      );
    }

    const body = aiChatRequestSchema.parse(req.body);

    // শুধু approved card — AI অননুমোদিত content দিয়ে পড়াবে না
    const cardDoc = await SkillCardModel.findOne({ slug: body.slug, status: 'approved' }).lean();
    if (!cardDoc) {
      throw new AppError(
        404,
        'CARD_NOT_AVAILABLE',
        'Approved card not found',
        'এই পাঠটি এখনো প্রস্তুত নয়। অনুমোদিত পাঠ নিয়েই AI শিক্ষক সাহায্য করতে পারে।',
      );
    }
    const card = cardDoc as unknown as SkillCard;

    // 'check' mode: আগে deterministic check, তারপর AI ব্যাখ্যা
    let checkResultBn: string | undefined;
    if (body.mode === 'check' && body.code) {
      // card category থেকে সহজ rule বানাই (homework rule না থাকলে)
      const rule =
        card.category === 'styling'
          ? { type: 'css_contains', properties: ['color'], selectors: [] }
          : card.category === 'markup'
            ? { type: 'html_contains', tags: ['h1', 'p'] }
            : { type: 'text_min_length', minLength: 10 };
      checkResultBn = checkHomeworkSubmission(body.code, rule).messageBn;
    }

    const systemPrompt = buildSystemPrompt(card, body.mode, checkResultBn);
    const result = await generateAiResponse({
      slug: body.slug,
      mode: body.mode,
      systemPrompt,
      messages: body.messages,
    });

    res.json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}
