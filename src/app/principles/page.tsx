import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How I Lead",
  description:
    "Donray Williams' management principles: the rules he operates by as an engineering manager, earned from leading a team as a player-coach.",
  alternates: {
    canonical: "/principles",
  },
  openGraph: {
    title: "How I Lead",
    description:
      "Donray Williams' management principles: the rules he operates by as an engineering manager, earned from leading a team as a player-coach.",
    url: "/principles",
  },
};

const PRINCIPLES: { title: string; body: string[] }[] = [
  {
    title: "Set the path; they own the execution",
    body: [
      "I give the team concrete goals, good docs, and well-formed tickets. Then the work is theirs. I order the sprint and name what slips before we start, so slippage is a plan and not a surprise.",
      "When a launch is ready, the engineer who built it runs it, not me. My job is to make the path clear. Their job is to walk it.",
    ],
  },
  {
    title: "I still ship",
    body: [
      "I'm a player-coach, and I take that literally. I carry my own small fixes across the stack, write them up the same way every time, and when something breaks in production I jump in: small, surgical, fast. Then I hand close-out back to the team.",
      "Staying in the code keeps my reviews honest and my estimates real.",
    ],
  },
  {
    title: "Feedback fast, specific, private when it stings",
    body: [
      "Feedback arrives within days, grounded in the actual behavior and the actual file, logged as it happens so nothing depends on my memory at review time. Praise travels. Critique gets no audience.",
      "If I have to leave the same comment twice, the third time is a direct conversation, not another comment.",
    ],
  },
  {
    title: "Make their work visible so I can defend it",
    body: [
      "Good work nobody saw might as well not have happened when ratings are decided. So I put my reports on stage: they demo their own ships, they get named on launches, and I teach them what counts toward the next level.",
      "If I don't know it happened, I can't advocate for it.",
    ],
  },
  {
    title: "Rhythm protects focus; ceremony doesn't",
    body: [
      "A short daily checkpoint inside an already-started day. Async Friday. Blockers raised the moment they hit, not saved for standup.",
      "When an epic sprawls, I cut scope to protect one finish line instead of tracking everything late.",
    ],
  },
  {
    title: "People grow by getting bigger work, not more advice",
    body: [
      "The lever for growth is a stretch assignment with a clear definition of done: a cross-stack epic for someone proving broader ownership, end-to-end launch responsibility for someone ready to exceed, a solo domain slice for someone new who needs to prove the level.",
      "I frame the floor. They estimate it and run it.",
    ],
  },
];

export default function PrinciplesPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-24 pb-16">
      <div className="space-y-2">
        <div className="h-1 w-10 rounded-full bg-primary" aria-hidden="true" />
        <h1 className="text-3xl font-bold tracking-tight">How I Lead</h1>
        <p className="text-muted-foreground">
          I&apos;m an engineering manager at Justworks. I lead a team of three
          as a player-coach: I own frontend for onboarding and billing, I still
          write code, and I still review the team&apos;s code. These are the
          rules I actually operate by. Each one was earned the hard way.
        </p>
      </div>
      <div className="mt-10 space-y-10">
        {PRINCIPLES.map((principle) => (
          <section key={principle.title} aria-labelledby={principle.title}>
            <h2
              id={principle.title}
              className="text-xl font-bold tracking-tight mb-4"
            >
              {principle.title}
            </h2>
            <div className="space-y-3">
              {principle.body.map((paragraph, index) => (
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
        <section aria-labelledby="what-i-am-looking-for">
          <h2
            id="what-i-am-looking-for"
            className="text-xl font-bold tracking-tight mb-4"
          >
            What I&apos;m looking for
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            I want teams where ownership is real, the work matters to the
            business, and engineers are trusted with hard problems. If that
            sounds like your team,{" "}
            <Link
              href="mailto:donrayxwilliams@gmail.com"
              className="underline underline-offset-4 hover:text-foreground"
            >
              let&apos;s talk
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
