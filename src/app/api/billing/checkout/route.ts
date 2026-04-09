import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import * as BillingRepository from "@/modules/billing/repository";

const checkoutSchema = z.object({
  priceId: z.string().min(1, "Se requiere un identificador de precio válido."),
});

// POST /api/billing/checkout
// Body: { priceId: string }
// Returns: { url: string } — the Stripe Checkout redirect URL
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud no es JSON válido." },
      { status: 422 }
    );
  }

  const parsed = checkoutSchema.safeParse(rawBody);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Datos inválidos.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  const { priceId } = parsed.data;

  try {
    // Find or create the Stripe customer record for this user.
    let customer = await BillingRepository.findCustomerByUserId(user.id);

    if (!customer) {
      const stripeCustomer = await getStripe().customers.create({
        email: user.email ?? undefined,
        metadata: { userId: user.id },
      });
      customer = await BillingRepository.createCustomer(user.id, stripeCustomer.id);
    }

    const origin = request.nextUrl.origin;

    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      customer: customer.stripeId,
      client_reference_id: user.id,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/settings/billing?checkout=success`,
      cancel_url: `${origin}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al crear el checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
