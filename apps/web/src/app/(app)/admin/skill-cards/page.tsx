'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { SkillCard } from '@kodguru/shared';
import { api } from '@/lib/api';
import { SkillCardGrid } from '@/components/skill-cards/skill-card-grid';

export default function AdminSkillCardsPage() {
  const [cards, setCards] = useState<SkillCard[]>([]);
  const [message, setMessage] = useState('লোড হচ্ছে...');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  async function load() {
    setMessage('লোড হচ্ছে...');
    const query = new URLSearchParams();
    if (status) query.set('status', status);
    if (search) query.set('search', search);
    const res = await api<{ cards: SkillCard[]; count: number }>(`/skill-cards?${query.toString()}`);
    if (res.ok) {
      setCards(res.data.cards);
      setMessage('');
    } else {
      setMessage(res.error.messageBn);
    }
  }

  useEffect(() => { void load(); }, []);

  async function changeStatus(slug: string, nextStatus: string) {
    const res = await api<{ messageBn: string }>(`/skill-cards/${slug}/status`, { method: 'PATCH', body: JSON.stringify({ status: nextStatus }) });
    if (!res.ok) alert(res.error.messageBn);
    await load();
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="rounded-card bg-board p-5 text-chalk">
        <p className="text-sm text-chalk-yellow">Admin Panel</p>
        <h1 className="text-2xl font-bold">Skill Card Management</h1>
        <p className="mt-2 text-sm text-chalk-dust">CRUD, approval queue, JSON import/export—সব এখানে।</p>
      </div>

      <div className="flex flex-col gap-3 rounded-card bg-white p-4 sm:flex-row sm:items-center">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search: HTML, Git, React..." className="flex-1 rounded-lg border border-board-line/20 px-3 py-2" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-board-line/20 px-3 py-2">
          <option value="">All status</option>
          <option value="draft">draft</option>
          <option value="reviewed">reviewed</option>
          <option value="approved">approved</option>
          <option value="rejected">rejected</option>
        </select>
        <button onClick={load} className="rounded-lg bg-board px-4 py-2 font-bold text-chalk">Filter</button>
        <Link href="/admin/skill-cards/import" className="rounded-lg bg-chalk-yellow px-4 py-2 text-center font-bold text-board">Import JSON</Link>
        <Link href="/admin/skill-cards/new" className="rounded-lg border border-board-line/20 px-4 py-2 text-center font-bold text-board">Add New</Link>
      </div>

      <div className="rounded-card bg-white p-4">
        <h2 className="font-bold">Quick Approval Queue</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-board/50"><tr><th className="p-2">Card</th><th>Status</th><th>Category</th><th>Action</th></tr></thead>
            <tbody>
              {cards.slice(0, 20).map((card) => (
                <tr key={card.slug} className="border-t border-board-line/10">
                  <td className="p-2"><Link className="font-bold text-board" href={`/admin/skill-cards/${card.slug}`}>{card.banglaName}</Link><p className="text-xs text-board/50">{card.slug}</p></td>
                  <td>{card.status}</td>
                  <td>{card.category}</td>
                  <td className="space-x-2">
                    <button onClick={() => changeStatus(card.slug, 'reviewed')} className="rounded bg-paper px-2 py-1">Reviewed</button>
                    <button onClick={() => changeStatus(card.slug, 'approved')} className="rounded bg-green-100 px-2 py-1 text-green-800">Approve</button>
                    <button onClick={() => changeStatus(card.slug, 'rejected')} className="rounded bg-red-100 px-2 py-1 text-red-800">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {message ? <p className="rounded-card bg-white p-4 text-board/70">{message}</p> : <SkillCardGrid cards={cards} admin />}
    </div>
  );
}
