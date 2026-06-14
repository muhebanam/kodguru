import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import type { Response } from 'express';
import type { Role } from '@kodguru/shared';
import { env, isProd } from '../../config/env.js';

export type AuthTokenPayload = {
  sub: string;
  email: string;
  role: Role;
};

export const ACCESS_COOKIE = 'kodguru_access';
export const REFRESH_COOKIE = 'kodguru_refresh';

const cookieBase = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ('none' as const) : ('lax' as const),
  path: '/',
};

export function signAccessToken(payload: AuthTokenPayload): string {
  const options: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET as Secret, options);
}

export function signRefreshToken(payload: AuthTokenPayload): string {
  const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET as Secret, options);
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET as Secret) as AuthTokenPayload;
}

export function verifyRefreshToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET as Secret) as AuthTokenPayload;
}

export function setAuthCookies(res: Response, payload: AuthTokenPayload): void {
  res.cookie(ACCESS_COOKIE, signAccessToken(payload), {
    ...cookieBase,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie(REFRESH_COOKIE, signRefreshToken(payload), {
    ...cookieBase,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, cookieBase);
  res.clearCookie(REFRESH_COOKIE, cookieBase);
}
