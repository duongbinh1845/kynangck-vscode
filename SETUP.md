# KynangCK Vercel + Supabase Setup Guide

## Problem Diagnosis

The live site (`https://kynangck.vercel.app`) had three failures:
1. **Empty homepage** — no projects displayed
2. **Admin login failed** — password not accepted
3. **File size grew from 940KB to 400MB** — caused by `node_modules` (12,550 files)

**Root cause:** Vercel's Vite preset serves only static `dist/` folder and never executes the Express server (`dist/server.cjs`), so all `/api/*` routes returned 404.

**Solution:** Migrate to Vercel's native serverless functions (TypeScript files in `api/` folder).

---

## Setup Steps

### 1. Run Supabase Schema (One-time)

Go to [Supabase Dashboard](https://app.supabase.com) > Your Project > SQL Editor > New query

Copy-paste the entire content of:
```
supabase/schema.sql
```

Then click **Run**. This creates the `app_state` table with RLS enabled.

### 2. Seed Initial Data

In your local terminal at `d:\JOB\KynangCK\Web\kynangck-vscode`:

```bash
npx tsx scripts/seed-supabase.ts
```

This reads your local `data/db.json` (if it exists) or uses minimal defaults, then uploads each collection to Supabase.

**Expected output:**
```
🌱 Starting Supabase seed...
📂 Found local db.json at ...
⏳ Upserting "projects"...
✅ "projects" seeded successfully
... (repeat for each collection)
✨ Supabase seed complete!
```

### 3. Verify Supabase Data

In [Supabase Dashboard](https://app.supabase.com), go to:
- **Table Editor** (left sidebar)
- Select `app_state` table
- Should see 9 rows: `projects`, `parents`, `corporates`, `transactions`, `news`, `notifications`, `cms`, `feedbacks`, `guessingGameScreens`

### 4. Environment Variables in Vercel

Go to [Vercel Dashboard](https://vercel.com) > Your Project > Settings > Environment Variables

Ensure these are set:

| Variable | Value | Source |
|----------|-------|--------|
| `SUPABASE_URL` | `https://glvwgkpfqemttwalitku.supabase.co` | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_KEY` | `eyJhbGci...` (the long JWT) | Supabase Dashboard > Settings > API > Service Role Secret |
| `ADMIN_PASSWORD` | `<new-password>` | **IMPORTANT: Change from `kynangck-admin`** (exposed in chat) |
| `NODE_ENV` | `production` | (optional, Vercel sets automatically) |

**⚠️ Security:** The password `kynangck-admin` was shared in this chat. Rotate it now:
1. Choose a new strong password (e.g., generate with `openssl rand -base64 32`)
2. Update it in Vercel Environment Variables
3. Never paste secrets in chat again

### 5. Deploy

Push your local changes to GitHub:

```bash
cd d:\JOB\KynangCK\Web\kynangck-vscode
git status
git add -A
git commit -m "..."
git push origin main
```

Vercel will auto-deploy within ~1 minute. Check [Vercel Deployments](https://vercel.com/dashboard) for status.

### 6. Test Live Site

1. **Homepage (projects list):**
   - Visit `https://kynangck.vercel.app`
   - Should see projects (or be empty if you skipped seeding)

2. **Admin login:**
   - Click settings icon (gear) in footer
   - Enter your new password (from step 4)
   - Should redirect to admin portal

---

## API Endpoints (Vercel Serverless)

All endpoints now run as serverless functions in `api/` folder:

| Endpoint | File | Auth | Purpose |
|----------|------|------|---------|
| `POST /api/auth/login` | `api/auth/login.ts` | ❌ | Generate 12h admin token |
| `GET /api/auth/verify` | `api/auth/verify.ts` | ❌ | Check if token valid |
| `GET /api/projects` | `api/projects.ts` | ❌ | Fetch projects from Supabase |
| `GET /api/cms` | `api/cms.ts` | ❌ | Fetch CMS config |
| `GET /api/news` | `api/news.ts` | ❌ | Fetch news articles |
| `GET /api/feedbacks` | `api/feedbacks.ts` | ✅ | Fetch/post feedbacks |
| ... | `server.ts` | ❌ | Dev only (not used on Vercel) |

---

## What Changed

### New Files
- `api/auth/login.ts` — admin login function
- `api/auth/verify.ts` — token verification
- `api/projects.ts`, `api/cms.ts`, `api/news.ts`, `api/feedbacks.ts` — data fetch functions
- `vercel.json` — Vercel deployment config
- `scripts/seed-supabase.ts` — seed script

### Modified Files
- `package.json` — added `@vercel/node`
- `.env` — already has correct credentials

### Deleted Files (from earlier work)
- `firebase-applet-config.json`, `firestore.rules`, `data/` (no longer needed)

---

## Troubleshooting

### "Projects not showing on homepage"
- [ ] Supabase schema created? (Check: SQL Editor in Supabase)
- [ ] Data seeded? (Run: `npx tsx scripts/seed-supabase.ts`)
- [ ] `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` set in Vercel? (Check: Settings > Environment Variables)
- [ ] Deployment finished? (Check: Vercel Deployments tab, should say "Ready")

### "Admin login fails"
- [ ] Using correct new password (not `kynangck-admin`)?
- [ ] Token stored in browser? (Check: DevTools > Application > Local Storage > `kynangck_admin_token`)
- [ ] RLS enabled in Supabase? (Check: `supabase/schema.sql` was run)

### "Error: Supabase not configured"
- [ ] `.env` has valid keys? (Check: `SUPABASE_SERVICE_KEY` is not placeholder)
- [ ] Schema created? (Check: Supabase SQL Editor history)

---

## Next Steps (Optional)

1. **Add more admin endpoints** — follow the pattern in `api/feedbacks.ts` for POST with auth
2. **Add more public endpoints** — copy `api/projects.ts` pattern
3. **Monitor Vercel logs** — Vercel Dashboard > Deployments > [Your deployment] > Logs
4. **Set up custom domain** — Vercel Dashboard > Domains

---

## Questions?

- Vercel docs: https://vercel.com/docs
- Supabase docs: https://supabase.com/docs
- This guide location: `README.md` (soon)
