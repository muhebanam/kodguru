import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // shared package এখন dist থেকে import হয়; build tracing monorepo root-এ সীমাবদ্ধ রাখা হলো।
  outputFileTracingRoot: path.join(__dirname, '../..'),

  /**
   * API proxy — browser /api/* ডাকবে (same-origin, vercel.app),
   * Vercel সেটা Render-এর আসল API-তে পাঠাবে। ফলে cookie third-party নয়,
   * first-party হিসেবে vercel.app-এ সেট হবে → Chrome আর block করবে না।
   * API_PROXY_TARGET env-এ Render URL দিন (শেষে /api ছাড়া)।
   */
  async rewrites() {
    const target = process.env.API_PROXY_TARGET ?? 'https://kodguru-api.onrender.com';
    return [{ source: '/api/:path*', destination: `${target}/api/:path*` }];
  },

  // service worker-এর scope ঠিক রাখতে
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default nextConfig;
