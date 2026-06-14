# কোড গুরু — AI Learning Platform

সহজ বাংলায়, গ্রাম ও ঘরের উদাহরণ দিয়ে, AI শিক্ষকের সাথে ওয়েব ডেভেলপমেন্ট শেখার ফ্রি প্ল্যাটফর্ম।

**Status: Phase 1 (scaffold) complete** — monorepo, Next.js PWA frontend, Express API, MongoDB connection, shared Zod schemas, environment config, responsive layout shell.

---

## চালু করার নিয়ম (Getting started)

প্রয়োজন: Node.js 20+, MongoDB (লোকাল অথবা [Atlas free M0](https://www.mongodb.com/atlas))।

```bash
# ১. dependency ইনস্টল (root থেকে — সব workspace একসাথে)
npm install

# ২. env ফাইল বানান
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# apps/api/.env খুলে MONGODB_URI বসান

# ৩. দুইটি টার্মিনালে চালান
npm run dev:api   # → http://localhost:4000/api/health
npm run dev:web   # → http://localhost:3000
```

যাচাই: `http://localhost:4000/api/health` খুলে `"db": "connected"` দেখা গেলে সব ঠিক আছে।

## Project structure

```
kodguru/
├── packages/shared/        # একমাত্র type/schema উৎস (Zod)
│   └── src/
│       ├── constants.ts            # roles, statuses, categories
│       └── schemas/
│           ├── skill-card.schema.ts # মূল কনটেন্ট কাঠামো (132+ কার্ডের গেট)
│           └── user.schema.ts
├── apps/api/               # Express + TS + Mongoose
│   └── src/
│       ├── config/         # Zod-validated env, DB connect (retry সহ)
│       ├── middleware/      # error handler (বাংলা বার্তাসহ), rate limit
│       └── routes/         # /api/health (Phase 2-3 এ auth, skill-cards)
└── apps/web/               # Next.js 15 App Router PWA
    ├── public/sw.js        # offline shell cache
    └── src/
        ├── app/            # landing, manifest, (app)/dashboard
        ├── components/     # AppShell: মোবাইলে bottom nav, PC-তে sidebar
        └── lib/api.ts      # typed fetch client (cookie-ready)
```

## নকশার নিয়ম (Conventions)

- **সব নতুন data shape আগে `@kodguru/shared`-এ Zod schema হিসেবে লিখুন** — Mongoose model, API validation, frontend form সব সেখান থেকে derive হবে।
- **প্রতিটি error response-এ `messageBn` বাধ্যতামূলক** — শিক্ষার্থী ইংরেজি জানে না।
- ফন্ট: ডিফল্ট Noto Sans Bengali; Kalpurush ব্যবহার করতে `apps/web/src/app/layout.tsx`-এর কমেন্ট দেখুন।
- রঙ: ব্ল্যাকবোর্ড সবুজ (`board`) + হলুদ চক (`chalk-yellow`) — `tailwind.config.ts`-এ tokens।

## Phase roadmap

| Phase | বিষয় | অবস্থা |
|---|---|---|
| 1 | Monorepo, frontend, backend, DB, PWA shell | ✅ |
| 2 | Auth (JWT + HTTPOnly cookie), roles, dashboards | ⬜ |
| 3 | Skill Card CRUD + ৩টি MVP কার্ড + lesson viewer | ⬜ |
| 4 | Code editor (CodeMirror 6) + homework checker + quiz | ⬜ |
| 5 | AI tutor adapter (Gemini/Groq/Ollama fallback) | ⬜ |
| 6 | Admin approval, JSON import/export, teacher panel | ⬜ |
| 7 | Tests, security review, deployment | ⬜ |

## Phase 3 Added

Phase 3 adds Skill Card CRUD + JSON Import/Export.

Main routes:

- Student: `/learn`, `/learn/[slug]`
- Admin: `/admin/skill-cards`, `/admin/skill-cards/import`, `/admin/skill-cards/new`, `/admin/skill-cards/[slug]`

Backend API:

- `GET /api/skill-cards`
- `GET /api/skill-cards/:slug`
- `POST /api/skill-cards`
- `PATCH /api/skill-cards/:slug`
- `DELETE /api/skill-cards/:slug`
- `PATCH /api/skill-cards/:slug/status`
- `POST /api/skill-cards/import`
- `GET /api/skill-cards/export`

Seed files are in `apps/api/seeds/`.

Run checks:

```bash
npm run typecheck
npm test
npm run build --workspace=apps/api
npm run build --workspace=apps/web
```

---

## Phase 4 — সম্পন্ন (interactive learner experience)

Lesson viewer এখন interactive:
- **Code Lab** — CodeMirror 6 (HTML/CSS/JS) + sandboxed live preview (`sandbox="allow-scripts"` only)। ভারী বলে lazy-load — শুধু দরকারে নামে।
- **Interactive Quiz** — উত্তর বেছে জমা, score, ভুলে দয়ালু বাংলা ব্যাখ্যা।
- **Homework checker** — content-pack-এর rule-based checker client-side চলে, বাংলায় pass/fail।
- **Progress** — IndexedDB (`lib/progress.store.ts`), server ছাড়া, অফলাইন। ব্যাজ শর্ত: পাঠ দেখা + কুইজ ৬০%+ + হোমওয়ার্ক পাস।

Content integrated: `content/banks/*`, `apps/web/public/data/{problem-sets,microcopy}.json`, AI prompts at `apps/api/src/ai/`.

Tests: shared 3 + api 9 + web 8 (checker) = 20 pass. typecheck + web/api build pass.

### বাকি
- Phase 5: AI tutor (Gemini→Groq→Ollama fallback, static-check-first, cache, rate-limit, বাংলা guardrail) — prompts ইতিমধ্যে `apps/api/src/ai/`-এ।
- Phase 6: teacher review + analogy approval panel (CRUD/import/export আছে; approval workflow বাকি)।
- Phase 7: security review, e2e tests, deployment guide।

---

## Phase 5 — সম্পন্ন (AI শিক্ষক, dedicated Express service, ফ্রি-tier ready)

**Backend** (`apps/api/src/modules/ai/`):
- Provider adapter — `Gemini → Groq → Ollama` fallback chain, `env.AI_PROVIDER_ORDER` অনুযায়ী।
- মডেলের নাম **hardcode নয়** — `GEMINI_MODEL / GROQ_MODEL / OLLAMA_MODEL` env থেকে (নাম দ্রুত বদলায়)।
- Response cache (SHA-256 keyed, 300-entry) — একই প্রশ্নে free quota নষ্ট হয় না।
- দুই স্তর rate limit: endpoint `aiLimiter` + per-user `AI_USER_RPM`।
- Prompt builder — আপনার লেখা `ai/*.md` persona+guardrail + approved card context + mode।
- Guardrails: **শুধু `approved` card-এর context**; `check` mode-এ আগে rule-based static check, তারপর AI ব্যাখ্যা; পাঠের বাইরে প্রশ্নে "teacher review দরকার"।
- Endpoint: `POST /api/ai/chat` (login + rate-limited)।

**Frontend**: lesson viewer-এর ডান প্যানেলে আসল AI চ্যাট — মোড বোতাম (আরও সহজ / গ্রামের উদাহরণ / হোমওয়ার্ক) + প্রশ্ন বক্স।

**Refactor**: homework checker এখন `@kodguru/shared`-এ (এক উৎস, web + api দুজনেই ব্যবহার করে)।

**ফ্রি deploy সতর্কতা**: Gemini project-এ billing চালু করলে free tier চলে যায় — চালু করবেন না। Free tier-এর prompt Google training-এ যেতে পারে (kids platform — মনে রাখবেন)।

Tests: shared 11 + api 14 (AI manager fallback/cache সহ) + web pass = **25 pass**। typecheck + api/web build পাস। `dist/ai/*.md` build-এ কপি হয় (runtime bug fixed)।

### বাকি
- Phase 6: teacher review + analogy approval workflow (CRUD/import/export আছে; approve/reject UI বাকি)।
- Phase 7: security review, e2e test, deployment guide (Render + Vercel + Atlas)।

---

## Phase 6 — সম্পন্ন (teacher review panel + analogy approval workflow)

**Workflow (server-enforced):** teacher `draft → reviewed/rejected` (feedback note সহ); admin `reviewed → approved` প্রকাশ করে।

**Backend:**
- Status endpoint এখন optional `note` নেয়; `reviewNote / reviewedBy / reviewedAt` কার্ডে persist হয় (shared schema + mongoose model + Zod-validated body)।
- `canSetStatus` দিয়ে role gate: teacher approve করতে পারে না (শুধু admin)।

**Frontend:**
- `/teacher` — আসল review panel: draft/reviewed queue → কার্ডের ব্যাখ্যা + গ্রামের উদাহরণ পড়া → feedback note + "যাচাই সম্পন্ন"/"বাতিল"।
- role-aware navigation (`useCurrentUser` → `/auth/me`): student শুধু শেখার লিংক, teacher + যাচাই, admin + Admin।

**সচেতন সীমা:** student submission review ও confusion analytics এখানে নেই — ওগুলো server-side submission store-নির্ভর, যা ইচ্ছাকৃতভাবে এখনো গড়া হয়নি (progress এখন IndexedDB)। দ্বিতীয় ব্যবহারকারী/scale দরকার হলে যোগ হবে।

Tests: shared 11 + api 18 (canSetStatus + visibleStatusFilter workflow সহ) + web pass = **29 pass**। typecheck + api/web build পাস। ১৩২ কার্ড schema পুনরায় validate ✓।

### বাকি — Phase 7 (শেষ ধাপ)
- Security review checklist, e2e/route tests, deployment guide (Render API + Vercel web + MongoDB Atlas), production env hardening।

---

## Phase 7 — সম্পন্ন (production-ready: security, tests, deployment, seed)

**Seed / bootstrap (deploy unblocker):** `npm run seed` — env থেকে প্রথম admin বানায় + ১৩২ কার্ড import করে (idempotent, আসল Zod schema দিয়ে validate)। এটা ছাড়া fresh deploy অচল ছিল (register সবাইকে student বানায়)।

**Security review:** `docs/SECURITY.md` — প্রকৃত কোড অডিট করে লেখা। মূল ভালো দিক: bcrypt 12, passwordHash দুইভাবে hidden, HTTPOnly + cross-site cookie (`secure`+`sameSite=none` prod), server-side RBAC, sandboxed iframe (`allow-scripts` only), Zod সর্বত্র। অবশিষ্ট: refresh rotation, admin audit log (scale-এর আগে)।

**Deployment:** `docs/DEPLOY.md` — Atlas + Render (API) + Vercel (web), সম্পূর্ণ ফ্রি, ধাপে ধাপে। gotcha সহ: Gemini billing চালু করলে free tier যায়; Render cold-start; cross-site cookie-র জন্য `CLIENT_ORIGIN` সঠিক হওয়া আবশ্যক।

**Tests:** shared 11 + api 22 (AI fallback/cache, review permission, route guard সহ) = **33 pass**। typecheck + api/web build পাস।

---

## সারসংক্ষেপ — সব ফেজ

| Phase | বিষয় | অবস্থা |
|---|---|---|
| 1 | Monorepo, frontend, backend, DB, PWA shell | ✅ |
| 2 | Auth (JWT+cookie), roles, dashboards | ✅ |
| 3 | Skill Card CRUD, import/export, lesson viewer, ১৩২ কার্ড | ✅ |
| 4 | Code lab (CodeMirror) + homework checker + quiz + progress | ✅ |
| 5 | AI tutor (Gemini→Groq→Ollama fallback, cache, guardrail) | ✅ |
| 6 | Teacher review panel + approval workflow | ✅ |
| 7 | Security, tests, deployment, seed | ✅ |

লাইভ করতে: `docs/DEPLOY.md` অনুসরণ করুন।
