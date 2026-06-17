import type { ApiResponse } from '@kodguru/shared';

/**
 * API client — সব fetch এই একটি ফাংশন দিয়ে যাবে।
 * credentials: 'include' → HTTPOnly cookie auth-এর জন্য আবশ্যক।
 *
 * Default base = '/api' (same-origin)। Production-এ Vercel এটি Render-এ proxy করে,
 * তাই cookie first-party (vercel.app) হিসেবে সেট হয় — third-party block এড়ানো যায়।
 * Local dev-এ NEXT_PUBLIC_API_URL=http://localhost:4000/api দিন।
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

export async function api<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
    return (await res.json()) as ApiResponse<T>;
  } catch {
    // নেটওয়ার্ক নেই/সার্ভার ঘুমিয়ে — শিক্ষার্থীকে বাংলায় বলা হবে
    return {
      ok: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
        messageBn: 'ইন্টারনেট সংযোগে সমস্যা হচ্ছে। সংযোগ দেখে আবার চেষ্টা করুন।',
      },
    };
  }
}
