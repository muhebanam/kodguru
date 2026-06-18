'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

/**
 * RPG Learning Map — milestone (অধ্যায়) → module (পর্ব) → card।
 * locked অংশে 🔒, প্রতিটি module-এ mastery bar, প্রতি milestone-এ boss project।
 */
interface MapCard { slug: string; banglaName: string; completed: boolean; approved: boolean; locked: boolean; }
interface MapModule { moduleId: string; titleBn: string; bonusXp: number; unlocked: boolean; completed: boolean; masteryPercent: number; cards: MapCard[]; }
interface MapMilestone { milestoneId: string; order: number; titleBn: string; subtitleBn: string; bossProjectBn: string; rewardXp: number; unlocked: boolean; completed: boolean; modules: MapModule[]; }

export default function LearnPage() {
  const [milestones, setMilestones] = useState<MapMilestone[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [message, setMessage] = useState('Learning map লোড হচ্ছে...');

  useEffect(() => {
    void api<{ milestones: MapMilestone[] }>('/progress/map').then((res) => {
      if (res.ok) {
        setMilestones(res.data.milestones);
        // প্রথম unlocked milestone খোলা রাখি
        const firstOpen = res.data.milestones.find((m) => m.unlocked && !m.completed);
        setOpen(firstOpen?.milestoneId ?? res.data.milestones[0]?.milestoneId ?? null);
        setMessage('');
      } else setMessage(res.error.messageBn);
    });
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 rounded-card bg-board p-5 text-chalk">
        <p className="text-sm text-chalk-yellow">Learning Path</p>
        <h1 className="mt-1 text-2xl font-bold">শেখার মানচিত্র</h1>
        <p className="mt-2 text-sm text-chalk-dust">১১টি অধ্যায়, ৬৭টি পর্ব, ১৩২টি পাঠ। একটার পর একটা খুলবে — RPG-র মতো।</p>
      </div>

      {message && <p className="rounded-card bg-white p-4 text-board/70">{message}</p>}

      <div className="space-y-3">
        {milestones.map((ms) => (
          <div key={ms.milestoneId} className={`rounded-card border ${ms.unlocked ? 'border-board-line/20 bg-white' : 'border-board-line/10 bg-board/5'}`}>
            {/* milestone header */}
            <button
              type="button"
              onClick={() => ms.unlocked && setOpen(open === ms.milestoneId ? null : ms.milestoneId)}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${ms.completed ? 'bg-green-600 text-white' : ms.unlocked ? 'bg-chalk-yellow text-board-deep' : 'bg-board/15 text-board/40'}`}>
                {ms.completed ? '✓' : ms.unlocked ? ms.order : '🔒'}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`font-bold ${ms.unlocked ? 'text-board' : 'text-board/40'}`}>অধ্যায় {ms.order}: {ms.titleBn}</p>
                <p className="text-xs text-board/50">{ms.subtitleBn}</p>
              </div>
              {ms.unlocked && <span className="text-board/40">{open === ms.milestoneId ? '▲' : '▼'}</span>}
            </button>

            {/* modules */}
            {open === ms.milestoneId && ms.unlocked && (
              <div className="space-y-3 border-t border-board-line/10 p-4">
                {ms.modules.map((mod) => (
                  <div key={mod.moduleId} className={`rounded-lg border p-3 ${mod.unlocked ? 'border-board-line/15' : 'border-board-line/10 opacity-60'}`}>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-board">{mod.unlocked ? '' : '🔒 '}{mod.titleBn}</p>
                      <span className="text-xs text-board/50">{mod.masteryPercent}%</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-board/10">
                      <div className="h-full rounded-full bg-board" style={{ width: `${mod.masteryPercent}%` }} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {mod.cards.map((c) => (
                        c.locked ? (
                          <span key={c.slug} className="rounded-full bg-board/5 px-3 py-1.5 text-xs text-board/40">
                            🔒 {c.banglaName}
                          </span>
                        ) : (
                          <a key={c.slug} href={`/learn/${c.slug}`} className={`rounded-full px-3 py-1.5 text-xs font-medium ${c.completed ? 'bg-green-100 text-green-800' : 'bg-board text-chalk'}`}>
                            {c.completed ? '✓ ' : ''}{c.banglaName}
                          </a>
                        )
                      ))}
                    </div>
                  </div>
                ))}

                {/* boss project */}
                <div className="rounded-lg bg-board p-4 text-chalk">
                  <p className="text-sm font-bold text-chalk-yellow">🐉 অধ্যায়ের চূড়ান্ত প্রজেক্ট (+{ms.rewardXp} XP)</p>
                  <p className="mt-1 text-sm text-chalk-dust">{ms.bossProjectBn}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
