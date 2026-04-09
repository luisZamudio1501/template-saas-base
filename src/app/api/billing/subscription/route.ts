import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import * as BillingRepository from "@/modules/billing/repository";

// GET /api/billing/subscription
// Returns: BillingSubscription | null
export async function GET() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  try {
    const subscription = await BillingRepository.findSubscriptionByUserId(user.id);
    return NextResponse.json(subscription);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al obtener la suscripción.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
