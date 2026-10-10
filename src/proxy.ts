import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 renamed the middleware file convention to `proxy`.
// Handles locale negotiation (Accept-Language / NEXT_LOCALE cookie)
// and strips/adds the locale prefix per `localePrefix: "as-needed"`.
export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
