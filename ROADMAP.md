# donray.dev Portfolio Roadmap

Tracking list for portfolio optimization work (SEO, AI-search visibility,
inbound conversion, content). Each item gets its own PR. Donray does not
want to be hands-on: implement fully, review screenshots yourself, keep
accessibility (WCAG 2.2 AA, axe-core CI) green on every change.

**Process per item:** implement → lint + typecheck + unit tests → Playwright
screenshot reviewed by the agent → PR → all 4 CI jobs green → merge → verify
live on donray.dev.

**Value key:** HIGH / MEDIUM / LOW = expected inbound impact for the effort.
Scrapped items list the reason. Blocked items list exactly what is needed.

---

## Tier 1 — Do first (small effort, high leverage)

### 1. robots.txt + sitemap.xml

- **What:** Add `app/robots.ts` and `app/sitemap.ts` (Next.js built-ins).
  Sitemap lists `/`, `/analytics`, `/version` (+ future pages). Robots allows
  all crawlers including AI crawlers (GPTBot, ClaudeBot, PerplexityBot).
- **Why:** Both return 404 today (verified live 2026-10-03). This is the
  crawlability floor — without it, Google and AI crawlers may never
  consistently index the site. Single cheapest fix on this list.
- **Evidence:** Consensus across 2026 portfolio SEO guides; Google's own
  guidance (first-hand content + clean crawlable foundation).
