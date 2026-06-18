'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

type ImportReport = {
  total: number;
  valid: number;
  existing: number;
  willCreate: number;
  willUpdate: number;
  created?: number;
  updated?: number;
  skipped?: number;
  failed?: number;
};

export default function SkillCardImportPage() {
  const [jsonText, setJsonText] = useState('');
  const [message, setMessage] = useState('প্রথমে skill-cards-seed-132.json file open করে content paste করুন, অথবা file choose করুন।');
  const [report, setReport] = useState<ImportReport | null>(null);
  const [busy, setBusy] = useState(false);

  async function loadFile(file?: File) {
    if (!file) return;
    const text = await file.text();
    setJsonText(text);
    setMessage(`${file.name} loaded হয়েছে। এবার Dry Run করুন।`);
  }


  async function downloadExport() {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
    const res = await fetch(`${baseUrl}/skill-cards/export`, { credentials: 'include' });
    if (!res.ok) {
      setMessage('Export করা যায়নি। আপনি admin হিসেবে login করেছেন কিনা দেখুন।');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skill-cards-export.json';
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Export download শুরু হয়েছে।');
  }

  async function submit(dryRun: boolean) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setMessage('JSON format ভুল। comma, bracket, quote দেখে ঠিক করুন।');
      return;
    }

    setBusy(true);
    setMessage(dryRun ? 'Dry run check হচ্ছে...' : 'Import হচ্ছে...');
    const cards = Array.isArray(parsed) ? parsed : (parsed as any).cards;
    const res = await api<{ dryRun: boolean; report: ImportReport; messageBn: string }>('/skill-cards/import', {
      method: 'POST',
      body: JSON.stringify({ cards, dryRun, mode: 'upsert' }),
    });
    setBusy(false);
    if (res.ok) {
      setReport(res.data.report);
      setMessage(res.data.messageBn);
    } else {
      setMessage(res.error.messageBn);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="rounded-card bg-board p-5 text-chalk">
        <p className="text-sm text-chalk-yellow">JSON Import</p>
        <h1 className="text-2xl font-bold">১৩২টি Skill Card Import করুন</h1>
        <p className="mt-2 text-sm text-chalk-dust">আগে Dry Run করলে DB change হবে না; শুধু ভুল আছে কিনা দেখাবে।</p>
      </div>

      <div className="rounded-card bg-white p-5">
        <input type="file" accept="application/json,.json" onChange={(e) => loadFile(e.target.files?.[0])} className="mb-4 block w-full rounded-lg border border-board-line/20 p-3" />
        <textarea value={jsonText} onChange={(e) => setJsonText(e.target.value)} spellCheck={false} placeholder="এখানে JSON paste করুন..." className="h-[50vh] w-full rounded-lg border border-board-line/20 bg-board p-4 font-mono text-xs text-chalk outline-none focus:ring-2 focus:ring-chalk-yellow" />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button disabled={busy || !jsonText} onClick={() => submit(true)} className="rounded-lg bg-paper px-5 py-3 font-bold text-board disabled:opacity-50">Dry Run</button>
          <button disabled={busy || !jsonText} onClick={() => submit(false)} className="rounded-lg bg-board px-5 py-3 font-bold text-chalk disabled:opacity-50">Confirm Import</button>
          <button type="button" onClick={downloadExport} className="rounded-lg border border-board-line/20 px-5 py-3 text-center font-bold text-board">Export JSON</button>
        </div>
        <p className="mt-4 rounded-lg bg-paper p-3 text-sm text-board/70">{message}</p>
      </div>

      {report && (
        <div className="grid gap-3 rounded-card bg-white p-5 sm:grid-cols-3">
          {Object.entries(report).map(([k, v]) => <div key={k} className="rounded-lg bg-paper p-4"><p className="text-xs text-board/50">{k}</p><p className="text-2xl font-bold">{String(v)}</p></div>)}
        </div>
      )}
    </div>
  );
}
