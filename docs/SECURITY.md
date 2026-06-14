# কোড গুরু — Security Review Checklist

এই নথি প্রকৃত কোড অডিট করে লেখা (অনুমান নয়)। প্রতিটি আইটেমের পাশে অবস্থা: ✅ আছে · ⚠️ আংশিক/মনে রাখুন · ⬜ পরে।

## প্রমাণীকরণ ও সেশন (Auth)
- ✅ পাসওয়ার্ড bcrypt cost 12 দিয়ে hash (`auth.controller.ts`)। প্লেইনটেক্সট কোথাও নেই।
- ✅ `passwordHash` দুইভাবে সুরক্ষিত: model-এ `select: false` + `toJSON`-এ delete (`user.model.ts`)। API response-এ কখনো যায় না।
- ✅ JWT HTTPOnly cookie-তে (JS থেকে পড়া যায় না → XSS-এ token চুরি কঠিন)।
- ✅ Production-এ cookie `secure: true` + `sameSite: 'none'` — Vercel↔Render cross-site deploy-এ সঠিক। dev-এ `lax`।
- ✅ access (১৫ মিনিট) + refresh (৭ দিন) আলাদা secret ও মেয়াদ।
- ✅ Production-এ default JWT secret reject হয়, access==refresh হলেও (`env.ts`)।
- ⚠️ Refresh rotation/blacklist নেই — logout কুকি মোছে, কিন্তু চুরি হওয়া refresh token মেয়াদ শেষ না হওয়া পর্যন্ত valid। ছোট scale-এ গ্রহণযোগ্য; পরে rotation যোগ করুন।

## অনুমোদন (Authorization / RBAC)
- ✅ server-side `requireRole` সব sensitive route-এ; client nav শুধু সুবিধা, ভরসা নয়।
- ✅ Review workflow gate: teacher `approved` করতে পারে না (`canSetStatus`, test দিয়ে নিশ্চিত)।
- ✅ Student শুধু `approved` কার্ড দেখে (`visibleStatusFilter`)।
- ⚠️ Next middleware শুধু token-presence দেখে role নয় — তাই logged-in student `/admin` URL-এ গেলে শেল render হতে পারে, কিন্তু সব data API থেকে 403 পাবে। UI-only ফাঁক, data ফাঁস নয়। চাইলে server-component role-check যোগ করুন।

## ইনপুট যাচাই (Validation)
- ✅ সব mutating endpoint Zod দিয়ে validate (register/login/import/status/ai-chat)।
- ✅ JSON body limit 200kb (`app.ts`) — বড় payload DoS আটকায়।
- ✅ Skill card import আসল `skillCardImportSchema`-তে যায় — ভুল data DB-তে ঢোকে না।

## Rate limiting
- ✅ global 300/15min, auth 30/15min, AI 12/min (endpoint) + per-user `AI_USER_RPM` (`rate-limit.ts`)।
- ✅ `trust proxy` সেট — Render-এর পেছনে সঠিক client IP।

## কোড execution / iframe
- ✅ শিক্ষার্থীর HTML/CSS/JS শুধু `sandbox="allow-scripts"` iframe-এ চলে (`code-lab.tsx`)। `allow-same-origin` দেওয়া **হয়নি** — তাই framed কোড sandbox ভাঙতে বা cookie পড়তে পারে না।
- ✅ কোনো backend arbitrary code execution নেই।

## AI guardrail
- ✅ AI শুধু `approved` কার্ডের context পায় (`ai.controller.ts`)।
- ✅ `check` mode-এ আগে deterministic rule-check, তারপর AI ব্যাখ্যা — AI একাই রায় দেয় না।
- ✅ system prompt-এ: পাঠের বাইরে উত্তর নয়, API key চাওয়া নিষেধ।
- ⚠️ free-tier Gemini prompt Google training-এ যেতে পারে — শিক্ষার্থী যেন AI-কে ব্যক্তিগত তথ্য না দেয়, UI-তে মনে করিয়ে দেওয়া ভালো (kids platform)।

## HTTP / transport
- ✅ `helmet()` — নিরাপদ default header।
- ✅ CORS `origin: CLIENT_ORIGIN` + `credentials: true` (wildcard নয়)।
- ✅ কেন্দ্রীয় error handler — stack trace production-এ leak করে না; সবসময় `messageBn`।
- ⬜ HTTPS — Render/Vercel স্বয়ংক্রিয় দেয়; নিজের সার্ভারে হলে নিশ্চিত করুন।

## Secrets / config
- ✅ env Zod-validated; ভুল হলে সার্ভার boot করে না।
- ✅ `.env` gitignored; শুধু `.env.example` (খালি key)।
- ⚠️ কোনো আসল key যেন repo/commit/lock file-এ না ঢোকে — deploy platform-এর secret manager ব্যবহার করুন।

## Audit / logging
- ⚠️ admin action audit log spec-এ ছিল — এখনো নেই। review-এ `reviewedBy/reviewedAt` কার্ডে আছে, কিন্তু পূর্ণ audit trail নয়। scale করলে যোগ করুন।

## সবচেয়ে জরুরি অবশিষ্ট কাজ (priority)
1. ⚠️ deploy-এর পর `npm run seed` দিয়ে প্রথম admin বানান — নইলে কেউ কিছু approve/import করতে পারবে না।
2. ⚠️ আসল JWT secret (`openssl rand -hex 32`) ও Atlas URI deploy platform-এর secret-এ রাখুন, repo-তে নয়।
3. ⚠️ refresh-token rotation ও admin audit log — multi-user scale করার আগে।
