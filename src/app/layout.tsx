"use client";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import Footer from "@/components/footer";
import AnalyticsTracker from "@/components/analytics-tracker";
import { getPersonJsonLd, serializeJsonLd } from "@/lib/schema";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>
          Donray Williams | Engineering Manager | Frontend Leadership, NYC Metro
        </title>
        <meta
          name="description"
          content="Donray Williams is a player-coach Engineering Manager at Justworks, leading frontend for onboarding and billing. Portfolio, projects, and experience."
        />
        <link rel="canonical" href="https://www.donray.dev" />
        <meta name="theme-color" content="#f7f3e8" />
        <meta
          property="og:title"
          content="Donray Williams | Engineering Manager"
        />
        <meta
          property="og:description"
          content="Player-coach Engineering Manager at Justworks, leading frontend for onboarding and billing. Portfolio, projects, and experience."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.donray.dev" />
        <meta property="og:site_name" content="donray.dev" />
        <meta
          property="og:image"
          content="https://www.donray.dev/og-image.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Donray Williams | Engineering Manager"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Donray Williams | Engineering Manager"
        />
        <meta
          name="twitter:description"
          content="Player-coach Engineering Manager at Justworks, leading frontend for onboarding and billing."
        />
        <meta
          name="twitter:image"
          content="https://www.donray.dev/og-image.png"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(getPersonJsonLd()),
          }}
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div>
            <Header />
            <main className="w-full">{children}</main>
            <Footer />
            <AnalyticsTracker />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
