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
  github?: string;
  image?: string;
  imageAlt?: string;
  /** Omitted for active projects; "discontinued" renders a status badge. */
  status?: "discontinued";
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
