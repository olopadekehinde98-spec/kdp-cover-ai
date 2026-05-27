@AGENTS.md

# KDP Cover AI — Project Context for Claude

## Vercel Deployment (CRITICAL — READ FIRST)

There are TWO Vercel projects. Always use the correct one:

| Project | URL | Purpose |
|---------|-----|---------|
| `kdp-cover-ai` ✅ CORRECT | kdpcoverai.site | PRODUCTION — this is the live site |
| `kdp-cover-ai-f1kw` ❌ WRONG | kdp-cover-ai-f1kw.vercel.app | Old/orphaned project — ignore |

**The local `.vercel/project.json` is linked to `kdp-cover-ai` (correct).**

Before every deployment task, run the status check:
```powershell
.\scripts\check-deployment.ps1
```

When you push to git, Vercel auto-deploys to `kdp-cover-ai` → `kdpcoverai.site`. You do NOT need to run `vercel alias set` after a git push — it deploys automatically.

Only run `vercel alias set` if a deployment is stuck or you need to roll back.

## Key Facts

- **Domain**: kdpcoverai.site (DNS managed by Vercel)
- **Git**: github.com/olopadekehinde98-spec/kdp-cover-ai, branch `master`
- **Owner email**: olopadekehinde98@gmail.com — auto-granted AGENCY plan on sign-up
- **Clerk**: Production instance (`pk_live_` keys) — NOT development
- **Database**: Neon PostgreSQL (connection string in Vercel env vars)
- **Payment**: Flutterwave (NGN for card, USD via bank transfer)

## Env Vars

All secrets are in Vercel. Never hardcode. Run `npx vercel env pull .env.local` to sync locally.

## social-media/ folder

This folder contains video frames and MP4s — it is gitignored. Never commit it.
