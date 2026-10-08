"use client";

import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import Footer from "@/components/footer";
import AnalyticsTracker from "@/components/analytics-tracker";
import VersionReloadToast from "@/components/version-reload-toast";

/**
 * Client-side shell rendered inside the server root layout.
 * Kept separate because the root layout must stay a server component
 * to export Next.js metadata.
 */
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
        <VersionReloadToast />
      </div>
    </ThemeProvider>
  );
}
