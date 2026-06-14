import type { MetadataRoute } from 'next';

/** PWA manifest — মোবাইলে "অ্যাপ ইনস্টল" সাপোর্ট */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'কোড গুরু — AI Learning Platform',
    short_name: 'কোড গুরু',
    description:
      'সহজ বাংলায়, গ্রামের উদাহরণ দিয়ে কোডিং শেখার ফ্রি প্ল্যাটফর্ম।',
    start_url: '/',
    display: 'standalone',
    background_color: '#FBFAF4',
    theme_color: '#173F2E',
    lang: 'bn',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
