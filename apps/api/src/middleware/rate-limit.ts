import rateLimit from 'express-rate-limit';

const rateLimitMessage = {
  ok: false,
  error: {
    code: 'RATE_LIMITED',
    message: 'Too many requests',
    messageBn: 'অনেক বেশি অনুরোধ পাঠানো হয়েছে। একটু বিশ্রাম নিয়ে আবার চেষ্টা করুন।',
  },
};

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: rateLimitMessage,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: rateLimitMessage,
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 12,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: rateLimitMessage,
});
