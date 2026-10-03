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

## Testing

- `npm run test:unit` — Vitest (`*.test.ts(x)` next to source)
- `npm run test:e2e` — Playwright against a production build
- `npm test` — both
- Add tests for new behavior, especially security and analytics logic.
