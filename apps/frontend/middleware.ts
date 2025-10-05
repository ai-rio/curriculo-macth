/**
 * Next.js middleware for protecting routes, managing Supabase sessions, and handling internationalization
 * Reference: https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import createMiddleware from 'next-intl/middleware';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(req: NextRequest) {
  // Handle internationalization first
  const intlResponse = intlMiddleware(req as any);

  // If internationalization middleware already returns a response, use it
  if (intlResponse) {
    return intlResponse;
  }

  // Skip Supabase auth handling for static files and API routes
  const { pathname } = req.nextUrl;
  const pathnameLocale = pathname.split('/')[1];

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    !routing.locales.includes(pathnameLocale as any)
  ) {
    return intlResponse;
  }

  // Create Supabase client
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/profile', '/optimizations', '/settings'];
  const authRoutes = ['/login', '/signup', '/forgot-password'];

  // Remove locale from pathname for route checking
  const pathnameWithoutLocale = pathname.replace(`/${pathnameLocale}`, '');

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathnameWithoutLocale.startsWith(route));

  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathnameWithoutLocale.startsWith(route));

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL(`/${pathnameLocale}/login`, req.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && session) {
    const redirectUrl = new URL(`/${pathnameLocale}/dashboard`, req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
