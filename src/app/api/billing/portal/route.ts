import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import * as BillingRepository from "@/modules/billing/repository";

// POST /api/billing/portal
// Returns: { url: string } — the Stripe Customer Portal redirect URL
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  try {
    const customer = await BillingRepository.findCustomerByUserId(user.id);

    if (!customer) {
      return NextResponse.json(
        { error: "No tienes una suscripción activa." },
        { status: 422 }
      );
    }

    const origin = request.nextUrl.origin;

    const session = await getStripe().billingPortal.sessions.create({
      customer: customer.stripeId,
      return_url: `${origin}/settings/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al abrir el portal.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
