import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { loginSchema, publicUserSchema, registerSchema } from '@kodguru/shared';
import { AppError } from '../../middleware/error-handler.js';
import { UserModel } from '../../models/user.model.js';
import { clearAuthCookies, setAuthCookies } from './auth.utils.js';

function ensureDbConnected(): void {
  if (mongoose.connection.readyState !== 1) {
    throw new AppError(503, 'DB_DISCONNECTED', 'Database is not connected', 'ডাটাবেস connected নয়। একটু পরে আবার চেষ্টা করুন।');
  }
}

function toPublicUser(user: any) {
  return publicUserSchema.parse({
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    xp: user.xp ?? 0,
    badges: user.badges ?? [],
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : new Date().toISOString(),
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  ensureDbConnected();
  const input = registerSchema.parse(req.body);
  const email = input.email.toLowerCase().trim();

  const existing = await UserModel.exists({ email });
  if (existing) {
    throw new AppError(409, 'EMAIL_EXISTS', 'Email already registered', 'এই ইমেইল দিয়ে আগে থেকেই অ্যাকাউন্ট আছে।');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await UserModel.create({ name: input.name.trim(), email, passwordHash, role: 'student' });
  const publicUser = toPublicUser(user);

  setAuthCookies(res, { sub: publicUser.id, email: publicUser.email, role: publicUser.role });
  res.status(201).json({ ok: true, data: { user: publicUser } });
}

export async function login(req: Request, res: Response): Promise<void> {
  ensureDbConnected();
  const input = loginSchema.parse(req.body);
  const email = input.email.toLowerCase().trim();

  const user = await UserModel.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password', 'ইমেইল বা পাসওয়ার্ড ঠিক নেই।');
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password', 'ইমেইল বা পাসওয়ার্ড ঠিক নেই।');
  }

  const publicUser = toPublicUser(user);
  setAuthCookies(res, { sub: publicUser.id, email: publicUser.email, role: publicUser.role });
  res.json({ ok: true, data: { user: publicUser } });
}

export async function me(req: Request, res: Response): Promise<void> {
  ensureDbConnected();
  if (!req.user) {
    throw new AppError(401, 'AUTH_REQUIRED', 'Authentication required', 'আগে লগইন করুন।');
  }

  const user = await UserModel.findById(req.user.id);
  if (!user) {
    clearAuthCookies(res);
    throw new AppError(401, 'USER_NOT_FOUND', 'User not found', 'এই ব্যবহারকারী পাওয়া যায়নি। আবার লগইন করুন।');
  }

  res.json({ ok: true, data: { user: toPublicUser(user) } });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  clearAuthCookies(res);
  res.json({ ok: true, data: { message: 'Logged out', messageBn: 'লগআউট সম্পন্ন হয়েছে।' } });
}
