'use client';

import Link from 'next/link';
import { navItemsForRole } from './nav-items';
import { useCurrentUser } from '@/lib/use-current-user';

/**
 * মোবাইল bottom navigation — বড় টাচ টার্গেট, role অনুযায়ী আইটেম।
 * grid column সংখ্যা item সংখ্যার সমান (student 3, teacher 4, admin 5)।
 */
export function BottomNav() {
  const { user } = useCurrentUser();
  const items = navItemsForRole(user?.role);
  const cols = ['', '', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5'][items.length] ?? 'grid-cols-3';

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-board-line/20 bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className={`grid ${cols}`}>
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-board"
            >
              <span aria-hidden className="text-xl leading-none">{item.icon}</span>
              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
