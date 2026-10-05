"use client";

import { useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import Footer from "@/components/footer";
import AnalyticsTracker from "@/components/analytics-tracker";
import { IntroAnimationContext, consumeIntroAnimation } from "@/lib/animations";

/**
 * Client-side shell rendered inside the server root layout.
 * Kept separate because the root layout must stay a server component
 * to export Next.js metadata.
 *
 * This shell persists across client-side navigations, so it consumes the
 * one-per-page-lifetime intro-animation flag and provides it to the hero:
 * entrance animations play on initial load only, never on SPA navigations
 * (those already crossfade via the View Transitions API).
 */
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [playIntroAnimation] = useState(consumeIntroAnimation);
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <IntroAnimationContext.Provider value={playIntroAnimation}>
        <div>
          <Header />
          <main className="w-full">{children}</main>
          <Footer />
          <AnalyticsTracker />
        </div>
      </IntroAnimationContext.Provider>
    </ThemeProvider>
  );
}
