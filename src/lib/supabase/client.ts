import { createClient } from "@supabase/supabase-js";

// Browser-only singleton.
// Use for client-side auth flows (login, logout, session observation).
// Never import this in Server Components, Route Handlers, or middleware.
// For server-side access: createSupabaseServer() from @/lib/supabase/server
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
