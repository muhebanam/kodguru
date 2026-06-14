import { z } from 'zod';
import { ROLES } from '../constants.js';

/**
 * User schemas — Phase 2-তে auth route গুলো এগুলোই ব্যবহার করবে।
 * Phase 1-এ শুধু shape ঠিক করে রাখা হলো, যাতে DB model আগে থেকেই সঠিক হয়।
 */

export const registerSchema = z.object({
  name: z.string().min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে').max(60),
  email: z.string().email('সঠিক ইমেইল দিন'),
  password: z.string().min(8, 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে').max(72),
});

export const loginSchema = z.object({
  email: z.string().email('সঠিক ইমেইল দিন'),
  password: z.string().min(1, 'পাসওয়ার্ড দিন'),
});

/** Client-কে পাঠানোর নিরাপদ user shape — password hash কখনোই নয় */
export const publicUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(ROLES),
  xp: z.number().int().min(0).default(0),
  badges: z.array(z.string()).default([]),
  createdAt: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PublicUser = z.infer<typeof publicUserSchema>;
