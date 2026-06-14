# KodGuru v0.2 — Phase 1 hardening + Phase 2 auth foundation

## কী যুক্ত/সংশোধন করা হয়েছে

1. **API MongoDB ছাড়া development mode-এ boot করবে**
   - `MONGODB_URI` খালি থাকলে API বন্ধ হবে না।
   - `/api/health` → `db: disconnected` দেখাবে।
   - `/api/health/ready` → DB না থাকলে 503 দিবে।

2. **`@kodguru/shared` এখন real buildable package**
   - source export বাদ দিয়ে `dist/index.js` এবং `dist/index.d.ts` export করা হয়েছে।
   - root scripts shared package আগে build করে।

3. **JWT secret hardening**
   - production mode-এ `change-me-access`/`change-me-refresh` default secret reject করবে।
   - access secret ও refresh secret আলাদা না হলে production boot করবে না।

4. **Service worker private route cache বন্ধ**
   - `/dashboard`, `/admin`, `/teacher`, `/profile`, `/settings`, `/homework`, `/practice`, `/ai-tutor` cache হবে না।
   - API response cache হবে না।

5. **Backend auth foundation**
   - `POST /api/auth/register`
   - `POST /api/auth/login`
   - `POST /api/auth/logout`
   - `GET /api/auth/me`
   - HTTPOnly cookies: `kodguru_access`, `kodguru_refresh`
   - roles: `student`, `teacher`, `admin`
   - `authenticate` middleware
   - `requireRole(...)` middleware
   - protected sample route: `GET /api/admin/ping`

6. **Frontend auth pages**
   - `/register`
   - `/login`
   - basic `/profile`, `/admin`, `/teacher` placeholder pages
   - middleware cookie-check route guard for protected pages

7. **Testing setup**
   - Shared package: Vitest schema tests
   - API: Vitest + Supertest tests
   - Tested: health route, ready route, Bengali 404 envelope, protected admin route

## Run commands

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
npm run build:shared
npm run dev:api
npm run dev:web
```

## Test commands

```bash
npm run typecheck
npm test
```

## Verified in this environment

- `npm run typecheck` passed
- `npm test` passed: 7 tests
- `npm run build:shared` passed
- `apps/api` production TypeScript build passed
- `apps/web` Next build compiled and generated static pages, but this sandbox timed out at Next.js "Collecting build traces" stage. Source typecheck passed, so run full `npm run build` locally/CI to confirm final trace packaging.

## Next recommended phase

Phase 3:
- Skill Card MongoDB model
- Skill Card CRUD API
- Admin Skill Card form
- JSON import/export
- 3 MVP Skill Cards: VS Code, HTML5, CSS3
