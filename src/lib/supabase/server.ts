import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Factory that returns a Supabase client bound to the current request's cookies.
// Call this inside Route Handlers or Server Components — never in browser code.
// Creates a new instance per call to prevent cross-request state leaks.
export async function createSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components cannot mutate cookies.
            // Route Handlers can — the try/catch makes this safe in both contexts.
          }
        },
      },
    }
  );
}
