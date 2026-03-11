import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const AUTH_PAGES = ["/login", "/register", "/forgot-password"];

const handleI18nRouting = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const response = handleI18nRouting(request);

  // Don't interfere with i18n redirects (locale negotiation)
  if (!response.ok) return response;

  const pathname = request.nextUrl.pathname;
  const localePattern = new RegExp(`^/(${routing.locales.join("|")})`);
  const match = pathname.match(localePattern);

  // No locale in path yet — let i18n handle it
  if (!match) return response;

  const locale = match[1];
  const pathWithoutLocale = pathname.replace(localePattern, "") || "/";

  const isAuthenticated = request.cookies.has("refreshToken");
  const isAuthPage = AUTH_PAGES.some((page) => pathWithoutLocale === page);

  // Authenticated user on auth pages → redirect to home
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Unauthenticated user on protected pages → redirect to login
  if (!isAuthenticated && !isAuthPage) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
