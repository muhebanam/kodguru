'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SkillCard } from '@kodguru/shared';
import { api } from '@/lib/api';

const emptyCard: Partial<SkillCard> = {
  slug: '',
  title: '',
  banglaName: '',
  pronunciation: '',
  category: 'tools',
  level: 'beginner',
  simpleMeaning: '',
  villageAnalogy: '',
  whyLearn: '',
  learningGoals: [''],
  lessonSteps: [{ order: 1, title: '', content: '' }],
  examples: [],
  codeExamples: [],
  commonMistakes: [],
  practiceTasks: [],
  homework: [],
  quiz: [],
  aiTeacherGuide: '',
  status: 'draft',
  estimatedTime: 20,
  prerequisites: [],
  nextSkills: [],
};

export function SkillCardJsonForm({ initialCard, mode }: { initialCard?: SkillCard; mode: 'create' | 'edit' }) {
  const router = useRouter();
  const [jsonText, setJsonText] = useState(JSON.stringify(initialCard ?? emptyCard, null, 2));
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const parsed = useMemo(() => {
    try { return JSON.parse(jsonText); } catch { return null; }
  }, [jsonText]);

  async function save() {
    if (!parsed) {
      setMessage('JSON format ভুল আছে। comma/bracket দেখে ঠিক করুন।');
      return;
    }
    setBusy(true);
    setMessage('Save হচ্ছে...');
    const path = mode === 'create' ? '/skill-cards' : `/skill-cards/${initialCard?.slug}`;
    const method = mode === 'create' ? 'POST' : 'PATCH';
    const res = await api<{ card: SkillCard; messageBn: string }>(path, { method, body: JSON.stringify(parsed) });
    setBusy(false);
    if (res.ok) {
      setMessage(res.data.messageBn);
      router.push('/admin/skill-cards');
      router.refresh();
    } else {
      setMessage(res.error.messageBn);
    }
  }

  return (
    <div className="rounded-card bg-white p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{mode === 'create' ? 'নতুন Skill Card' : 'Skill Card Edit'}</h2>
          <p className="text-sm text-board/60">এখন JSON editor রাখা হয়েছে। পরে tab-based সুন্দর form করা যাবে।</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${parsed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{parsed ? 'Valid JSON' : 'Invalid JSON'}</span>
      </div>
      <textarea
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        spellCheck={false}
        className="h-[65vh] w-full rounded-lg border border-board-line/20 bg-board p-4 font-mono text-sm text-chalk outline-none focus:ring-2 focus:ring-chalk-yellow"
      />
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button disabled={busy} onClick={save} className="rounded-lg bg-board px-5 py-3 font-bold text-chalk disabled:opacity-60">Save</button>
        {message && <p className="text-sm text-board/70">{message}</p>}
      </div>
    </div>
  );
}
