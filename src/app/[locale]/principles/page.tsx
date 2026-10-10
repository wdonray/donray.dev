import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing, isAppLocale } from "@/i18n/routing";
import { localeAlternates } from "@/i18n/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "principles" });
  const alternates = localeAlternates("/principles", locale);
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

export default async function PrinciplesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("principles");
  const items = t.raw("items") as { title: string; body: string[] }[];

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-24 pb-16">
      <div className="space-y-2">
        <div className="h-1 w-10 rounded-full bg-primary" aria-hidden="true" />
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("intro")}</p>
      </div>
      <div className="mt-10 space-y-10">
        {items.map((principle) => (
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
            {t("lookingFor")}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t.rich("lookingForBody", {
              link: (chunks) => (
                <Link
                  href="mailto:donrayxwilliams@gmail.com"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </section>
      </div>
    </div>
  );
}
