import { Sidebar } from './sidebar';
import { BottomNav } from './bottom-nav';

/**
 * App shell — লগইন-পরবর্তী সব পেজের কাঠামো।
 *
 * মোবাইল (default): উপরে হেডার, নিচে বড়-বোতামের bottom navigation।
 * PC (lg+): বামে sidebar (কোর্স মডিউল), মাঝে content,
 *           ডানে AI টিউটর প্যানেলের জায়গা (Phase 5-এ চালু হবে)।
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_1fr_320px]">
      {/* PC: বাম sidebar */}
      <Sidebar />

      {/* মূল কনটেন্ট */}
      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-board-line/20 bg-paper/95 px-4 backdrop-blur">
          <span className="text-lg font-bold text-board">
            কোড <span className="chalk-underline">গুরু</span>
          </span>
          <span className="rounded-full bg-chalk-yellow/20 px-3 py-1 text-sm font-medium text-board">
            ০ XP
          </span>
        </header>

        <main className="flex-1 px-4 pb-24 pt-4 lg:pb-6">{children}</main>

        {/* মোবাইল: bottom nav */}
        <BottomNav />
      </div>

      {/* PC: ডান AI টিউটর প্যানেল — Phase 5 placeholder */}
      <aside className="hidden border-l border-board-line/20 bg-board p-4 lg:block">
        <h2 className="font-bold text-chalk">AI শিক্ষক</h2>
        <p className="mt-2 text-sm text-chalk-dust">
          এখানে তোমার AI শিক্ষক থাকবে। যেকোনো প্রশ্ন বাংলায় করলেই
          সহজ করে বুঝিয়ে দেবে। (শীঘ্রই আসছে)
        </p>
      </aside>
    </div>
  );
}
