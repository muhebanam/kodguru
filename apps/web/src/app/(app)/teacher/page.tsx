'use client';

import { useEffect, useState } from 'react';
import type { CardStatus, SkillCard } from '@kodguru/shared';
import { api } from '@/lib/api';

/**
 * Teacher Review Panel।
 * Workflow: teacher একটি draft কার্ড পড়ে → "যাচাই সম্পন্ন (reviewed)" বা "বাতিল (rejected)"
 * করে, সাথে feedback note দিতে পারে। admin পরে reviewed → approved করে প্রকাশ করে।
 *
 * সীমা (সচেতন): student submission review ও confusion analytics এখানে নেই —
 * ওগুলো server-side submission store-নির্ভর, যা এখনো গড়া হয়নি (progress এখন IndexedDB)।
 */
type Tab = 'draft' | 'reviewed';

export default function TeacherPage() {
  const [tab, setTab] = useState<Tab>('draft');
  const [cards, setCards] = useState<SkillCard[]>([]);
  const [selected, setSelected] = useState<SkillCard | null>(null);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async (status: Tab) => {
    setMessage('লোড হচ্ছে...');
    const res = await api<{ cards: SkillCard[] }>(`/skill-cards?status=${status}`);
    if (res.ok) {
      setCards(res.data.cards);
      setMessage(res.data.cards.length ? '' : 'এই তালিকায় এখন কোনো কার্ড নেই।');
    } else {
      setMessage(res.error.messageBn);
    }
  };

  useEffect(() => {
    setSelected(null);
    void load(tab);
  }, [tab]);

  const decide = async (status: CardStatus) => {
    if (!selected || busy) return;
    setBusy(true);
    const res = await api<{ messageBn: string }>(`/skill-cards/${selected.slug}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note: note.trim() || undefined }),
    });
    setBusy(false);
    if (res.ok) {
      setSelected(null);
      setNote('');
      await load(tab);
    } else {
      setMessage(res.error.messageBn);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold">শিক্ষক — কনটেন্ট যাচাই</h1>
      <p className="mt-1 text-board/70">কার্ডের ব্যাখ্যা ও গ্রামের উদাহরণ পড়ে যাচাই করুন। admin পরে প্রকাশ করবে।</p>

      <div className="mt-4 flex gap-2">
        {(['draft', 'reviewed'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === t ? 'bg-board text-chalk' : 'bg-board/5 text-board'
            }`}
          >
            {t === 'draft' ? 'নতুন (যাচাই বাকি)' : 'যাচাই হয়েছে'}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="space-y-2">
          {message && <p className="rounded-lg bg-white p-3 text-sm text-board/70">{message}</p>}
          {cards.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => { setSelected(c); setNote(c.reviewNote ?? ''); }}
              className={`block w-full rounded-card border p-3 text-left ${
                selected?.slug === c.slug ? 'border-board bg-board/5' : 'border-board-line/20 bg-white'
              }`}
            >
              <p className="font-bold">{c.banglaName}</p>
              <p className="text-xs text-board/60">{c.title} • {c.category} • {c.level}</p>
            </button>
          ))}
        </div>

        <div className="rounded-card border border-board-line/20 bg-white p-5">
          {!selected ? (
            <p className="text-board/60">বাঁ পাশ থেকে একটি কার্ড বেছে নিন।</p>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold">{selected.banglaName}</h2>
                <p className="text-sm text-board/60">{selected.title} — {selected.pronunciation}</p>
              </div>

              <Field label="সহজ মানে" value={selected.simpleMeaning} />
              <Field label="🏡 গ্রামের উদাহরণ (মূলত এটাই যাচাই করুন)" value={selected.villageAnalogy} highlight />
              <Field label="কেন শিখব" value={selected.whyLearn} />

              <div>
                <p className="text-sm font-bold text-board/60">শেখার ধাপ</p>
                <ol className="mt-1 list-decimal pl-5 text-sm text-board/75">
                  {selected.lessonSteps.map((s) => <li key={s.order}>{s.title}</li>)}
                </ol>
              </div>

              {selected.commonMistakes.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-board/60">সাধারণ ভুল</p>
                  <ul className="mt-1 list-disc pl-5 text-sm text-board/75">
                    {selected.commonMistakes.map((m) => <li key={m.mistake}>{m.mistake}</li>)}
                  </ul>
                </div>
              )}

              <Field label="🤖 AI শিক্ষকের নির্দেশ" value={selected.aiTeacherGuide} />

              <div className="rounded-lg bg-paper p-4">
                <label className="text-sm font-bold text-board/70">মন্তব্য / feedback (ঐচ্ছিক)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="কী ঠিক আছে, কী বদলাতে হবে — লিখুন"
                  className="mt-2 w-full rounded-lg border border-board-line/30 p-3 text-sm"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => decide('reviewed')}
                    className="rounded-lg bg-green-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"
                  >
                    ✅ যাচাই সম্পন্ন (admin প্রকাশ করবে)
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => decide('rejected')}
                    className="rounded-lg border border-red-400 px-4 py-2.5 text-sm font-bold text-red-700 disabled:opacity-40"
                  >
                    ✕ বাতিল
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-sm font-bold text-board/60">{label}</p>
      <p className={`mt-1 text-board/80 ${highlight ? 'rounded-lg bg-chalk-yellow/15 p-3' : ''}`}>{value}</p>
    </div>
  );
}
