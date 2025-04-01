import Hero from "@/components/hero";
import dynamic from "next/dynamic";

const Skills = dynamic(() => import("@/components/skills"), {
  loading: () => (
    <div className="h-[400px] animate-pulse bg-muted rounded-lg" />
  ),
});

const Projects = dynamic(() => import("@/components/projects"), {
  loading: () => (
    <div className="h-[400px] animate-pulse bg-muted rounded-lg" />
  ),
});

const Experience = dynamic(() => import("@/components/experience"), {
  loading: () => (
    <div className="h-[400px] animate-pulse bg-muted rounded-lg" />
  ),
});

export default function Home() {
  return (
    <div className="flex flex-col gap-24 px-4 md:px-16">
      <Hero />
      <Skills />
      <Projects />
      <Experience />
    </div>
  );
}
