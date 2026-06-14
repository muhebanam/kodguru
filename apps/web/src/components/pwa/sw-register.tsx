'use client';

import { useEffect } from 'react';

/** Service worker রেজিস্ট্রেশন — শুধু production-এ, dev-এ cache ঝামেলা এড়াতে */
export function SwRegister() {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return;
    }
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => console.error('SW register failed:', err));
  }, []);

  return null;
}
