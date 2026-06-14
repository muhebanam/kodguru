'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PublicUser } from '@kodguru/shared';
import { api } from '@/lib/api';

type Mode = 'login' | 'register';

type AuthData = { user: PublicUser };

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const result = await api<AuthData>(isRegister ? '/auth/register' : '/auth/login', {
      method: 'POST',
      body: JSON.stringify(isRegister ? { name, email, password } : { email, password }),
    });

    setLoading(false);
    if (!result.ok) {
      setMessage(result.error.messageBn);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-md rounded-card border border-board-line/20 bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-bold text-board">{isRegister ? 'নতুন অ্যাকাউন্ট' : 'লগইন'}</h1>
      <p className="mt-1 text-sm text-board/65">
        {isRegister ? 'শেখা শুরু করতে সহজভাবে তথ্য দিন।' : 'আবার শেখা শুরু করতে লগইন করুন।'}
      </p>

      {isRegister ? (
        <label className="mt-5 block text-sm font-medium text-board">
          নাম
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-lg border border-board-line/25 px-3 py-3 outline-none focus:border-board"
            placeholder="যেমন: রহিম"
            required
            minLength={2}
          />
        </label>
      ) : null}

      <label className="mt-4 block text-sm font-medium text-board">
        ইমেইল
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-lg border border-board-line/25 px-3 py-3 outline-none focus:border-board"
          placeholder="you@example.com"
          type="email"
          required
        />
      </label>

      <label className="mt-4 block text-sm font-medium text-board">
        পাসওয়ার্ড
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-lg border border-board-line/25 px-3 py-3 outline-none focus:border-board"
          placeholder="কমপক্ষে ৮ অক্ষর"
          type="password"
          required
          minLength={isRegister ? 8 : 1}
        />
      </label>

      {message ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{message}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 w-full rounded-lg bg-board px-4 py-3 font-bold text-chalk disabled:opacity-60"
      >
        {loading ? 'অপেক্ষা করুন...' : isRegister ? 'অ্যাকাউন্ট তৈরি করি' : 'লগইন করি'}
      </button>
    </form>
  );
}
