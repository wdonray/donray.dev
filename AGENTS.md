# AGENTS.md

Operating notes for AI agents working in this repo. Donray is the owner;
he decides, you execute. He verifies your work as a habit — be precise.

## Workflow

- **One PR per task.** Small, focused PRs. Merge once CI is green — no
  extra review pass needed from Donray.
- **Run formatting before the first push:** `npx oxfmt .`
- **Screenshots gate PRs but are never committed.** Take local Playwright
  screenshots to review UI changes, show them in chat, keep them out of
  the repo.
- **Release flow:** version bumps (`npm version patch`) trigger an Amplify
  build automatically. Never put `[skip-cd]` on release commits.
- **Accessibility is a CI gate.** axe-core scans against WCAG 2.2 AA in
  `e2e/a11y.spec.ts`. New interactive elements need real touch targets
  (24px minimum).

## Stack

- Next.js 16 (App Router, static-first), React 19, TypeScript
- Tailwind CSS v4, shadcn/ui, Lucide icons, Framer Motion
- Vitest + Testing Library for unit tests, Playwright for e2e
- Hosting: AWS Amplify (us-east-1). Analytics: DynamoDB (`donray-dev-page-views`).

## Conventions

- **Evaluate features for value; scrap low-value or risky ideas.** Donray
  would rather cut than ship something marginal.
- **No em dashes in user-facing copy.** They read as AI-written. Use
  commas, colons, parentheses, or split the sentence instead.
- **Copy must stay truthful.** Human-facing location is "NYC Metro".
  Don't invent metrics, testimonials, or experience claims — use only
  what Donray has verified.
- **Security headers live in `next.config.ts`.** If you add an external
  fetch (API, font, script), update the CSP `connect-src`/`script-src`
  accordingly or CI's e2e tests will catch it.
- **The `/api/track` endpoint is rate-limited** (see `src/lib/analytics.ts`).
  Don't add unauthenticated write endpoints without abuse protection.

## Blog

Posts live in `src/content/blog/*.mdx` with frontmatter (`title`, `date`,
`excerpt`). They render via `next-mdx-remote` with:

- **Syntax highlighting** via `rehype-pretty-code` (Shiki, `github-light` theme)
- **Anchor links** on h2/h3 via `rehype-slug` + `rehype-autolink-headings`
- **Table of contents** via `getHeadings()` in `src/lib/blog.ts`
- **Reading time** via the `reading-time` package

To add a post: create the `.mdx` file, no code changes needed. The index,
RSS feed, sitemap, and JSON-LD pick it up automatically. Element styling
lives in `src/components/mdx-components.tsx`.

### Writing standards (research-backed, Oct 2026)

Every post must pass the **information gain test**: can Donray point to one
new datapoint, real story, or original take that doesn't exist elsewhere?
If not, don't publish. AI can write generic advice; only he has his
experience.

**Structure (for humans and AI engines):**
- Answer the core question in the first 40-60 words (featured snippets + AI citations).
- Direct, self-contained answer in the first sentence or two of every section, before context or story. Each section should be quotable standalone.
- 3-5 H2 sections, 1,000-2,000 words. Table of contents is automatic.
- End with an FAQ section (5-8 real questions, direct answers) where it fits. Add FAQPage JSON-LD for the post.
- A "Citable Statistics" table where real numbers exist (his onboarding metrics, review counts). Statistics lift AI citation visibility ~30-40%.

**Voice (anti-slop):**
- First person, specific stories, real constraints (team size, deadlines, trade-offs). "With a team of 3 owning onboarding for 1,365 companies" beats generic advice every time.
- No AI tells: no em dashes, no "delve/landscape/tapestry", no "not just X, but Y", no rule-of-three adjective lists, no throat-clearing intros.
- Opinions with teeth beat safe takes. Failures and retrospectives are un-sloppable.
- Never publish Justworks internals. Patterns and metrics at altitude.

**Themes (repeat these, build identity):** player-coach leadership, frontend
architecture decisions, onboarding/billing UX lessons, small-team leverage,
engineering career craft. Roughly 70% technical, 30% management/opinion.

**Cadence:** one solid post every 2 weeks, sustained. Missing weeks is fine;
abandoning the blog is the failure mode.

## Testing

- `npm run test:unit` — Vitest (`*.test.ts(x)` next to source)
- `npm run test:e2e` — Playwright against a production build
- `npm test` — both
- Add tests for new behavior, especially security and analytics logic.
