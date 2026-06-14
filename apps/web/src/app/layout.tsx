import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { SwRegister } from '@/components/pwa/sw-register';
import './globals.css';

/**
 * বাংলা ফন্ট — self-hosted local font, কোনো build-time/runtime Google fetch নয়।
 * কারণ: offline-first PWA + দুর্বল নেটওয়ার্কে নির্ভরযোগ্য build।
 *
 * Default: Noto Sans Bengali (variable, OFL license) — src/fonts/ এ আছে।
 * Kalpurush ব্যবহার করতে চাইলে: Kalpurush.ttf ফাইলটি src/fonts/ এ রেখে
 * নিচের src path বদলে দিন — আর কিছু বদলাতে হবে না।
 */
const bengali = localFont({
  src: '../fonts/NotoSansBengali-Variable.ttf',
  variable: '--font-bengali',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'কোড গুরু — AI Learning Platform',
  description:
    'একদম শূন্য থেকে, সহজ বাংলায়, গ্রামের উদাহরণ দিয়ে ওয়েব ডেভেলপমেন্ট শেখার ফ্রি প্ল্যাটফর্ম।',
  applicationName: 'কোড গুরু',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'কোড গুরু',
  },
};

export const viewport: Viewport = {
  themeColor: '#173F2E',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" className={bengali.variable}>
      <body className="font-bengali bg-paper text-board-deep antialiased">
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
