'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { SkillCard } from '@kodguru/shared';
import { api } from '@/lib/api';
import { SkillCardJsonForm } from '@/components/admin/skill-card-json-form';

export default function EditSkillCardPage() {
  const params = useParams<{ slug: string }>();
  const [card, setCard] = useState<SkillCard | null>(null);
  const [message, setMessage] = useState('Skill Card লোড হচ্ছে...');

  useEffect(() => {
    void api<{ card: SkillCard }>(`/skill-cards/${params.slug}`).then((res) => {
      if (res.ok) {
        setCard(res.data.card);
        setMessage('');
      } else {
        setMessage(res.error.messageBn);
      }
    });
  }, [params.slug]);

  if (message) return <div className="rounded-card bg-white p-5 text-board/70">{message}</div>;
  if (!card) return null;
  return <div className="mx-auto max-w-5xl"><SkillCardJsonForm mode="edit" initialCard={card} /></div>;
}
