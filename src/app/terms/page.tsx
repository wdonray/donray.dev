import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms for using donray.dev: content ownership, acceptable use, and disclaimers.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Use",
    description:
      "The terms for using donray.dev: content ownership, acceptable use, and disclaimers.",
    url: "/terms",
  },
};

const EFFECTIVE_DATE = "October 10, 2026";
const CONTACT_EMAIL = "donrayxwilliams@gmail.com";

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "Content ownership",
    body: [
      "Everything on donray.dev, including blog posts, project descriptions, and the site's design and code, belongs to Donray Williams unless stated otherwise. You may read, link to, and quote the content with attribution for non-commercial purposes. Anything beyond that, including republication or commercial reuse, requires permission: email me and ask.",
      "Code snippets shown in blog posts are provided as illustrations. Unless a snippet says otherwise, treat it as all rights reserved rather than freely licensed.",
    ],
  },
  {
    title: "Acceptable use",
    body: [
      "Use the site normally and we will get along fine. Specifically, do not abuse the public analytics endpoint (/api/track) or any other part of the site: no inflating page view or visitor counts, no scraping at a rate that degrades the service, no attempting to disrupt, reverse engineer, or gain unauthorized access to the site or its infrastructure. Automated access that respects the site's rate limits and does not distort the public statistics is fine; anything designed to game the numbers is not.",
      "If you find a security issue, I would rather hear about it than discover it from an incident. Contact me at the email below.",
    ],
  },
  {
    title: "Disclaimers",
    body: [
      "The content here is personal opinion and experience, written to be useful, not to be advice. Blog posts about engineering, management, and careers reflect what worked for me in my context; your context differs. Nothing on this site is professional, legal, financial, or medical advice.",
      "The site is provided as is, without warranties of any kind. I work to keep the content accurate and the site available, but I make no guarantees about correctness, completeness, or uptime.",
    ],
  },
  {
    title: "Limitation of liability",
    body: [
      "To the maximum extent permitted by law, Donray Williams is not liable for any damages arising from your use of this site or reliance on its content, whether direct, indirect, incidental, or consequential. If you disagree with these terms, your remedy is to stop using the site.",
    ],
  },
  {
    title: "Third-party links",
    body: [
      "The site links to external sites (GitHub, LinkedIn, project demos, and others). I am not responsible for the content, privacy practices, or availability of external sites.",
    ],
  },
  {
    title: "Governing law",
    body: [
      "These terms are governed by the laws of the State of New Jersey, without regard to its conflict-of-law principles.",
    ],
  },
  {
    title: "Changes to these terms",
    body: [
      "These terms may change as the site evolves. When they do, the effective date at the top of this page will be updated. Continued use of the site after changes take effect constitutes acceptance of the updated terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-24 pb-16">
      <div className="space-y-2">
        <div className="h-1 w-10 rounded-full bg-primary" aria-hidden="true" />
        <h1 className="text-3xl font-bold tracking-tight">Terms of Use</h1>
        <p className="text-muted-foreground">
          Effective {EFFECTIVE_DATE}. By using donray.dev you agree to these
          terms. For questions, email{" "}
          <Link
            href={`mailto:${CONTACT_EMAIL}`}
            className="underline underline-offset-4 hover:text-foreground"
          >
            {CONTACT_EMAIL}
          </Link>
          .
        </p>
      </div>
      <div className="mt-10 space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.title} aria-labelledby={section.title}>
            <h2
              id={section.title}
              className="text-xl font-bold tracking-tight mb-4"
            >
              {section.title}
            </h2>
            <div className="space-y-3">
              {section.body.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-muted-foreground leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
