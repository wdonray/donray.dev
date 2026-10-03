/**
 * Structured data (JSON-LD) for the site. The Person schema feeds Google's
 * knowledge panel and is the entity signal AI answer engines parse for
 * "who is X" queries.
 */

export interface PersonSchema {
  "@context": "https://schema.org";
  "@type": "Person";
  name: string;
  url: string;
  jobTitle: string;
  worksFor: { "@type": "Organization"; name: string };
  sameAs: string[];
  knowsAbout: string[];
  address: {
    "@type": "PostalAddress";
    addressLocality: string;
    addressRegion: string;
    addressCountry: string;
  };
}

export function getPersonJsonLd(): PersonSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Donray Williams",
    url: "https://www.donray.dev",
    jobTitle: "Engineering Manager",
    worksFor: {
      "@type": "Organization",
      name: "Justworks",
    },
    sameAs: [
      "https://github.com/wdonray",
      "https://www.linkedin.com/in/donrayxwilliams/",
    ],
    knowsAbout: [
      "Engineering Management",
      "Frontend Development",
      "JavaScript",
      "TypeScript",
      "Vue",
      "Ruby on Rails",
      "Go",
      "HTML",
      "CSS",
      "REST APIs",
      "MySQL",
      "Vitest",
      "Playwright",
      "Git",
      "GitHub Actions",
      "AWS",
      "Datadog",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Hamburg",
      addressRegion: "NJ",
      addressCountry: "US",
    },
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqPageSchema {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: {
    "@type": "Question";
    name: string;
    acceptedAnswer: { "@type": "Answer"; text: string };
  }[];
}

export function getFaqJsonLd(faqs: FaqItem[]): FaqPageSchema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/**
 * Serialize JSON-LD for injection into a <script> tag.
 *
 * Escapes `<` so a `</script>` sequence in data can never break out of the
 * script element (XSS defense in depth). The data is currently all static,
 * but this makes the serialization safe by construction.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
