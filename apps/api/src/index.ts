import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

/** Server bootstrap — development-এ DB fail হলেও health route দেখার জন্য API boot করবে। */
async function main() {
  await connectDB();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 কোড গুরু API চলছে: http://localhost:${env.PORT}`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} পাওয়া গেছে — সার্ভার বন্ধ হচ্ছে...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.error('সার্ভার চালু হতে পারেনি', err);
  process.exit(1);
});
