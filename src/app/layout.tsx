import type { ReactNode } from "react";

// The [locale] layout renders <html> and <body>; this root layout only
// passes children through (the next-intl App Router pattern).
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
