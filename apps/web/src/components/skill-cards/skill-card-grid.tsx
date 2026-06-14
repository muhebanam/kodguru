'use client';

import Link from 'next/link';
import type { SkillCard } from '@kodguru/shared';

type Props = { cards: SkillCard[]; admin?: boolean };

export function SkillCardGrid({ cards, admin = false }: Props) {
  if (!cards.length) {
    return (
      <div className="rounded-card border border-dashed border-board-line/30 bg-white p-6 text-center text-board/70">
        এখনও কোনো Skill Card পাওয়া যায়নি। Admin panel থেকে JSON import করুন।
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <article key={card.slug} className="rounded-card border border-board-line/15 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-board/45">{card.category} • {card.level}</p>
              <h2 className="mt-1 text-xl font-bold text-board">{card.banglaName}</h2>
              <p className="text-sm text-board/60">{card.title} — {card.pronunciation}</p>
            </div>
            <span className="rounded-full bg-paper px-2.5 py-1 text-xs font-semibold text-board/70">{card.status}</span>
          </div>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-board/75">{card.simpleMeaning}</p>
          <p className="mt-3 rounded-lg bg-board/5 p-3 text-sm text-board/70">🏡 {card.villageAnalogy}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-board/50">
            <span>⏱️ {card.estimatedTime} মিনিট</span>
            <span>{card.quiz?.length ?? 0} quiz</span>
          </div>
          <div className="mt-4 flex gap-2">
            <Link href={`/learn/${card.slug}`} className="flex-1 rounded-lg bg-board px-4 py-2.5 text-center text-sm font-bold text-chalk">শেখা শুরু</Link>
            {admin && (
              <Link href={`/admin/skill-cards/${card.slug}`} className="rounded-lg border border-board-line/20 px-4 py-2.5 text-sm font-bold text-board">Edit</Link>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
