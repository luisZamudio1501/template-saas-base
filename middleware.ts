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
 * WHY A BROAD MATCHER INSTEAD OF A PER-ROUTE LIST:
 *
 * Next.js evaluates config.matcher at build time using a static analysis pass
 * (Edge Runtime constraint). It cannot import from external modules, so the
 * old approach required manually adding each new route to BOTH this array AND
 * src/config/routes.ts — a silent security risk when the two drifted apart.
 *
 * The broad pattern below runs the middleware on every request EXCEPT Next.js
 * internals and static assets. All routing decisions (protect / redirect) are
 * made at runtime by reading protectedRoutes and authRoutes from
 * src/config/routes.ts, which is now the single source of truth.
 *
 * HOW TO ADD A NEW PROTECTED ROUTE:
 *   1. Add the base path to protectedRoutes in src/config/routes.ts.
 *   2. Add the nav item to appConfig.navigation in src/config/app.ts.
 *   ← That's it. No changes to this file are needed.
 *
 * LIMITATION: the matcher regex below is the only thing that must stay here.
 * It intentionally excludes _next/static, _next/image, and favicon.ico so the
 * middleware does not run on build artifacts. Do not make it more restrictive
 * or the session-refresh logic will stop working for new routes.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
