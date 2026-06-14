import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@kodguru/shared';
import { AppError } from './error-handler.js';
import { ACCESS_COOKIE, verifyAccessToken } from '../modules/auth/auth.utils.js';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[ACCESS_COOKIE];
  if (!token) {
    next(new AppError(401, 'AUTH_REQUIRED', 'Authentication required', 'আগে লগইন করুন।'));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    next(new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token', 'লগইন সেশন শেষ হয়েছে। আবার লগইন করুন।'));
  }
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[ACCESS_COOKIE];
  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
  } catch {
    // Public read routes-এ token নষ্ট থাকলেও approved content দেখা যাবে।
  }
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'AUTH_REQUIRED', 'Authentication required', 'আগে লগইন করুন।'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError(403, 'FORBIDDEN', 'Forbidden', 'এই কাজ করার অনুমতি আপনার নেই।'));
      return;
    }

    next();
  };
}
