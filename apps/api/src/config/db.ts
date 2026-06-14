import mongoose from 'mongoose';
import { env, isProd, isTest } from './env.js';
import { logger } from '../utils/logger.js';

/**
 * MongoDB connection with soft-fail in development.
 * - production: DB না লাগলে server চালু হবে না
 * - development/test: server boot করবে, /api/health db: disconnected দেখাবে
 */
const MAX_RETRIES = isProd ? 5 : 2;
const RETRY_DELAY_MS = 1500;

export function getDbStatus() {
  const state = mongoose.connection.readyState;
  return state === 1 ? 'connected' : state === 2 ? 'connecting' : state === 3 ? 'disconnecting' : 'disconnected';
}

export async function connectDB(): Promise<boolean> {
  mongoose.set('strictQuery', true);

  if (!env.MONGODB_URI) {
    const message = 'MONGODB_URI নেই — API boot হবে, কিন্তু DB disconnected থাকবে।';
    if (isProd) throw new Error(message);
    if (!isTest) logger.warn(message);
    return false;
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      logger.info(`✅ MongoDB connected (attempt ${attempt})`);
      return true;
    } catch (err) {
      logger.error(`MongoDB connect failed (attempt ${attempt}/${MAX_RETRIES})`, err);
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

  if (isProd) {
    throw new Error('MongoDB connect failed after retries');
  }

  logger.warn('MongoDB disconnected রেখেই development server চালু হচ্ছে।');
  return false;
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
