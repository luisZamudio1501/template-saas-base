/**
 * Single source of truth for route classification.
 *
 * Consumed by middleware.ts at runtime for all redirect logic.
 * The middleware matcher is intentionally broad (covers all non-static paths),
 * so adding a route here is sufficient to protect it — no changes to
 * middleware.ts are ever needed.
 *
 * HOW TO ADD A NEW MODULE:
 *   1. Add the base path to protectedRoutes below (e.g. "/customers").
 *   2. Add the nav item to appConfig.navigation in src/config/app.ts.
 *   ← middleware.ts does NOT need to be touched.
 */

export const protectedRoutes = [
  "/dashboard",
  "/entities",
  "/settings",
  "/me",
] as const;

export const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/update-password",
] as const;
