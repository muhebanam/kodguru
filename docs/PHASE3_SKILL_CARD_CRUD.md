# Phase 3 — Skill Card CRUD + JSON Import/Export

এই phase-এ KodGuru platform-এ Skill Card management চালু করা হয়েছে।

## Backend API

- `GET /api/skill-cards` — public/student: শুধু approved card; admin/teacher: সব card
- `GET /api/skill-cards/:slug` — single card
- `POST /api/skill-cards` — admin only
- `PATCH /api/skill-cards/:slug` — admin only
- `DELETE /api/skill-cards/:slug` — admin only
- `PATCH /api/skill-cards/:slug/status` — admin/teacher
- `POST /api/skill-cards/import` — admin only, supports `{ cards, dryRun, mode }`
- `GET /api/skill-cards/export` — admin only

## Admin UI

- `/admin/skill-cards` — list, filter, approval queue
- `/admin/skill-cards/import` — JSON file/paste import, dry run, confirm import
- `/admin/skill-cards/new` — JSON editor based create form
- `/admin/skill-cards/[slug]` — JSON editor based edit form

## Student UI

- `/learn` — approved Skill Card list
- `/learn/[slug]` — lesson viewer with explanation, analogy, lesson steps, code examples, mistakes, practice, homework, quiz, mini project, and AI tutor placeholder

## Seed files

Included under `apps/api/seeds/`:

- `mvp-3-approved-cards.json`
- `skill-cards-seed-132.json`

## Import workflow

1. Login as admin
2. Open `/admin/skill-cards/import`
3. Select `apps/api/seeds/skill-cards-seed-132.json` or paste JSON
4. Click `Dry Run`
5. If report is valid, click `Confirm Import`
6. Open `/learn` to see approved cards

## Notes

- Express JSON body limit increased to `6mb` for 132-card imports.
- `Student` sees only `approved` cards.
- `Teacher` can set `reviewed` or `rejected`.
- `Admin` can approve, import, export, create, edit, delete.
