import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Hero from "@/components/hero";
import dynamic from "next/dynamic";
import { routing } from "@/i18n/routing";

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

const OpenToConversations = dynamic(
  () => import("@/components/open-to-conversations"),
  {
    loading: () => (
      <div className="h-[400px] animate-pulse bg-muted rounded-lg" />
    ),
  },
);

const Faq = dynamic(() => import("@/components/faq"), {
  loading: () => (
    <div className="h-[400px] animate-pulse bg-muted rounded-lg" />
  ),
});

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <div className="flex flex-col gap-24 max-w-7xl mx-auto px-6 lg:px-8 pb-16">
      <Hero />
      <Skills />
      <Projects />
      <Experience />
      <OpenToConversations />
      <Faq />
    </div>
  );
}
