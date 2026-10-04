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
    subtitle: "Reusable Packaging Pickup Service",
    description:
      "Customer web app for a curbside reusable-packaging pickup service. Covers the full lifecycle: onboarding and activation, bag tracking, an impact dashboard, a rewards wallet with payouts, and account management.",
    role: "Founding Frontend Engineer",
    stack: ["Vue 3", "TypeScript", "Vite", "GraphQL", "CSS", "HTML5"],
    status: "discontinued",
    image: "/cyclei.png",
    imageAlt: "Screenshot of Cyclei application",
    details: [
      "Cyclei pairs curbside collection of reusable containers with regular waste pickup. Customers sign up, pay a one-time activation fee, buy from partner businesses offering reusable packaging, fill a Cyclei bag, and clip it to their recycling bin handle on trash day. A fresh return bag is delivered to their door, and the account shows returned reusables plus deposits or rewards.",
      "As the founding frontend engineer, Donray built the customer-facing web app: multi-step onboarding with address validation and Stripe setup intents, a dashboard with an impact tracker counting single-use containers saved and a wallet balance card, bag tracking across collected, sorted, and lost states, cart checkout with coupons and invoices, wallet payouts with pending, paid, and failed statuses, and account management with pickup pause and resume.",
      "The app is Vue 3.5 with Vite 7 and TypeScript, using Apollo Client GraphQL against a Django backend, vee-validate forms with a custom input component library, and a published Vue component library for the UI system. Vitest unit tests and ESLint/Stylelint gates run in CI. The service has since been discontinued.",
    ],
    features: [
      "Multi-step onboarding: email, address validation, confirmation, Stripe payment",
      "Dashboard with impact tracker (single-use containers saved) and wallet balance",
      "Bag tracking across collected, sorted, lost, assigned, and delivered states",
      "Cart checkout with activation fees, coupon codes, and invoices",
      "Wallet payouts with pending, paid, and failed statuses",
      "Account management: settings, addresses, pickup pause and resume",
      "Staff admin section with route management and QR-code bag scanning",
    ],
    faq: [
      {
        question: "How did Cyclei's pickup service work?",
        answer:
          "Customers signed up for curbside collection, paid a one-time activation fee, bought from partner businesses offering reusable packaging, filled a Cyclei bag, and clipped it to their recycling bin handle on trash day. A fresh return bag was then delivered to their door.",
      },
      {
        question: "How did customers track their environmental impact?",
        answer:
          "The dashboard showed a running count of single-use containers saved, alongside a wallet balance reflecting deposits and rewards earned from returned containers.",
      },
      {
        question: "Could customers cash out their rewards?",
        answer:
          "Yes. The payout section let users request payouts of their wallet balance to a chosen destination, with request statuses of pending, paid, or failed.",
      },
      {
        question: "What was the app built with?",
        answer:
          "Vue 3 and Vite with TypeScript, GraphQL via Apollo Client, Stripe for payments, vee-validate forms, and a published Vue component library, with Vitest unit tests and ESLint/Stylelint gates.",
      },
      {
        question: "Is Cyclei still operating?",
        answer: "No, the service has been discontinued.",
      },
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
    subtitle: "Personal Portfolio and Blog",
    description:
      "Personal portfolio site and blog. Static-first Next.js with a public, privacy-respecting analytics dashboard, accessibility enforced as a CI gate, and a full discovery layer for human visitors and AI engines.",
    role: "Builder",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    github: "https://github.com/wdonray/donray.dev",
    details: [
      "This site. Static-first Next.js 16 on the App Router with React 19 and TypeScript, styled with Tailwind CSS v4 and shadcn/ui, animated with Framer Motion, hosted on AWS Amplify. Project, experience, and blog sections render from MDX with syntax highlighting, heading anchor links, an automatic table of contents, and reading-time estimates.",
      "Analytics is public and privacy-respecting: a rate-limited /api/track endpoint and an /analytics dashboard backed by DynamoDB count one page load per page per browsing session, filter bots, and estimate daily uniques with a salted SHA-256 hash of IP, user agent, and day. Raw IPs are never stored, there are no cookies, and the dashboard discloses its methodology instead of presenting estimates as exact figures.",
      "Accessibility is a CI gate rather than an aspiration: every page is axe-core scanned against WCAG 2.2 AA on every pull request, and merging is blocked until the scan passes. The release pipeline bumps versions automatically and deploys through Amplify on every release, and a discovery layer of sitemap, robots.txt, Person and FAQPage JSON-LD, Open Graph cards, and llms.txt serves both search engines and AI crawlers.",
    ],
    features: [
      "Project, experience, and blog sections rendered from MDX with code highlighting and reading time",
      "Public analytics dashboard with disclosed methodology and privacy-preserving unique counting",
      "axe-core WCAG 2.2 AA accessibility scans as a required CI check on every pull request",
      "Discovery layer: sitemap, robots.txt, Person and FAQPage JSON-LD, Open Graph cards, llms.txt",
      "Automated version bumps with Amplify deploys on every release",
      "Rate-limited tracking endpoint with abuse protection",
    ],
    faq: [
      {
        question: "What is donray.dev built with?",
        answer:
          "Next.js 16 (App Router, static-first), React 19, TypeScript, Tailwind CSS v4, shadcn/ui, and Framer Motion, hosted on AWS Amplify.",
      },
      {
        question: "How does the public analytics work?",
        answer:
          "A rate-limited /api/track endpoint records one page load per page per browsing session, filters bots, and stores counts in DynamoDB. Daily unique visitors are estimated with a salted SHA-256 hash of IP, user agent, and day. Raw IPs are never stored and there are no cookies.",
      },
      {
        question: "What does the accessibility CI gate check?",
        answer:
          "Every page is scanned with axe-core against WCAG 2.2 AA on every pull request, and merging is blocked until the scan passes.",
      },
    ],
  },
];

export function getProject(slug: string): ProjectDetail | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}
