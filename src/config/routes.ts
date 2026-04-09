/**
 * Single source of truth for route classification.
 *
 * Consumed by middleware.ts at runtime for redirect logic.
 *
 * HOW TO ADD A NEW MODULE:
 *   1. Add the base path to protectedRoutes here (e.g. "/customers").
 *   2. Add the same path to config.matcher in middleware.ts.
 *      ← This step is manual because Next.js requires matcher to be a
 *        static literal array — it cannot be imported from a module.
 *   3. Add the nav item to appConfig.navigation in src/config/app.ts.
 *
 * LIMITATION: middleware.ts config.matcher must stay in sync manually.
 * Everything else (runtime redirect logic) reads from these arrays.
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
