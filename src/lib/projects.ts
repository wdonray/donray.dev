export interface ProjectDetail {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  role: string;
  stack: string[];
  url?: string;
  github?: string;
  image?: string;
  imageAlt?: string;
  details: string[];
}

export const PROJECTS: ProjectDetail[] = [
  {
    slug: "pico-domains",
    title: "pico.domains",
    subtitle: "Ultra-Short Domain Search Engine",
    description:
      "Smart search engine for ultra-short domains. Curates available concise domains and connects with trusted marketplaces.",
    role: "Builder",
    stack: ["Nuxt.js", "TypeScript", "Vite", "CSS", "HTML5"],
    url: "https://www.pico.domains/",
    image: "/pico-domains.png",
    imageAlt: "Screenshot of pico.domains website",
    details: [
      "Short domains are scarce and hard to shop for. Most search tools are built for full-length names. pico.domains is a focused search engine for the ultra-short end of the market.",
      "It curates available concise domains and hands off to trusted marketplaces for purchase, keeping the search experience fast and the commercial side with the specialists.",
      "Built with Nuxt.js and TypeScript on Vite, with internal libraries for the domain-data pipeline.",
    ],
  },
  {
    slug: "cyclei",
    title: "Cyclei",
    subtitle: "Sustainability Made Simple",
    description:
      "Curbside collection for reusable containers alongside regular waste. Increases adoption and return rates for sustainable packaging.",
    role: "Founding Frontend Engineer",
    stack: ["Vue 3", "TypeScript", "Vite", "GraphQL", "CSS", "HTML5"],
    url: "https://app.cyclei.eco/",
    image: "/cyclei.png",
    imageAlt: "Screenshot of Cyclei application",
    details: [
      "Cyclei tackles the reusable-packaging problem: getting people to actually return containers. The product pairs curbside collection of reusables with regular waste pickup.",
      "As the founding frontend engineer, Donray built the customer-facing application: the interface through which users schedule pickups and track their impact.",
      "Vue 3 with TypeScript and GraphQL, built on Vite.",
    ],
  },
  {
    slug: "hide-zero-cards",
    title: "Hide Zero Cards",
    subtitle: "Educational Place Value Tool",
    description:
      "Interactive educational tool for fourth-grade students. Features draggable number cards with color-coded place value components.",
    role: "Builder",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "shadcn/ui"],
    url: "https://hidezerocards.org",
    image: "/hide-zero-cards.png",
    imageAlt: "Screenshot of Hide Zero Cards website",
    details: [
      "A hands-on math tool for fourth graders learning place value. Students drag number cards and see color-coded place-value components respond.",
      "Built with Next.js, React, and shadcn/ui. The interaction design carries the pedagogy, so the UI had to be immediate and forgiving.",
    ],
  },
  {
    slug: "donray-dev",
    title: "donray.dev",
    subtitle: "My Digital Home",
    description:
      "Personal portfolio site showcasing projects and skills. Built with modern web technologies for optimal performance.",
    role: "Builder",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    github: "https://github.com/wdonray/donray.dev",
    details: [
      "This site. Static-first Next.js with a public, privacy-respecting analytics dashboard backed by DynamoDB: one page load per page per session, bots filtered, no cookies, no raw IPs stored.",
      "Accessibility is a CI gate: every page is axe-core scanned against WCAG 2.2 AA, and merging is blocked until it passes.",
      "Discovery layer: robots.txt and sitemap.xml, Person and FAQPage JSON-LD, Open Graph cards, and llms.txt.",
    ],
  },
];

export function getProject(slug: string): ProjectDetail | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
