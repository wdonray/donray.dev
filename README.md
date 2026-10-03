# donray.dev

[![Tests](https://github.com/wdonray/donray.dev/actions/workflows/test.yml/badge.svg)](https://github.com/wdonray/donray.dev/actions/workflows/test.yml)
[![Coverage: 100%](https://img.shields.io/badge/coverage-100%25-brightgreen)](https://github.com/wdonray/donray.dev/actions/workflows/test.yml)

Personal portfolio of Donray Williams — Engineering Manager at Justworks.
Live at [donray.dev](https://www.donray.dev).

## What this is

A fast, accessible, single-owner portfolio. No CMS, no backend server — just
a Next.js app with a public analytics dashboard backed by DynamoDB.

## Tech stack

- **Framework:** Next.js 16 (App Router, static-first)
- **Language:** TypeScript, React 19
- **Styling:** Tailwind CSS v4, shadcn/ui, Lucide icons
- **Motion:** Framer Motion (entrance animations only — no layout shift)
- **Analytics:** Custom-built, privacy-respecting page-view tracking on
  DynamoDB (`donray-dev-page-views`). One page load per page per session,
  bots filtered, daily uniques via salted SHA-256(IP + UA + day) — raw IPs
  never stored, ~400-day TTL.
- **SEO/AI visibility:** `robots.txt` + `sitemap.xml` (Next.js routes),
  Person + FAQPage + BlogPosting JSON-LD, Open Graph/Twitter cards,
  `llms.txt`, RSS feed
- **Security:** HSTS, CSP, X-Frame-Options DENY, and other hardening headers
  in `next.config.ts`; per-IP rate limiting on `/api/track`
- **Hosting:** AWS Amplify (us-east-1), auto-builds on every release
- **CI:** GitHub Actions — Build, Lint (oxlint + oxfmt), Unit (Vitest),
  E2E (Playwright + axe-core WCAG 2.2 AA). All four required to merge.
  Unit tests enforce 100% coverage (statements, branches, functions,
  lines); E2E asserts every page renders substantive content.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

The analytics dashboard degrades gracefully without AWS credentials —
it shows an "isn't configured" state instead of crashing.

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Homepage: Hero, Skills, Projects,
│   │                         #   Experience, Open to conversations, FAQ
│   ├── analytics/page.tsx    # Public analytics dashboard
│   ├── blog/
│   │   ├── page.tsx          # Blog index
│   │   └── [slug]/page.tsx   # Individual posts + BlogPosting JSON-LD
│   ├── projects/[slug]/page.tsx  # Per-project detail pages
│   ├── uses/page.tsx         # /uses: tools and setup
│   ├── version/page.tsx      # Running build vs latest release
│   ├── api/track/route.ts    # Page-view ingestion endpoint (rate-limited)
│   ├── robots.ts             # /robots.txt (allows AI crawlers)
│   ├── rss.xml/route.ts      # /rss.xml feed
│   ├── sitemap.ts            # /sitemap.xml
│   └── llms.txt/route.ts     # /llms.txt for AI crawlers
├── components/
│   ├── ui/                   # shadcn/ui primitives
│   ├── hero.tsx              # ...
│   ├── open-to-conversations.tsx
│   └── faq.tsx               # FAQ + FAQPage JSON-LD
├── lib/
│   ├── analytics.ts          # DynamoDB tracking + summary queries
│   ├── blog.ts               # Blog post definitions
│   ├── projects.ts           # Project definitions
│   └── schema.ts             # JSON-LD builders (Person, FAQPage, BlogPosting)
e2e/
├── a11y.spec.ts              # axe-core WCAG 2.2 AA scan of every page
└── security.spec.ts          # Security header assertions
```

## Design decisions

- **Accessibility is a gate, not a goal.** Every page is axe-core scanned
  against WCAG 2.2 AA in CI. It fails the build otherwise.
- **Boring converts.** No decorative animation, no chat widgets — the
  portfolio's job is to be found, read, and contacted.
- **Analytics are public and honest.** The dashboard labels estimates as
  estimates and separates real tracked page views from historical
  CDN-request figures. See `src/lib/analytics.ts`.
- **Screenshots are review artifacts.** They gate PRs locally but are never
  committed to the repo.

## Release flow

Version bumps (`npm version patch`) trigger an Amplify build automatically
— `[skip-cd]` is never used on release commits. `/version` compares the
running build against the latest GitHub release.

## Testing

- `npm run test:unit` — Vitest + Testing Library (`*.test.ts(x)` next to source)
- `npm run test:e2e` — Playwright against a production build, including the
  axe-core accessibility scan
- `npm test` — both suites
- `npm run lint` / `npm run format:check` / `npm run typecheck`

## Contact

- [LinkedIn](https://www.linkedin.com/in/donrayxwilliams/)
- [GitHub](https://github.com/wdonray)
