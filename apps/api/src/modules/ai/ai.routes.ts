import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { aiLimiter } from '../../middleware/rate-limit.js';
import { aiChat } from './ai.controller.js';

/**
 * AI routes — সবগুলো লগইন-করা user-এর জন্য, aiLimiter দিয়ে সুরক্ষিত।
 * POST /api/ai/chat
 */
export const aiRouter = Router();
aiRouter.post('/chat', aiLimiter, authenticate, aiChat);
