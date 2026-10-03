import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uses | donray.dev",
  description:
    "The tools Donray Williams uses to build: editors, languages, frameworks, and infrastructure.",
};

const GROUPS: { title: string; items: { name: string; note: string }[] }[] = [
  {
    title: "Editors & AI",
    items: [
      {
        name: "Cursor",
        note: "Daily driver for writing code with AI assistance.",
      },
      {
        name: "Claude Code",
        note: "Agentic coding for larger refactors and multi-file work.",
      },
    ],
  },
  {
    title: "Languages",
    items: [
      { name: "TypeScript", note: "Default for all frontend work." },
      { name: "JavaScript", note: "Where it all started." },
      { name: "Ruby", note: "Rails backend work at Justworks." },
      { name: "Go", note: "Tooling and services." },
    ],
  },
  {
    title: "Frontend",
    items: [
      { name: "Vue", note: "Primary framework: Justworks and this site." },
      { name: "Vite", note: "Build tooling." },
      { name: "Vitest", note: "Unit testing." },
      {
        name: "Playwright",
        note: "E2E testing, including accessibility scans.",
      },
      { name: "Tailwind CSS", note: "Styling for this site." },
    ],
  },
  {
    title: "Backend & data",
    items: [
      { name: "Ruby on Rails", note: "API work." },
      { name: "Node.js", note: "Scripts, tooling, and this site's runtime." },
      { name: "MySQL", note: "Relational data." },
      { name: "DynamoDB", note: "Powers this site's public analytics." },
    ],
  },
  {
    title: "Infrastructure",
    items: [
      { name: "AWS", note: "Amplify for hosting, S3 for assets." },
      {
        name: "GitHub Actions",
        note: "CI: build, lint, unit, and E2E on every PR.",
      },
      { name: "Datadog", note: "Observability at work." },
    ],
  },
];

export default function UsesPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-24 pb-16">
      <div className="space-y-2">
        <div className="h-1 w-10 rounded-full bg-primary" aria-hidden="true" />
        <h1 className="text-3xl font-bold tracking-tight">Uses</h1>
        <p className="text-muted-foreground">
          The tools I reach for to build and ship software.
        </p>
      </div>
      <div className="mt-10 space-y-10">
        {GROUPS.map((group) => (
          <section key={group.title} aria-labelledby={group.title}>
            <h2
              id={group.title}
              className="text-xl font-bold tracking-tight mb-4"
            >
              {group.title}
            </h2>
            <dl className="divide-y divide-border rounded-xl border bg-card">
              {group.items.map((item) => (
                <div key={item.name} className="px-6 py-4">
                  <dt className="font-semibold">{item.name}</dt>
                  <dd className="text-sm text-muted-foreground mt-1">
                    {item.note}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
