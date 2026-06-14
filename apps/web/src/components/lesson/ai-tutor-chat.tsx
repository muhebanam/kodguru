'use client';

import { useState } from 'react';
import type { AiChatResult, AiMessage, AiMode } from '@kodguru/shared';
import { api } from '@/lib/api';

/**
 * AI টিউটর চ্যাট — এই Skill Card-এর context ধরে বাংলায় উত্তর দেয়।
 * মোড বোতাম: আরও সহজ / গ্রামের উদাহরণ / হোমওয়ার্ক / কোড check।
 */
const MODE_BUTTONS: { mode: AiMode; label: string }[] = [
  { mode: 'simpler', label: 'আরও সহজ করে' },
  { mode: 'village', label: 'গ্রামের উদাহরণ' },
  { mode: 'homework', label: 'হোমওয়ার্ক দাও' },
];

export function AiTutorChat({ slug }: { slug: string }) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  const send = async (text: string, mode: AiMode) => {
    if (!text.trim() || busy) return;
    setNote('');
    const next: AiMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setBusy(true);

    const res = await api<AiChatResult>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ slug, mode, messages: next }),
    });

    if (res.ok) {
      setMessages((m) => [...m, { role: 'assistant', content: res.data.text }]);
    } else {
      setNote(res.error.messageBn);
    }
    setBusy(false);
  };

  return (
    <div className="flex flex-col">
      <h2 className="font-bold text-board">🤖 AI শিক্ষক</h2>
      <p className="mt-1 text-xs text-board/60">এই পাঠ নিয়ে যা খুশি জিজ্ঞেস করো — বাংলায়।</p>

      {/* মোড বোতাম — কম-টাইপিং UX */}
      <div className="mt-3 flex flex-wrap gap-2">
        {MODE_BUTTONS.map((b) => (
          <button
            key={b.mode}
            type="button"
            disabled={busy}
            onClick={() => send(b.label, b.mode)}
            className="rounded-full border border-board-line/30 px-3 py-1.5 text-xs font-medium text-board disabled:opacity-40"
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* কথোপকথন */}
      <div className="mt-3 max-h-80 space-y-2 overflow-y-auto">
        {messages.length === 0 && (
          <p className="rounded-lg bg-paper p-3 text-sm text-board/60">
            উপরের বোতামে চাপো, অথবা নিচে নিজের প্রশ্ন লেখো।
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-lg p-3 text-sm ${
              m.role === 'user' ? 'bg-board/5 text-board' : 'bg-board text-chalk'
            }`}
          >
            {m.content}
          </div>
        ))}
        {busy && <p className="px-1 text-sm text-board/50">AI শিক্ষক ভাবছে...</p>}
      </div>

      {note && <p className="mt-2 text-sm text-amber-800">{note}</p>}

      {/* ইনপুট */}
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          disabled={busy}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send(input, 'explain')}
          placeholder="প্রশ্ন লেখো..."
          className="min-w-0 flex-1 rounded-lg border border-board-line/30 px-3 py-2.5 text-sm"
        />
        <button
          type="button"
          disabled={busy || !input.trim()}
          onClick={() => send(input, 'explain')}
          className="rounded-lg bg-chalk-yellow px-4 py-2.5 text-sm font-bold text-board-deep disabled:opacity-40"
        >
          পাঠাও
        </button>
      </div>
    </div>
  );
}
