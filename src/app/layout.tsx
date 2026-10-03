"use client";

import "./globals.css";
import { useEffect } from "react";
import { Router } from "next/router";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import Footer from "@/components/footer";
import AnalyticsTracker from "@/components/analytics-tracker";
import { getPersonJsonLd } from "@/lib/schema";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!posthogKey) return;

    posthog.init(posthogKey, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      loaded: (posthogInstance) => {
        if (process.env.NODE_ENV === "development") posthogInstance.debug();
      },
    });

    const handleRouteChange = () => posthog?.capture("$pageview");
    Router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      Router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Donray Williams — Engineering Manager</title>
        <meta
          name="description"
          content="Portfolio of Donray Williams, Engineering Manager building fast, accessible web experiences."
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getPersonJsonLd()),
          }}
        />
      </head>
      <body>
        <PostHogProvider client={posthog}>
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
        </PostHogProvider>
      </body>
    </html>
  );
}
