'use client';

import { useEffect, useState } from 'react';
import type { PublicUser } from '@kodguru/shared';
import { api } from './api';

/**
 * বর্তমান ব্যবহারকারী (role সহ) আনে /auth/me থেকে।
 * role-aware nav ও panel-এর জন্য। লগইন না থাকলে user = null।
 */
export function useCurrentUser() {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void api<{ user: PublicUser }>('/auth/me').then((res) => {
      if (!active) return;
      setUser(res.ok ? res.data.user : null);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { user, loading };
}
