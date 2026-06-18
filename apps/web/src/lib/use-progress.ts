'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

export interface MyProgress {
  xp: number;
  level: number;
  tierBn: string;
  streakDays: number;
  badges: string[];
  completedCards: string[];
  completedModules: string[];
  completedMilestones: string[];
  achievements: { id: string; labelBn: string; descBn: string; icon: string; earned: boolean }[];
}

/**
 * Server থেকে আমার XP/level/streak/progress আনে (/api/progress/me)।
 * কার্ড শেষ করার পর refetch() ডাকলে নতুন XP দেখা যায়।
 */
export function useProgress() {
  const [data, setData] = useState<MyProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const res = await api<MyProgress>('/progress/me');
    setData(res.ok ? res.data : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { progress: data, loading, refetch };
}
