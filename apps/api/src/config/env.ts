import 'dotenv/config';
import { z } from 'zod';

/**
 * Environment validation.
 * Development/test mode-এ MongoDB URI না থাকলেও API boot করতে পারবে,
 * যাতে /api/health থেকে db: disconnected দেখা যায়।
 * Production-এ MongoDB URI এবং real JWT secrets বাধ্যতামূলক।
 */
const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    MONGODB_URI: z.string().optional().default(''),
    CLIENT_ORIGIN: z.string().url().default('http://localhost:3000'),

    JWT_ACCESS_SECRET: z.string().min(8).default('change-me-access'),
    JWT_REFRESH_SECRET: z.string().min(8).default('change-me-refresh'),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    // Phase 5: AI providers — খালি থাকতে পারে
    GEMINI_API_KEY: z.string().optional().default(''),
    GROQ_API_KEY: z.string().optional().default(''),
    OLLAMA_BASE_URL: z.string().optional().default(''),
    AI_PROVIDER_ORDER: z.string().optional().default('gemini,groq,ollama'),
    // মডেলের নাম env থেকে — কখনো hardcode নয় (নাম দ্রুত বদলায়)
    GEMINI_MODEL: z.string().default('gemini-2.5-flash-lite'),
    GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),
    OLLAMA_MODEL: z.string().default('llama3'),
    AI_USER_RPM: z.coerce.number().int().min(1).default(15), // প্রতি user প্রতি মিনিটে
    // seed script-এর প্রথম admin (bootstrap)
    ADMIN_EMAIL: z.string().email().optional(),
    ADMIN_PASSWORD: z.string().min(8).optional(),
    ADMIN_NAME: z.string().optional().default('Admin'),
  })
  .superRefine((value, ctx) => {
    if (value.NODE_ENV === 'production') {
      if (!value.MONGODB_URI) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['MONGODB_URI'],
          message: 'Production-এ MONGODB_URI বাধ্যতামূলক',
        });
      }
      if (value.JWT_ACCESS_SECRET === 'change-me-access') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_ACCESS_SECRET'],
          message: 'Production-এ default JWT_ACCESS_SECRET ব্যবহার করা যাবে না',
        });
      }
      if (value.JWT_REFRESH_SECRET === 'change-me-refresh') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_REFRESH_SECRET'],
          message: 'Production-এ default JWT_REFRESH_SECRET ব্যবহার করা যাবে না',
        });
      }
      if (value.JWT_ACCESS_SECRET === value.JWT_REFRESH_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_REFRESH_SECRET'],
          message: 'Access secret ও refresh secret আলাদা হতে হবে',
        });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Environment config ভুল আছে:');
  for (const issue of parsed.error.issues) {
    console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