- **Effort:** Small. **Value:** HIGH.
- **Status:** DONE (PR #36)

### 2. JSON-LD Person schema

- **What:** Embed `Person` structured data in the homepage `<head>`:
  name, jobTitle "Engineering Manager", worksFor Justworks, `sameAs`
  GitHub + LinkedIn, `knowsAbout` skill list.
- **Why:** Consensus recommendation across 2026 portfolio SEO guides. Feeds
  Google's knowledge panel and is the same entity signal AI answer engines
  parse for "who is X" queries. Directional data point: sites with complete
  JSON-LD + static rendering cited ~3x more by AI engines (Web Almanac 2025
  via Medium — treat as directional, not causal).
- **Effort:** Small. **Value:** HIGH.
- **Status:** DONE (PR #37)

### 3. Richer title / meta / OG tags

- **What:** Per-page `<title>`, meta description, Open Graph + Twitter card
  tags. Homepage title gains location ("NYC Metro" — Donray lives in NJ, works out of NYC) and
  player-coach / frontend-leadership keywords. Add OG image.
- **Why:** Controls how the site appears in Google results and in
  LinkedIn/Twitter/Slack link previews — which is where recruiters first
  see it. Cheap, permanent.
- **Effort:** Small. **Value:** MEDIUM-HIGH.
- **Status:** DONE (PR #38)

### 4. "Open to conversations" section

- **What:** A compact homepage section (not a job-seeking badge — Donray is
  employed and the job search is on hold): EM coffee chats, frontend
  mentorship, conference speaking, podcast guesting, peer conversations.
  Include role types, remote/on-site, timezone, what he's not looking for.
- **Why:** Sep 2026 dev.to recruiter checklist: a specific "what I'm looking
  for" section beats a bare badge — it routes the right inbound in and
  filters noise out. Directly serves the "reach out to me faster" goal.
- **Effort:** Small. **Value:** MEDIUM-HIGH.
- **Status:** DONE (PR #39)

### 5. Site index for hidden public pages

- **What:** Make `/analytics` and `/version` discoverable. Footer already
  links `/analytics`; add `/version` alongside it (and confirm both are in
  the sitemap from item 1). Consider a small "Site" footer cluster.
- **Why:** Donray's ask (2026-10-02): "I also likely need a way for anyone
  to access these hidden public pages." Helps humans and crawlers.
- **Effort:** Small. **Value:** MEDIUM.
- **Status:** DONE (PR #40)

---

## Tier 2 — Do next (medium effort, highest citation/inbound value)

### 6. Justworks case study page (metric-led)

- **What:** Dedicated `/work/justworks-onboarding` (or `/projects/...`)
  page: problem → Donray's role/decisions → architecture → outcomes.
  Verified metrics available: new member onboarding flow — 6,800+ people
  across 1,365 companies in 30 days, 45,000 first-screen views (matching
  old flow's ~6,500); team-review flow — 476 people / 354 companies opened
  start page, 308 reached pay step / 287 companies; as EM Jun–Oct 2026:
  231 merged, 422 reviewed. Include quotable stat lines.
- **Why:** The consistent 2026 recommendation for converting hiring
  managers — they read case studies, not skill lists. Also directly aligned
  with the Princeton GEO findings: statistics in content increase AI-answer
  citation visibility ~30–41%. This is the highest-value single item.
- **Evidence:** 2026 portfolio guides consensus; Princeton GEO paper
  (Aggarwal et al., KDD 2024).
- **Effort:** Medium. **Value:** HIGH.
- **Status:** SCRAPPED 2026-10-03 — Donray killed it: publishing internal Justworks funnel metrics on a personal site is a confidentiality risk, and it ties his brand too closely to his current employer. PR #43 closed unmerged.

### 7. FAQ section + FAQPage schema

- **What:** Homepage or dedicated FAQ block: "What do you do at Justworks?",
  "Are you open to consulting / speaking / mentoring?", "What's your
  stack?", "Where are you based?" — direct answers first (40–60 words),
  with `FAQPage` JSON-LD.
- **Why:** The evidence-backed AEO play: FAQ schema + direct-answer-first
  formatting targets featured snippets and AI-answer extraction.
- **Effort:** Small. **Value:** MEDIUM-HIGH.
- **Status:** IN PROGRESS (PR #47)

### 8. llms.txt (+ llms-full.txt)

- **What:** Add `/llms.txt` following the llmstxt.org spec (H1 header,
  link map of key pages).
- **Why (honest):** Mostly hype — Google ignores it for Search, one study
  measured 0.1% of AI crawler traffic touching it and zero citation
  correlation across 300k domains. Counter-nuance: Chrome Lighthouse's May
  2026 Agentic Browsing audit checks for it. ~1 hour of work, so cheap
  insurance. Never pay a vendor for this.
- **Effort:** Small. **Value:** LOW-MEDIUM.
- **Status:** DONE (PR #41)

### 9. Cal.com / Calendly coffee-chat link

- **What:** 15–30 min booking link next to the email CTA.
- **Why:** Practitioner consensus ("zero friction") for collaborators and
  mentees; hard conversion data is thin.
- **Effort:** Small. **Value:** MEDIUM.
- **Status:** BLOCKED — needs Donray's Cal.com or Calendly link. Will not
  ship a dead placeholder.

### 10. donray.dev README quality pass

- **What:** Restructure the repo README: one-liner → problem → demo →
  stack & why → setup → "what I'd do differently." Add architecture notes
  (analytics pipeline, release flow).
- **Why:** Recruiters click through to GitHub; thin READMEs on AI-assisted
  projects are increasingly a yellow flag. The repo is public and linked
  from the site.
- **Effort:** Small. **Value:** MEDIUM.
- **Status:** TODO

---

## Tier 3 — Content engine (compounding returns, larger effort)

### 11. Blog (infrastructure + first post)

- **What:** `/blog` index + `/blog/[slug]` pages with `BlogPosting`
  JSON-LD, RSS. First post drafted from verified experience (EM
  player-coach topics, frontend onboarding/billing lessons).
- **Why:** The best-documented traffic magnet for dev portfolios ("one
  decent post every 2–3 weeks compounds"). Google's guidance rewards
  first-hand, non-commodity expertise — Donray's natural lane.
- **Effort:** Medium-Large. **Value:** HIGH.
- **Status:** TODO

### 12. /uses page

- **What:** The classic uses page: editor, stack, desk, tools.
- **Why:** Low-effort traffic magnet; quotable for "what does X use" AI
  queries.
- **Effort:** Small. **Value:** LOW-MEDIUM.
- **Status:** IN PROGRESS (PR #49)

### 13. Analytics write-up

- **What:** Short write-up of the public analytics page: what is tracked,
  what was learned, decisions it drove (e.g., the CloudWatch vs real
  page-view distinction).
- **Why:** Rare differentiator; "build in public" credibility. Public
  dashboards are cited in portfolio case studies as engagement drivers.
- **Effort:** Small. **Value:** MEDIUM.
- **Status:** IN PROGRESS (PR #50)

### 14. Per-project detail pages (/projects/[slug])

- **What:** Detail pages for each project instead of cards-only: problem,
  role, decisions, metrics, quotable stat lines.
- **Why:** Programmatic pages = discoverability surface; per-page citable
  passages = GEO surface.
- **Effort:** Medium. **Value:** MEDIUM.
- **Status:** TODO

### 15. Testimonial mini-stories

- **What:** 2–3 verifiable testimonials (former reports, peers): before →
  what changed → outcome, with name/role/LinkedIn link. Placed near the
  contact CTA.
- **Why:** Directional evidence (VWO landing-page data) + GEO evidence
  (quotations lift AI visibility ~10–28%).
- **Effort:** Medium. **Value:** MEDIUM.
- **Status:** BLOCKED — testimonials must be real; needs Donray to provide
  2–3 (or introductions). Will not fabricate.

### 16. Distribution hygiene

- **What:** Link donray.dev from GitHub profile + pinned repos, LinkedIn
  Featured + About, dev.to profile (cross-post blog), Peerlist/Wellfound.
- **Why:** "The portfolio converts; LinkedIn/GitHub discover" — backlinks
  from profiles matter more than new channels.
- **Effort:** Small, ongoing. **Value:** MEDIUM.
- **Status:** TODO (repo-side parts doable now; profile edits need Donray
  or a browser session)

---

## Scrapped — evaluated, not doing

- **"AI SEO" vendor pitches (llms.txt optimization services):** no evidence
  the file drives citations; the file itself is an hour of work (item 8).
- **Chat widgets:** no conversion evidence for personal portfolios; adds JS
  weight that hurts Core Web Vitals.
- **Heavy animations / decorative effects:** evidence says "boring,
  predictable" portfolios convert better; Framer Motion must not cost
  INP/CLS.
- **"AI-training-friendly directories":** no evidence found as a channel;
  the real lever is brand mentions in genuine communities.
- **Video walkthroughs:** the "+42% recruiter engagement" stat is unsourced;
  nice-to-have at best, not evidence-backed.

---

## Changelog

- 2026-10-03: Roadmap created from portfolio-optimization research
  (research_notes/portfolio-optimization-ai-age-20261003-0138). 16 items
  kept, 5 scrapped, 2 blocked.
- 2026-10-03: Item #6 (Justworks case study) scrapped per Donray — confidentiality risk; PR #43 closed unmerged. Location copy switched to "NYC Metro" framing (lives in NJ, works out of NYC).
- 2026-10-03: Item #6 (Justworks case study) scrapped per Donray — confidentiality risk. Location copy changed to "NYC Metro" framing.
