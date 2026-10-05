import type { Metadata, Viewport } from "next";

import "./globals.css";
import ClientLayout from "@/components/client-layout";
import { getPersonJsonLd, serializeJsonLd } from "@/lib/schema";

const SITE_URL = "https://www.donray.dev";
const DEFAULT_DESCRIPTION =
  "Donray Williams is a player-coach Engineering Manager at Justworks, leading frontend for onboarding and billing. Portfolio, projects, and experience.";
const OG_DESCRIPTION =
  "Player-coach Engineering Manager at Justworks, leading frontend for onboarding and billing. Portfolio, projects, and experience.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Donray Williams | Engineering Manager | Frontend Leadership, NYC Metro",
    template: "%s | donray.dev",
  },
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Donray Williams | Engineering Manager",
    description: OG_DESCRIPTION,
    url: "/",
    siteName: "donray.dev",
    type: "website",
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
    description:
      "Player-coach Engineering Manager at Justworks, leading frontend for onboarding and billing.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f3e8",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(getPersonJsonLd()),
          }}
        />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
