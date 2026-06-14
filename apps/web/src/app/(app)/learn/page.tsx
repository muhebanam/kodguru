'use client';

import { useEffect, useState } from 'react';
import type { SkillCard } from '@kodguru/shared';
import { api } from '@/lib/api';
import { SkillCardGrid } from '@/components/skill-cards/skill-card-grid';

export default function LearnPage() {
  const [cards, setCards] = useState<SkillCard[]>([]);
  const [message, setMessage] = useState('Skill Card লোড হচ্ছে...');

  useEffect(() => {
    void api<{ cards: SkillCard[]; count: number }>('/skill-cards')
      .then((res) => {
        if (res.ok) {
          setCards(res.data.cards);
          setMessage(res.data.count ? '' : 'এখনো approved Skill Card নেই।');
        } else {
          setMessage(res.error.messageBn);
        }
      });
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 rounded-card bg-board p-5 text-chalk">
        <p className="text-sm text-chalk-yellow">Learning Path</p>
        <h1 className="mt-1 text-2xl font-bold">Skill Card গুলো</h1>
        <p className="mt-2 text-sm text-chalk-dust">প্রতিটি card একটি ছোট lesson, practice, homework, quiz ও mini project নিয়ে তৈরি।</p>
      </div>
      {message ? <p className="rounded-card bg-white p-4 text-board/70">{message}</p> : <SkillCardGrid cards={cards} />}
    </div>
  );
}
