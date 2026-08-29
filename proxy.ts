
import createMiddleware from "next-intl/middleware";
import { routing } from "./app/i18n/routing";
export default createMiddleware(routing);

export const config = {
  // Match all pathnames except:
  // - /api, /_next, /_vercel, /studio (Sanity Studio)
  // - files with extensions (favicon.ico, etc.)
  matcher: "/((?!api|_next|_vercel|studio|.*\\..*).*)",
};
