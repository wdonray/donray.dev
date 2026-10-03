import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Case study: Justworks member onboarding — donray.dev",
  description:
    "How Donray Williams shipped Justworks' new member onboarding flow as a player-coach Engineering Manager: 6,800+ people across 1,365 companies in 30 days.",
  openGraph: {
    title: "Case study: Justworks member onboarding",
    description:
      "Player-coach EM, team of 3. New onboarding flow: 6,800+ people across 1,365 companies in its first 30 days.",
    url: "https://www.donray.dev/work/justworks-onboarding",
    type: "article",
  },
};

const STATS = [
  {
    value: "6,800+",
    label: "people onboarded through the new flow in its first 30 days",
  },
  {
    value: "1,365",
    label: "companies those people came from",
  },
  {
    value: "45,000",
    label: "first-screen views in that same window",
  },
  {
    value: "~6,500",
    label: "people the old flow served in a comparable 30 days — parity on day one",
  },
];

const REVIEW_FLOW_STATS = [
  { value: "476", label: "people opened the team-review start page" },
  { value: "354", label: "companies they came from" },
  { value: "308", label: "reached the pay step" },
  { value: "287", label: "companies reached the pay step" },
];

function articleJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Case study: shipping Justworks' new member onboarding flow",
    author: {
      "@type": "Person",
      name: "Donray Williams",
      url: "https://www.donray.dev",
    },
    about: "Frontend engineering leadership and product delivery",
    url: "https://www.donray.dev/work/justworks-onboarding",
  };
}

export default function CaseStudyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd()) }}
      />
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back home
      </Link>

      <article className="mt-8 space-y-10">
        <header className="space-y-4">
          <p className="text-sm font-medium text-primary uppercase tracking-wide">
            Case study · Justworks
          </p>
          <h1 className="text-4xl font-bold tracking-tight">
            Shipping the new member onboarding flow
          </h1>
          <p className="text-lg text-muted-foreground">
            Player-coach Engineering Manager, team of 3. I led the frontend
            for member onboarding and billing — and shipped the flow that now
            onboards Justworks customers.
          </p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="space-y-4" aria-labelledby="problem">
          <h2 id="problem" className="text-2xl font-bold tracking-tight">
            The problem
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Member onboarding is the front door of a payroll and HR platform:
            it is the first thing a new customer&apos;s team touches, and
            every point of friction there costs trust. Justworks needed a new
            onboarding flow — one that could carry the company&apos;s growth
            without dropping the people going through it.
          </p>
        </section>

        <section className="space-y-4" aria-labelledby="role">
          <h2 id="role" className="text-2xl font-bold tracking-tight">
            My role
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            I&apos;m a player-coach: I manage the team and I&apos;m still in
            the code. For this project that meant setting the technical
            direction for the frontend, reviewing the team&apos;s work, and
            writing production code myself. My team of 3 owns frontend for
            both onboarding and billing, so the flow had to integrate cleanly
            with the systems we already run.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Between June and October 2026, the team merged 231 pull requests
            and I reviewed 422 — the review load that comes with staying
            technical while managing.
          </p>
        </section>

        <section className="space-y-4" aria-labelledby="outcomes">
          <h2 id="outcomes" className="text-2xl font-bold tracking-tight">
            Outcomes
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            In its first 30 days, the new member onboarding flow served at
            least 6,800 people across 1,365 companies, with 45,000
            first-screen views — matching the old flow&apos;s roughly 6,500
            people in a comparable window. Parity on day one, on a brand-new
            flow.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            The team-review flow told the same story further down the funnel:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {REVIEW_FLOW_STATS.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4" aria-labelledby="learned">
          <h2 id="learned" className="text-2xl font-bold tracking-tight">
            What I learned
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
            <li>
              Staying in the code as a manager isn&apos;t about output —
              it&apos;s about judgment. Reviewing 422 PRs in four months
              keeps your standards calibrated to what the team actually
              ships.
            </li>
            <li>
              Funnel metrics beat vanity metrics. Counting people and
              companies at each step — not page views — told us exactly where
              the flow was working.
            </li>
            <li>
              Parity with the old system on launch day is the real milestone.
              New is only better if nobody notices the switch.
            </li>
          </ul>
        </section>

        <footer className="border-t border-border pt-8">
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="pt-6 space-y-2">
              <h2 className="font-semibold text-lg">
                Want the full story?
              </h2>
              <p className="text-sm text-muted-foreground">
                I&apos;m happy to walk through the technical decisions,
                trade-offs, and what I&apos;d do differently — reach out.
              </p>
              <a
                href="mailto:donrayxwilliams@gmail.com"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary underline underline-offset-4 hover:opacity-80"
              >
                <Mail className="size-4" aria-hidden="true" />
                donrayxwilliams@gmail.com
              </a>
            </CardContent>
          </Card>
        </footer>
      </article>
    </div>
  );
}
