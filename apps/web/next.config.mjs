import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // shared package এখন dist থেকে import হয়; build tracing monorepo root-এ সীমাবদ্ধ রাখা হলো।
  outputFileTracingRoot: path.join(__dirname, '../..'),
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
