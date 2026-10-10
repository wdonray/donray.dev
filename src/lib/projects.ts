/**
 * Project structure (non-display fields). All display strings live in the
 * locale message catalogs under the `projects` namespace, keyed by slug.
 */
export interface ProjectStructure {
  slug: string;
  stack: string[];
  url?: string;
  /** Wayback Machine snapshot, used when the live site is gone. */
  archivedUrl?: string;
  github?: string;
  image?: string;
  /** Full-width screenshot shown on the project detail page. */
  screenshot?: string;
  /** Omitted for active projects. */
  status?: "discontinued" | "maintenance";
}

export const PROJECTS: ProjectStructure[] = [
  {
    slug: "pico-domains",
    stack: ["Nuxt.js", "TypeScript", "Vite", "CSS", "HTML5"],
    status: "discontinued",
    image: "/pico-domains.png",
    screenshot: "/pico-domains-screenshot.png",
  },
  {
    slug: "cyclei",
    stack: ["Vue 3", "TypeScript", "Vite", "GraphQL", "CSS", "HTML5"],
    status: "discontinued",
    image: "/cyclei.png",
    screenshot: "/cyclei-screenshot.png",
  },
  {
    slug: "hide-zero-cards",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "shadcn/ui"],
    url: "https://hidezerocards.org",
    github: "https://github.com/wdonray/c-hide-zero-cards",
    image: "/hide-zero-cards.png",
  },
  {
    slug: "patternspell",
    stack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Tailwind CSS",
      "DynamoDB",
      "AWS Amplify",
    ],
    url: "https://patternspell.org/",
    github: "https://github.com/wdonray/c-shepherd-speller",
    image: "/patternspell.png",
  },
  {
    slug: "donray-dev",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    github: "https://github.com/wdonray/donray.dev",
  },
];

export function getProject(slug: string): ProjectStructure | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
