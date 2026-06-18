import mongoose from 'mongoose';
import { AppError } from '../../middleware/error-handler.js';

/** DB connected না থাকলে সাথে সাথে 503 — query-তে আটকে না থেকে */
export function ensureDbConnected(): void {
  if (mongoose.connection.readyState !== 1) {
    throw new AppError(503, 'DB_DISCONNECTED', 'Database is not connected', 'ডাটাবেস connected নয়। আগে MongoDB চালু/সংযুক্ত করুন।');
  }
}
