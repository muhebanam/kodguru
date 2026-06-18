'use client';

import { useProgress } from '@/lib/use-progress';
import { StatsHeader } from '@/components/gamification/stats-header';
import { masteryPercent } from '@kodguru/shared';

/**
 * Student dashboard — RPG ধাঁচ।
 * উপরে level/XP/streak, তারপর সামগ্রিক mastery, তারপর "শেখা চালিয়ে যাও"।
 */
const TOTAL_CARDS = 132;

export default function DashboardPage() {
  const { progress, loading } = useProgress();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">আসসালামু আলাইকুম! 👋</h1>
      <p className="mt-1 text-board/70">আজ একটু হলেও শিখি — ধারা যেন না ভাঙে।</p>

      {loading && <p className="mt-6 text-board/60">লোড হচ্ছে...</p>}

      {!loading && !progress && (
        <p className="mt-6 rounded-card bg-white p-4 text-board/70">
          অগ্রগতি দেখতে আগে লগইন করুন।
        </p>
      )}

      {progress && (
        <>
          <div className="mt-6">
            <StatsHeader progress={progress} />
          </div>

          {/* সামগ্রিক mastery */}
          <div className="mt-4 rounded-card border border-board-line/20 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="font-bold">সামগ্রিক অগ্রগতি</p>
              <p className="text-sm text-board/60">
                {progress.completedCards.length} / {TOTAL_CARDS} কার্ড
              </p>
            </div>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-board/10">
              <div
                className="h-full rounded-full bg-board transition-all duration-500"
                style={{ width: `${masteryPercent(progress.completedCards.length, TOTAL_CARDS)}%` }}
              />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <Stat n={progress.completedModules.length} label="module" />
              <Stat n={progress.completedMilestones.length} label="milestone" />
              <Stat n={progress.badges.length} label="ব্যাজ" />
            </div>
          </div>

          {/* achievements */}
          {progress.achievements && progress.achievements.length > 0 && (
            <div className="mt-4 rounded-card border border-board-line/20 bg-white p-5">
              <p className="font-bold">অর্জন</p>
              <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {progress.achievements.map((a) => (
                  <div
                    key={a.id}
                    title={a.descBn}
                    className={`flex flex-col items-center rounded-lg p-2 text-center ${a.earned ? 'bg-chalk-yellow/15' : 'bg-board/5 opacity-50'}`}
                  >
                    <span className="text-2xl">{a.earned ? a.icon : '🔒'}</span>
                    <span className="mt-1 text-[11px] font-medium text-board/70">{a.labelBn}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* continue */}
          <a
            href="/learn"
            className="mt-4 block rounded-card bg-board p-5 text-chalk"
          >
            <p className="text-sm text-chalk-dust">পরবর্তী ধাপ</p>
            <p className="mt-1 text-lg font-bold">শেখা চালিয়ে যাই →</p>
          </a>
        </>
      )}
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-lg bg-paper p-2">
      <p className="text-xl font-bold">{n}</p>
      <p className="text-xs text-board/60">{label}</p>
    </div>
  );
}
