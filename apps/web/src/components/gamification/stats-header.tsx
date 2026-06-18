'use client';

import { xpProgressInLevel } from '@kodguru/shared';
import type { MyProgress } from '@/lib/use-progress';

/**
 * RPG স্ট্যাটস হেডার — level ব্যাজ + tier, XP progress bar, 🔥 streak।
 * Duolingo/RPG ধাঁচ: শিক্ষার্থী এক নজরে নিজের অগ্রগতি দেখে।
 */
export function StatsHeader({ progress }: { progress: MyProgress }) {
  const { percent } = xpProgressInLevel(progress.xp);

  return (
    <div className="rounded-card bg-board p-5 text-chalk">
      <div className="flex items-center justify-between">
        {/* level + tier */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chalk-yellow text-lg font-bold text-board-deep">
            {progress.level}
          </div>
          <div>
            <p className="text-xs text-chalk-dust">লেভেল {progress.level}</p>
            <p className="font-bold">{progress.tierBn}</p>
          </div>
        </div>

        {/* streak */}
        <div className="text-right">
          <p className="text-2xl font-bold text-chalk-yellow">
            🔥 {progress.streakDays}
          </p>
          <p className="text-xs text-chalk-dust">দিনের ধারা</p>
        </div>
      </div>

      {/* XP bar */}
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-chalk-dust">
          <span>মোট {progress.xp} XP</span>
          <span>পরের লেভেলে {100 - percent} XP বাকি</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-board-deep">
          <div
            className="h-full rounded-full bg-chalk-yellow transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
