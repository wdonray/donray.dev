export interface ProjectFaq {
  question: string;
  answer: string;
}

export interface ProjectDetail {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  role: string;
  stack: string[];
  url?: string;
  /** Wayback Machine snapshot, used when the live site is gone. */
  archivedUrl?: string;
  github?: string;
  image?: string;
  imageAlt?: string;
  /** Omitted for active projects. */
  status?: "discontinued" | "maintenance";
  details: string[];
  features?: string[];
  faq?: ProjectFaq[];
}

export const PROJECTS: ProjectDetail[] = [
  {
    slug: "pico-domains",
    title: "pico.domains",
    subtitle: "Ultra-Short Domain Search Engine",
    description:
      "Free search engine for ultra-short domain names. Curates available concise domains across 18 TLD categories and hands buyers off to trusted marketplaces.",
    role: "Frontend Developer",
    stack: ["Nuxt.js", "TypeScript", "Vite", "CSS", "HTML5"],
    status: "discontinued",
    archivedUrl:
      "https://web.archive.org/web/20250224032816/https://www.pico.domains/",
    image: "/pico-domains.png",
    imageAlt: "Screenshot of pico.domains website",
    details: [
      "pico.domains is a free search engine for ultra-short domain names, not a registrar. It tracks hundreds of millions of domains considered high-value and easy to remember, curates the available ones, and links buyers to marketplaces. The service is free, monetized through affiliate commissions on registrar traffic. It was built by a two-person team, with Donray on frontend development.",
      "Search starts with a prefix of up to four characters and narrows by second-level-domain length, one of 18 TLD categories (tech, commerce, country and region, and more), TLD length, specific TLDs, English-dictionary words only, and availability. Results sort by domain, SLD length, price, and registration duration, with 25 results per page and deep-linkable URLs carrying canonical tags and per-search SEO metadata.",
      "Each result links out to Dynadot with a referral ID, keeping the commercial side with the registrar. Eighteen TLD category landing pages each carry a unique headline, long description, and icon. The app is installable as a PWA with runtime caching of API responses, and ships a collapsible filter panel with simplified table columns for small screens.",
      "Built with Nuxt 3, Vue 3, and strict TypeScript against an Elasticsearch-backed API, with client-side caching keyed on the full query signature and shared internal component libraries. The service has since been discontinued.",
    ],
    features: [
      "Second-level-domain search capped at 4 characters, defaulting to 2 or fewer",
      "Filters: SLD prefix and length, 18 TLD categories, TLD length, multi-select TLD picker, English-dictionary-only toggle, availability toggle",
      "Sortable results table (domain, SLD length, price, registration duration) with pagination",
      "Marketplace handoff linking each result to Dynadot with referral tracking",
      "18 TLD category landing pages, each with a unique headline, description, and icon",
      "Deep-linkable searches with canonical URLs and per-search SEO titles and descriptions",
      "Installable PWA with runtime caching of API responses",
      "Responsive layout with a collapsible filter panel for small screens",
    ],
    faq: [
      {
        question: "What is pico.domains?",
        answer:
          "A free search engine for ultra-short domain names (four characters or fewer before the dot). It is not a registrar: it curates available short domains and links buyers to marketplaces.",
      },
      {
        question: "How can you search?",
        answer:
          "By typing a prefix of up to four characters, then narrowing by second-level-domain length, one of 18 TLD categories, TLD length, specific TLDs, English-dictionary words only, and availability. Results sort by domain, length, price, or registration duration.",
      },
      {
        question: "How is it free?",
        answer:
          "Through an affiliate model: result links go to Dynadot with referral IDs, and the service earns a commission on registrar traffic.",
      },
      {
        question: "Is pico.domains still available?",
        answer: "No, the service has been discontinued.",
      },
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
    subtitle: "Place Value Learning Tool for 4th Grade Math",
    description:
      "Interactive place-value tool for fourth-grade students. Type any number up to one billion and break it into draggable, color-coded digit cards, with a dedicated mode for investigating what zero digits really mean.",
    role: "Builder",
    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "shadcn/ui"],
    url: "https://hidezerocards.org",
    github: "https://github.com/wdonray/c-hide-zero-cards",
    image: "/hide-zero-cards.png",
    imageAlt: "Screenshot of Hide Zero Cards website",
    details: [
      "Hide Zero Cards turns any whole number from 1 to one billion into a set of draggable cards, one per digit, each labeled with the digit's true value. Type 5,432 and you get cards reading 5,000, 400, 30, and 2, color-coded by place group: reds for ones through hundreds, yellow for thousands, green for millions, blue for billions. Dragging the cards apart physically separates a number into its place-value components.",
      "The namesake interaction is the zero toggle. A zero digit becomes a placeholder card reading 0,000 instead of a value card, and the Zero toolbar button hides or shows those placeholders, framing the difference between having no digit and having a zero digit. A dice button rolls random numbers with an adjustable range and a Zero-focus mode that keeps re-rolling until the number contains a zero, so practice deliberately exercises the concept.",
      "A Number Forms dialog renders the same number four ways: Standard, Word (through a hand-rolled number-to-words converter), Unit (5 thousands, 4 hundreds, 3 tens, 2 ones), and Expanded (5,000 + 400 + 30 + 2). An in-app guide adds five classroom activities and assessment checks, with a first-visit welcome dialog and a celebratory toast when a student builds their first number.",
      "Built with Next.js 15, React 19, TypeScript, and shadcn/ui. Dragging is a hand-rolled hook on Pointer Events with pointer capture rather than a drag-and-drop library, so cards respond identically to mouse, touch, and stylus. The full source is public on GitHub.",
    ],
    features: [
      "Number input from 1 to 1,000,000,000 with a mobile numeric keyboard and thousands separators",
      "One draggable card per digit, labeled with the digit's true value and color-coded by place group",
      "Zero placeholder cards with a show/hide toggle for investigating zero digits",
      "Mix button scatters cards to random positions; Reset restores the ordered layout",
      "Random number roller with adjustable range and a Zero-focus mode",
      "Number Forms dialog showing Standard, Word, Unit, and Expanded forms side by side",
      "Instructional guide with five classroom activities and assessment checks",
      "Light and dark themes, PWA support, and preferences persisted locally",
    ],
    faq: [
      {
        question: "What does 'hide zero cards' mean?",
        answer:
          "When a number contains a zero digit, like the 0 in 5,043, the app creates a placeholder card reading 0,000 instead of a value card. The Zero toolbar button toggles these placeholders on and off, letting students investigate the difference between having no digit and having a zero digit in a place.",
      },
      {
        question: "What size numbers can students work with?",
        answer:
          "Any whole number from 1 to 1,000,000,000 (one billion), spanning ten place values from ones to billions. The random-number roller defaults to 1 through 1,000,000 with an adjustable maximum.",
      },
      {
        question: "What are the four number forms?",
        answer:
          "The Number Forms dialog shows the same number four ways: Standard form (5,432), Word form (five thousand four hundred thirty-two, produced by a built-in converter), Unit form (5 thousands, 4 hundreds, 3 tens, 2 ones), and Expanded form (5,000 + 400 + 30 + 2).",
      },
      {
        question: "How does the drag interaction work?",
        answer:
          "Dragging is built on Pointer Events with pointer capture rather than a drag-and-drop library, so cards respond to mouse, touch, and stylus identically. Cards move with CSS transforms and a computed stacking order.",
      },
      {
        question: "Is Hide Zero Cards still available?",
        answer:
          "Yes, the site is live at hidezerocards.org, and the full source code is public on GitHub.",
      },
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
