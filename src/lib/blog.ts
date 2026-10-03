export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string[];
}

export const POSTS: BlogPost[] = [
  {
    slug: "422-code-reviews",
    title: "What 422 code reviews taught me about staying technical as a manager",
    date: "2026-10-03",
    excerpt:
      "Between June and October 2026, I reviewed 422 pull requests while managing a team of 3. Here's what review-at-scale actually teaches you — and what it costs.",
    content: [
      "The standard advice for new engineering managers is simple: stop coding. Your job is the team now — 1:1s, planning, hiring, unblocking. The code will survive without you.",
      "I didn't take that advice. I'm a player-coach: I manage a team of 3 at Justworks, I own frontend for onboarding and billing, and I'm still in the code. Between June and October 2026, my team merged 231 pull requests — and I reviewed 422.",
      "Here's what that volume actually teaches you.",
      "First: your standards stay calibrated to reality. Managers who stop reading code develop opinions about quality based on memory. Memory drifts. Reading 100+ diffs a month keeps your sense of 'good enough' anchored to what the team actually ships — not what you shipped three years ago.",
      "Second: you see where the team struggles before they tell you. When three different engineers hit the same confusing API, that's not three skill problems — it's a design problem. Review is the cheapest observability you have into your own systems.",
      "Third: review is where mentorship compounds. A thoughtful comment on a PR teaches once and is visible to the whole team. The same feedback in a 1:1 teaches once and disappears.",
      "The cost is real, though. Four hundred reviews in four months is roughly five a day, every workday. That's context-switching on top of management work, and some weeks it meant reviews happened early in the morning or not at all. I don't review everything — I review the risky things, the patterns, and the PRs from engineers who are still leveling up.",
      "The payoff: when I make a technical call, the team trusts it — because they watched me earn it in their diffs, not in a meeting.",
      "If you're a new manager wondering whether to keep reviewing: don't review to control. Review to learn. The moment it becomes about gatekeeping instead of understanding, stop.",
    ],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}
