import Link from 'next/link';

/**
 * Landing page — পরিচয়: গ্রামের স্কুলের ব্ল্যাকবোর্ড।
 * Signature element: শেখার চক্রটি (শোনো → দেখো → করো...) নিজেই hero,
 * যেন বোর্ডে চক দিয়ে লেখা।
 */

const LEARNING_LOOP = [
  'শোনো',
  'দেখো',
  'করো',
  'ভুল করো',
  'AI বুঝিয়ে দেয়',
  'হোমওয়ার্ক',
  'প্রজেক্ট',
  'ব্যাজ',
] as const;

const PROMISES = [
  {
    icon: '🗣️',
    title: 'সহজ বাংলায়',
    body: 'ইংরেজি না জানলেও চলবে। প্রতিটি কঠিন শব্দের বাংলা উচ্চারণ ও মানে দেওয়া থাকে।',
  },
  {
    icon: '🏡',
    title: 'গ্রামের উদাহরণে',
    body: 'Variable মানে মাটির ব্যাংক, Array মানে ডিমের ট্রে — চেনা জিনিস দিয়েই সব ব্যাখ্যা।',
  },
  {
    icon: '🤖',
    title: 'AI শিক্ষক পাশে',
    body: 'ভুল করলে কেউ বকবে না। AI শিক্ষক ধৈর্য ধরে, বারবার, আরও সহজ করে বুঝিয়ে দেবে।',
  },
  {
    icon: '📱',
    title: 'মোবাইলেই সব',
    body: 'কম্পিউটার লাগবে না শুরু করতে। ফোনেই পড়া, অনুশীলন, কুইজ — সব ফ্রি।',
  },
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-dvh">
      {/* ---- Hero: ব্ল্যাকবোর্ড ---- */}
      <section className="bg-board px-4 pb-12 pt-10 text-chalk">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-medium text-chalk-yellow">
            একদম শূন্য থেকে • সম্পূর্ণ ফ্রি
          </p>
          <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">
            কোড <span className="chalk-underline">গুরু</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-chalk-dust">
            সহজ বাংলায়, গ্রাম ও ঘরের উদাহরণ দিয়ে, AI শিক্ষকের সাথে
            ওয়েব ডেভেলপমেন্ট শেখো — বয়স যা-ই হোক, ইংরেজি জানা থাক বা না থাক।
          </p>

          {/* Signature: শেখার চক্র, বোর্ডে চকের লেখার মতো */}
          <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-3">
            {LEARNING_LOOP.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded-full border border-chalk-dust/40 px-3 py-1.5 text-sm font-medium">
                  {step}
                </span>
                {i < LEARNING_LOOP.length - 1 && (
                  <span aria-hidden className="text-chalk-yellow">→</span>
                )}
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="flex items-center justify-center rounded-lg bg-chalk-yellow px-6 py-3.5 text-center font-bold text-board-deep"
            >
              ফ্রি-তে শেখা শুরু করি
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center rounded-lg border border-chalk-dust/40 px-6 py-3.5 text-center font-medium text-chalk"
            >
              লগইন করি
            </Link>
          </div>
        </div>
      </section>

      {/* ---- প্রতিশ্রুতি ---- */}
      <section className="px-4 py-12">
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          {PROMISES.map((p) => (
            <div
              key={p.title}
              className="rounded-card border border-board-line/15 bg-white p-5"
            >
              <span aria-hidden className="text-2xl">{p.icon}</span>
              <h2 className="mt-2 text-lg font-bold">{p.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-board/70">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- নমুনা ব্যাখ্যা ---- */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-3xl rounded-card bg-board p-6 text-chalk">
          <p className="text-sm font-medium text-chalk-yellow">যেভাবে আমরা শেখাই</p>
          <dl className="mt-4 space-y-3 text-[15px]">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="shrink-0 font-bold sm:w-32">Variable</dt>
              <dd className="text-chalk-dust">= মাটির ব্যাংক, যেখানে টাকা রাখা যায়।</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="shrink-0 font-bold sm:w-32">Array</dt>
              <dd className="text-chalk-dust">= ডিমের ট্রে, একসাথে অনেক ডিম রাখা যায়।</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="shrink-0 font-bold sm:w-32">VS Code</dt>
              <dd className="text-chalk-dust">= কোড লেখার খাতা।</dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="shrink-0 font-bold sm:w-32">Database</dt>
              <dd className="text-chalk-dust">= গ্রামের বাজারের হিসাবের বড় খাতা।</dd>
            </div>
          </dl>
        </div>
      </section>

      <footer className="border-t border-board-line/15 px-4 py-6 text-center text-sm text-board/50">
        কোড গুরু — সবার জন্য, সবসময় ফ্রি।
      </footer>
    </div>
  );
}
