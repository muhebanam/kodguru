import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { globalLimiter } from './middleware/rate-limit.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { healthRouter } from './routes/health.route.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { adminRouter } from './routes/admin.route.js';
import { skillCardRouter } from './modules/skill-cards/skill-card.routes.js';
import { aiRouter } from './modules/ai/ai.routes.js';
import { progressRouter } from './modules/progress/progress.routes.js';

/**
 * Express app — middleware-এর ক্রম গুরুত্বপূর্ণ:
 * helmet → cors → cookie → json → rateLimit → routes → 404 → errorHandler
 */
export function createApp() {
  const app = express();

  // Render/প্রক্সির পেছনে সঠিক client IP পেতে (rate limit-এর জন্য জরুরি)
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true, // HTTPOnly cookie auth-এর জন্য (Phase 2)
    }),
  );
  app.use(cookieParser());
  app.use(express.json({ limit: '6mb' })); // বড় payload আটকানো
  app.use(globalLimiter);

  // ---- Routes ----
  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/skill-cards', skillCardRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/progress', progressRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
