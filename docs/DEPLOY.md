# কোড গুরু — Deployment Guide (সম্পূর্ণ ফ্রি)

লক্ষ্য: তিনটি ফ্রি সেবায় লাইভ করা — **MongoDB Atlas** (DB) + **Render** (Express API) + **Vercel** (Next.js web)।

> ক্রম গুরুত্বপূর্ণ: Atlas → API → web → seed। আগে DB, শেষে seed।

---

## ০. লাগবে
GitHub অ্যাকাউন্ট (repo push করতে), আর তিনটি ফ্রি অ্যাকাউন্ট: Atlas, Render, Vercel। কোনো কার্ড লাগে না।

## ১. MongoDB Atlas (ডাটাবেস)
1. [mongodb.com/atlas](https://www.mongodb.com/atlas) → free **M0** cluster বানান।
2. Database Access → একজন user (username + password)।
3. Network Access → `0.0.0.0/0` (সব IP) অনুমোদন — Render-এর IP আগে জানা যায় না।
4. Connect → "Drivers" → connection string কপি করুন:
   `mongodb+srv://USER:PASS@cluster.xxxx.mongodb.net/kodguru`
   (শেষে `/kodguru` ডাটাবেস নাম যোগ করুন।)

## ২. Render (Express API)
1. repo GitHub-এ push করুন।
2. Render → New → **Web Service** → repo বেছে নিন।
3. সেটিং:
   - Root Directory: ফাঁকা (monorepo root)
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start --workspace=apps/api`
   - Instance: **Free**
4. Environment variables (Render dashboard-এ, repo-তে নয়):
   ```
   NODE_ENV=production
   MONGODB_URI=<Atlas string>
   CLIENT_ORIGIN=https://<your-app>.vercel.app
   JWT_ACCESS_SECRET=<openssl rand -hex 32>
   JWT_REFRESH_SECRET=<আলাদা openssl rand -hex 32>
   GEMINI_API_KEY=<AI Studio free key>
   GEMINI_MODEL=gemini-2.5-flash-lite
   AI_PROVIDER_ORDER=gemini
   ADMIN_EMAIL=<আপনার email>
   ADMIN_PASSWORD=<শক্ত পাসওয়ার্ড>
   ```
5. Deploy → API URL পাবেন: `https://<api>.onrender.com`। যাচাই: `…/api/health` খুলে `db: connected` দেখুন।

> **Free tier cold start:** ১৫ মিনিট নিষ্ক্রিয় থাকলে Render সার্ভার ঘুমায়; পরের request-এ ~৩০s লাগে। সমাধান: একটা ফ্রি uptime-ping সেবা দিয়ে প্রতি ১০ মিনিটে `…/api/health` ডাকুন।

## ৩. Vercel (Next.js web)
1. Vercel → New Project → একই repo।
2. সেটিং:
   - Root Directory: `apps/web`
   - Framework: Next.js (নিজে ধরবে)
   - Build Command override: `cd ../.. && npm install && npm run build:shared && npm run build --workspace=apps/web`
     (shared আগে build হতে হবে।)
3. Environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://<api>.onrender.com/api
   ```
4. Deploy → web URL পাবেন: `https://<your-app>.vercel.app`।
5. **ফিরে গিয়ে** Render-এ `CLIENT_ORIGIN` এই Vercel URL-এ আপডেট করুন (cross-site cookie + CORS-এর জন্য আবশ্যক), redeploy।

## ৪. Seed — প্রথম admin + কার্ড (অত্যাবশ্যক)
deploy-এর পর DB খালি, কোনো admin নেই। Render dashboard → আপনার service → **Shell** খুলে চালান:
```bash
npm run seed:prod
```
এটা `ADMIN_EMAIL/ADMIN_PASSWORD` দিয়ে admin বানায় + ১৩২টি কার্ড import করে (৩টি approved, বাকি draft)।
শুধু ৩টি MVP কার্ড চাইলে: `SEED_FILE=apps/api/seeds/mvp-3-approved-cards.json npm run seed:prod`

(Shell না পেলে — লোকাল মেশিনে `MONGODB_URI` সেট করে `npm run seed` চালান; Atlas-এই ঢুকবে।)

## ৫. যাচাই (smoke test)
1. web URL → register → login।
2. ADMIN_EMAIL দিয়ে login → nav-এ "Admin" ও "যাচাই" দেখা যাবে।
3. `/learn` → একটা approved কার্ড → কোড ল্যাব চালান, কুইজ দিন, AI শিক্ষককে প্রশ্ন করুন।
4. `/teacher` → draft কার্ড review করুন।

---

## গুরুত্বপূর্ণ সতর্কতা (ফ্রি রাখতে)
- **Gemini billing চালু করবেন না।** project-এ billing চালু করলেই ওই project-এর free tier চলে যায় — প্রথম token থেকেই বিল হয়। আলাদা project-এ paid রাখুন যদি কখনো লাগে।
- **আসল key কখনো repo/commit/lock file-এ নয়** — শুধু Render/Vercel-এর env-এ।
- **free-tier Gemini prompt Google training-এ যেতে পারে** — শিক্ষার্থীদের ব্যক্তিগত তথ্য AI-তে না দিতে বলুন।
- Atlas M0, Render free, Vercel hobby — ছোট/ব্যক্তিগত ব্যবহারে যথেষ্ট। অনেক ব্যবহারকারী হলে paid লাগবে।

## ভুল হলে (troubleshooting)
- **login হয় কিন্তু সাথে সাথে logout / 401:** `CLIENT_ORIGIN` (Render) আর আসল Vercel URL হুবহু মেলে কিনা দেখুন; `NODE_ENV=production` আছে কিনা (cookie `secure`+`sameSite=none`-এর জন্য)।
- **CORS error:** একই — `CLIENT_ORIGIN` ভুল।
- **AI কাজ করে না:** `GEMINI_API_KEY` ও `AI_PROVIDER_ORDER` দেখুন; `…/api/health` connected কিনা।
- **কিছু approve/import করতে পারছি না:** `npm run seed:prod` চালিয়েছেন? login email = `ADMIN_EMAIL`?
- **প্রথম request খুব ধীর:** Render cold start — স্বাভাবিক; uptime ping দিন।
