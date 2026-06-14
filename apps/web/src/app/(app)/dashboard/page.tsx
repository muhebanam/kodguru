/**
 * Student dashboard — Phase 1 placeholder।
 * Phase 2-এ আসল ব্যবহারকারীর তথ্য, Phase 3-এ Skill Card progress আসবে।
 */
export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">আসসালামু আলাইকুম! 👋</h1>
      <p className="mt-1 text-board/70">আজ কী শিখবে?</p>

      <div className="mt-6 rounded-card bg-board p-5 text-chalk">
        <p className="text-sm text-chalk-dust">তোমার প্রথম পাঠ</p>
        <h2 className="mt-1 text-xl font-bold">VS Code — কোড লেখার খাতা</h2>
        <p className="mt-2 text-sm text-chalk-dust">
          Phase 3-এ Skill Card চালু হয়েছে। এখন /learn পেজে approved card দেখা যাবে।
        </p>
        <a href="/learn" className="mt-4 block w-full rounded-lg bg-chalk-yellow px-4 py-3 text-center font-bold text-board-deep">শেখা শুরু করি →</a>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-card border border-board-line/20 bg-white p-4">
          <p className="text-2xl font-bold">০</p>
          <p className="text-sm text-board/60">XP পয়েন্ট</p>
        </div>
        <div className="rounded-card border border-board-line/20 bg-white p-4">
          <p className="text-2xl font-bold">০</p>
          <p className="text-sm text-board/60">ব্যাজ</p>
        </div>
      </div>
    </div>
  );
}
