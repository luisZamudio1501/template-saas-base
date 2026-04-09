import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { protectedRoutes, authRoutes } from "@/config/routes";

export async function middleware(request: NextRequest) {
  // Use a mutable reference so setAll can rebuild the response with fresh cookies.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookies to the request first so downstream handlers see them.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Rebuild the response so the cookies are sent to the browser.
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Validate the session server-side. getUser() verifies the JWT against
  // Supabase — unlike getSession() it cannot be spoofed by a tampered cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

/**
 * matcher must be a static literal — Next.js evaluates it at build time
 * and cannot import from external modules.
 *
 * Keep in sync with protectedRoutes and authRoutes in src/config/routes.ts.
 * Add a new entry here whenever you add a path to protectedRoutes.
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/entities/:path*",
    "/settings/:path*",
    "/me/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/update-password",
  ],
};
