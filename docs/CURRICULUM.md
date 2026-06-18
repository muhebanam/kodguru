# কোড গুরু — Curriculum & Gamification (RPG ধাঁচ)

content অক্ষত। শুধু কাঠামো ও খেলার স্তর যোগ হয়েছে।

## কাঠামো: ১১ Milestone → ৬৭ Module → ১৩২ Skill Card

| # | Milestone | কী শেখায় | Module | Boss Project |
|---|---|---|---|---|
| M01 | প্রথম পদক্ষেপ | যন্ত্রপাতি (VS Code, Node, Git) | 4 | প্রথম GitHub repo push |
| M02 | ওয়েবের কাঠামো | HTML, CSS | 2 | পরিচিতি পেজ |
| M03 | সুন্দর সাজানো | Tailwind, UI | 3 | Landing page |
| M04 | জাভাস্ক্রিপ্টের প্রাণ | JS, browser | 7 | To-Do অ্যাপ |
| M05 | React রাজ্য | React, Next | 6 | Search অ্যাপ |
| M06 | সার্ভারের গল্প | Node, Express | 7 | REST API |
| M07 | ডাটার ভাণ্ডার | MongoDB | 4 | API + DB |
| M08 | নিরাপত্তা ও প্রবেশ | Auth, RBAC | 6 | Login + role |
| M09 | টাকা ও পরীক্ষা | Payment, test | 6 | Checkout + test |
| M10 | দুনিয়াতে প্রকাশ | Deployment | 7 | Full-stack লাইভ |
| M11 | AI যুগের ডেভেলপার | AI tools | 15 | AI দিয়ে full-stack |

প্রতিটি কার্ডে SC ID (SC001–SC132), milestone, module, ক্রম বসানো হয়েছে — `seeds/curriculum.json`।

## XP / Level / Streak নিয়ম (`@kodguru/shared/gamification`)
- কার্ড XP: beginner 10 · elementary 20 · intermediate 40
- Perfect (কুইজ ১০০%) = +১০% · Module শেষ = +৫০ · Milestone = +২০০
- Level: ১০০ XP = ১ level (সর্বোচ্চ ১০০)। Tier: ১–১০ নবীন · ১১–৩০ মাঝারি · ৩১–৬০ দক্ষ · ৬১–১০০ এক্সপার্ট
- Streak গুণক: ১দিন ১.১× · ৩দিন ১.২৫× · ৭দিন ১.৫× · ৩০দিন ২×
- Retry-তে শাস্তি নেই, সামান্য bonus — উৎসাহ দিতে

## নিয়ম পুনরায় বানাতে
`npm run gen:curriculum` → `seeds/curriculum.json` নতুন করে তৈরি (deterministic)।

---

## ধাপ ২ — Server XP Engine (সম্পন্ন)

XP/progress এখন **MongoDB-তে** (IndexedDB নয়) — যেকোনো ডিভাইসে থাকবে, ভবিষ্যতে leaderboard সম্ভব। সব ফ্রি (আপনার Atlas-এই)।

**নতুন:**
- User model-এ: `streakDays`, `lastActiveDay`, `completedModules`, `completedMilestones` (`xp`, `badges` আগে থেকেই ছিল)।
- `Progress` collection — প্রতি user প্রতি কার্ড, server-side source of truth (double-award আটকায়)।
- `Curriculum` collection — milestones/modules (seed-এ লোড হয়)।
- কার্ডে `scId/moduleId/milestoneId/globalOrder` বসে (seed-এ)।

**API:**
- `POST /api/progress/complete-card` `{slug, quizScore}` → XP award (perfect/streak/module/milestone bonus সহ), idempotent।
- `GET /api/progress/me` → xp, level, tier, streak, completed cards/modules/milestones।
- `GET /api/progress/curriculum` → milestone/module map (public)।

**Seed আপডেট:** `npm run seed` এখন কার্ডের পাশাপাশি curriculum-ও লোড করে। (আগে `npm run gen:curriculum` চালিয়ে `curriculum.json` থাকতে হবে — zip-এ আছে।)

Tests: shared 26 (award/streak math সহ) + api 25 (progress route guards সহ) = **51 pass**।

---

## ধাপ ৩ — RPG UI (সম্পন্ন)

**নতুন component:**
- `StatsHeader` — level ব্যাজ + tier, XP progress bar, 🔥 streak counter।
- `CompleteCard` — "পাঠ শেষ করি ও XP নিই" বোতাম → server-এ complete-card ডাকে → "+XP", module/milestone bonus, ও "লেভেল আপ!" উদযাপন দেখায়।
- `useProgress` hook — `/api/progress/me` থেকে XP/level/streak আনে।

**Dashboard:** এখন আসল server data — level/XP/streak header, সামগ্রিক mastery bar (X/132 কার্ড), module/milestone/badge গণনা।

**Lesson viewer:** কুইজের score ধরে নিচে CompleteCard — শিক্ষার্থী পাঠ শেষ করলে XP পায়, perfect হলে bonus, ধারা বাড়ে।

Build: dashboard 119kB, lesson 125kB (lean)। typecheck + সব test + build পাস।

### বাকি
- ধাপ ৪: Module/Milestone navigation + lock/unlock screen (RPG map)।
- ধাপ ৫: Badge gallery, achievement, boss project স্ক্রিন, retry-bonus।
- ধাপ ৬: AI tutor "hint দেয়, পুরো উত্তর নয়" মোড।

---

## ধাপ ৪–৬ — RPG Map, Achievement, AI hint-mode (সম্পন্ন)

**ধাপ ৪ — Learning Map + lock/unlock:**
- `GET /api/progress/map` — milestone → module → card, প্রতিটির unlock/completion/mastery সহ।
- Unlock নিয়ম: milestone N খোলে আগেরটা শেষ হলে; module খোলে আগের module শেষ হলে; card খোলে module unlocked + approved হলে।
- `/learn` এখন RPG map: ১১ অধ্যায় (লক আইকন সহ), প্রতি পর্বে mastery bar, প্রতি অধ্যায়ে 🐉 boss project।

**ধাপ ৫ — Achievement:**
- ১২টি achievement (pure function, shared, test সহ): প্রথম পাঠ, ১০ পাঠ, অর্ধেক, গুরু, module/milestone বিজয়, streak 3/7/30, level 10/30/60।
- `/api/progress/me` এখন achievements ফেরত দেয়; dashboard-এ অর্জন gallery (locked = 🔒)।

**ধাপ ৬ — AI hint-mode:**
- AI system prompt-এ যোগ: practice/কুইজের সরাসরি উত্তর চাইলে আগে hint + পথ-দেখানো প্রশ্ন, পুরো উত্তর নয়; ভুলে বকা নয়, retry-তে উৎসাহ — বন্ধুসুলভ খেলার গাইডের মতো।

Tests: shared 30 (achievements সহ) + api 25 = **55 pass**। typecheck + সব build পাস। route guards smoke-tested।

## পুরো gamification সম্পন্ন — deploy করার সময়
নতুন DB field ও curriculum যোগ হয়েছে। deploy-এর আগে/পরে একবার `npm run gen:curriculum` (zip-এ আছে) ও `npm run seed` চালান — তাহলে map, XP, unlock সব কাজ করবে।
