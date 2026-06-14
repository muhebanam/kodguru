/**
 * Minimal logger — Phase 1-এ pino/winston আনা over-engineering।
 * পরে দরকার হলে এই একটি ফাইল বদলালেই সব জায়গায় কাজ করবে।
 */
function ts(): string {
  return new Date().toISOString();
}

export const logger = {
  info: (msg: string, ...rest: unknown[]) => console.log(`[${ts()}] INFO  ${msg}`, ...rest),
  warn: (msg: string, ...rest: unknown[]) => console.warn(`[${ts()}] WARN  ${msg}`, ...rest),
  error: (msg: string, ...rest: unknown[]) => console.error(`[${ts()}] ERROR ${msg}`, ...rest),
};
