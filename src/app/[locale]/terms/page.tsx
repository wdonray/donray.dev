import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing, isAppLocale } from "@/i18n/routing";
import { localeAlternates } from "@/i18n/metadata";

const CONTACT_EMAIL = "donrayxwilliams@gmail.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "terms" });
  const alternates = localeAlternates("/terms", locale);
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

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("terms");
  const sections = t.raw("sections") as { title: string; body: string[] }[];

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-24 pb-16">
      <div className="space-y-2">
        <div className="h-1 w-10 rounded-full bg-primary" aria-hidden="true" />
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t.rich("intro", {
            date: t("effectiveDate"),
            email: CONTACT_EMAIL,
            link: (chunks) => (
              <Link
                href={`mailto:${CONTACT_EMAIL}`}
                className="underline underline-offset-4 hover:text-foreground"
              >
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>
      <div className="mt-10 space-y-10">
        {sections.map((section) => (
          <section key={section.title} aria-labelledby={section.title}>
            <h2
              id={section.title}
              className="text-xl font-bold tracking-tight mb-4"
            >
              {section.title}
            </h2>
            <div className="space-y-3">
              {section.body.map((paragraph, index) => (
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
      </div>
    </div>
  );
}
