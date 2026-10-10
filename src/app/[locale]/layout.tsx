import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";

import "../globals.css";
import ClientLayout from "@/components/client-layout";
import { getPersonJsonLd, serializeJsonLd } from "@/lib/schema";
import {
  routing,
  isAppLocale,
  LOCALE_LANG,
  type AppLocale,
} from "@/i18n/routing";
import { localeAlternates } from "@/i18n/metadata";

const SITE_URL = "https://www.donray.dev";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "metadata" });
  const alternates = localeAlternates("/", locale);
  const ogLocale = LOCALE_LANG[locale];
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t("title"),
      template: `%s | ${t("siteName")}`,
    },
    description: t("description"),
    alternates,
    openGraph: {
      title: "Donray Williams | Engineering Manager",
      description: t("ogDescription"),
      url: alternates.canonical,
      siteName: t("siteName"),
      type: "website",
      locale: ogLocale,
      alternateLocale: (Object.values(LOCALE_LANG) as string[]).filter(
        (l) => l !== ogLocale,
      ),
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Donray Williams | Engineering Manager",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Donray Williams | Engineering Manager",
      description: t("ogDescription"),
      images: ["/og-image.png"],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#f7f3e8",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();
  const appLocale = locale as AppLocale;

  return (
    <html lang={LOCALE_LANG[appLocale]} suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(getPersonJsonLd()),
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <ClientLayout>{children}</ClientLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
