import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How donray.dev handles your data: what is collected, what is not, and your rights.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy",
    description:
      "How donray.dev handles your data: what is collected, what is not, and your rights.",
    url: "/privacy",
  },
};

const EFFECTIVE_DATE = "October 10, 2026";
const CONTACT_EMAIL = "donrayxwilliams@gmail.com";

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "What this site collects",
    body: [
      "donray.dev runs its own first-party analytics. When you load a page, the site records the page path, the time of the visit, and a salted SHA-256 hash of your IP address combined with your browser's user agent string. That hash is how unique visitors are counted: it lets the site recognize a returning visitor without ever storing who they are.",
      "That is the full extent of it. There are no user accounts, no login, no comments, no newsletter, no contact forms, and no e-commerce. Clicking an email link opens your own mail client; the site itself collects nothing from that interaction.",
    ],
  },
  {
    title: "What this site does not collect",
    body: [
      "No cookies are set for analytics or tracking. No raw IP addresses are stored by the application. No names, email addresses, or other personal details are collected through the site itself. The analytics cannot be reversed to identify you: a salted hash is a one-way fingerprint, and the salt is never published.",
    ],
  },
  {
    title: "Why it is collected",
    body: [
      "The analytics exist for one reason: to understand readership. The counts power the public dashboard at /analytics, which shows total page views and unique visitors per page. Nothing is collected for advertising, and nothing is sold or shared with data brokers.",
    ],
  },
  {
    title: "How long it is kept",
    body: [
      "Visitor hashes are kept permanently. That is what makes the unique count honest: a visitor who returns a year later still counts once, because their hash is still in the set. Page view totals are also kept permanently. If you would like your hash removed from the set, contact me at the email below and I will remove what can be identified; note that because hashes cannot be reversed, removal works best when you can describe the approximate time and pages of your visits.",
    ],
  },
  {
    title: "Third parties",
    body: [
      "The site is hosted on AWS Amplify with DNS through Amazon Route 53. As the hosting provider and DNS operator, Amazon may log request data (such as IP addresses) under its own privacy policies, independent of anything described here. No other third-party analytics, advertising, or tracking services run on this site.",
    ],
  },
  {
    title: "Your rights",
    body: [
      "If you are in the EU or UK, you have rights over your personal data under the GDPR, including the right to access it, to have it deleted, and to object to its processing. Because the analytics store only a salted hash rather than your IP address directly, the practical scope of these rights is narrow, but the rights still apply. To exercise them, or to ask any privacy question, email me and I will respond.",
    ],
  },
  {
    title: "Children",
    body: [
      "This site is a personal technical blog and portfolio. It is not directed at children under 13, and I do not knowingly collect personal data from children.",
    ],
  },
  {
    title: "Changes to this policy",
    body: [
      "This policy may change as the site evolves. When it does, the effective date at the top of this page will be updated. Significant changes will also be noted on the site itself.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-24 pb-16">
      <div className="space-y-2">
        <div className="h-1 w-10 rounded-full bg-primary" aria-hidden="true" />
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted-foreground">
          Effective {EFFECTIVE_DATE}. This page explains what donray.dev
          collects, what it does not collect, and your rights. For questions,
          email{" "}
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
