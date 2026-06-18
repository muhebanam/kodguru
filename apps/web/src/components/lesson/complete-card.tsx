'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface AwardResult {
  awardedXp: number;
  totalXp: number;
  level: number;
  tierBn: string;
  streakDays: number;
  leveledUp: boolean;
  moduleCompleted: boolean;
  milestoneCompleted: boolean;
  alreadyDone: boolean;
}

/**
 * পাঠ শেষ করার বোতাম + XP উদযাপন।
 * server-এ complete-card ডাকে, তারপর "+XP", bonus, ও "লেভেল আপ!" দেখায়।
 * quizScore থাকলে perfect bonus স্বয়ংক্রিয় হিসাব হয় server-এ।
 */
export function CompleteCard({ slug, quizScore }: { slug: string; quizScore: number }) {
  const [result, setResult] = useState<AwardResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const finish = async () => {
    setBusy(true);
    setError('');
    const res = await api<AwardResult>('/progress/complete-card', {
      method: 'POST',
      body: JSON.stringify({ slug, quizScore }),
    });
    setBusy(false);
    if (res.ok) setResult(res.data);
    else setError(res.error.messageBn);
  };

  if (result) {
    return (
      <div className="rounded-card bg-board p-6 text-center text-chalk">
        {result.alreadyDone ? (
          <p className="text-chalk-dust">এই পাঠ আগেই শেষ করেছ — দারুণ! 🎉</p>
        ) : (
          <>
            <p className="text-4xl font-bold text-chalk-yellow">+{result.awardedXp} XP</p>
            <p className="mt-1 text-chalk-dust">মোট {result.totalXp} XP • লেভেল {result.level}</p>

            {result.leveledUp && (
              <p className="mt-3 rounded-lg bg-chalk-yellow/20 p-2 font-bold text-chalk-yellow">
                🎊 লেভেল আপ! এখন তুমি {result.tierBn}
              </p>
            )}
            {result.moduleCompleted && (
              <p className="mt-2 text-sm text-chalk-dust">✅ একটি module শেষ! (+৫০ bonus)</p>
            )}
            {result.milestoneCompleted && (
              <p className="mt-2 text-sm text-chalk-yellow">🏆 একটি milestone জয়! (+২০০ bonus)</p>
            )}
            <p className="mt-3 text-sm">🔥 ধারা: {result.streakDays} দিন</p>
          </>
        )}
        <a
          href="/learn"
          className="mt-4 inline-block rounded-lg bg-chalk-yellow px-5 py-2.5 font-bold text-board-deep"
        >
          পরের পাঠে যাই →
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-board-line/20 bg-white p-5 text-center">
      <p className="text-board/70">পাঠ, অনুশীলন ও কুইজ শেষ? তাহলে পাঠটি শেষ করে XP নাও!</p>
      <button
        type="button"
        onClick={finish}
        disabled={busy}
        className="mt-3 rounded-lg bg-board px-6 py-3 font-bold text-chalk disabled:opacity-40"
      >
        {busy ? 'জমা হচ্ছে...' : '✅ পাঠ শেষ করি ও XP নিই'}
      </button>
      {error && <p className="mt-2 text-sm text-amber-800">{error}</p>}
    </div>
  );
}
