'use client';

import Link from 'next/link';
import { navItemsForRole } from './nav-items';
import { useCurrentUser } from '@/lib/use-current-user';

/** PC sidebar — role অনুযায়ী navigation */
export function Sidebar() {
  const { user } = useCurrentUser();
  const items = navItemsForRole(user?.role);

  return (
    <aside className="hidden border-r border-board-line/20 bg-paper lg:block">
      <div className="sticky top-0 flex h-dvh flex-col p-4">
        <Link href="/" className="mb-6 text-xl font-bold text-board">
          কোড <span className="chalk-underline">গুরু</span>
        </Link>
        <nav className="flex-1">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-board hover:bg-board/5"
                >
                  <span aria-hidden>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-xs text-board/50">কোড গুরু v0.3 — Phase 6</p>
      </div>
    </aside>
  );
}
