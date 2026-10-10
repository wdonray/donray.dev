import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, isAppLocale } from "@/i18n/routing";
import { localeAlternates } from "@/i18n/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "uses" });
  const alternates = localeAlternates("/uses", locale);
  return {
    title: t("title"),
    description: t("description"),
    alternates,
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: alternates.canonical,
    },
  };
}

export default async function UsesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("uses");
  const groups = t.raw("groups") as {
    title: string;
    items: { name: string; note: string }[];
  }[];

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-24 pb-16">
      <div className="space-y-2">
        <div className="h-1 w-10 rounded-full bg-primary" aria-hidden="true" />
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("intro")}</p>
      </div>
      <div className="mt-10 space-y-10">
        {groups.map((group) => (
          <section key={group.title} aria-labelledby={group.title}>
            <h2
              id={group.title}
              className="text-xl font-bold tracking-tight mb-4"
            >
              {group.title}
            </h2>
            <dl className="divide-y divide-border rounded-xl border bg-card">
              {group.items.map((item) => (
                <div key={item.name} className="px-6 py-4">
                  <dt className="font-semibold">{item.name}</dt>
                  <dd className="text-sm text-muted-foreground mt-1">
                    {item.note}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
