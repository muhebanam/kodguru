import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';
import { isProd } from '../config/env.js';

/**
 * কেন্দ্রীয় error handler — সব error একই খামে (envelope) ফেরত যায়:
 * { ok: false, error: { code, message, messageBn } }
 * messageBn সবসময় থাকবে, কারণ শিক্ষার্থী ইংরেজি জানে না।
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public messageBn: string,
  ) {
    super(message);
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      ok: false,
      error: { code: err.code, message: err.message, messageBn: err.messageBn },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '),
        messageBn: 'পাঠানো তথ্যে ভুল আছে। আবার দেখে চেষ্টা করুন।',
      },
    });
    return;
  }

  logger.error('Unhandled error', err);
  res.status(500).json({
    ok: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isProd ? 'Internal server error' : String(err),
      messageBn: 'সার্ভারে একটি সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।',
    },
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    ok: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
      messageBn: 'এই ঠিকানায় কিছু পাওয়া যায়নি।',
    },
  });
}
