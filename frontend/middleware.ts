import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Không áp dụng locale cho khu quản trị (/admin), API, static assets.
  matcher: ["/((?!admin|api|_next|_vercel|.*\\..*).*)"],
};