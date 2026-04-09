import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import * as BillingRepository from "@/modules/billing/repository";
import type { SubscriptionStatus } from "@/modules/billing/types";

// ─── Webhook entry point ──────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = await getStripe().webhooks.constructEventAsync(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature.";
    return NextResponse.json(
      { error: `Webhook verification failed: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object);
        break;

      default:
        // Unknown event type — acknowledge and ignore.
        break;
    }
  } catch (err) {
    // Returning 500 instructs Stripe to retry the event.
    const message = err instanceof Error ? err.message : "Handler error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ─── Event handlers ───────────────────────────────────────────────────────────

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  // client_reference_id must be set to the user's ID when creating the session.
  const userId = session.client_reference_id;
  if (!userId) return;

  const stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;

  if (!stripeCustomerId) return;

  // Ensure the customer mapping exists.
  const existing = await BillingRepository.findCustomerByStripeId(stripeCustomerId);
  if (!existing) {
    await BillingRepository.createCustomer(userId, stripeCustomerId);
  }

  // Sync subscription if this was a subscription-mode checkout.
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  if (subscriptionId) {
    await syncSubscription(subscriptionId, userId);
  }
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  const stripeCustomerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : (subscription.customer as Stripe.Customer | Stripe.DeletedCustomer)
          ?.id ?? null;

  if (!stripeCustomerId) return;

  const customer =
    await BillingRepository.findCustomerByStripeId(stripeCustomerId);
  if (!customer) return; // unknown customer — skip

  await syncSubscription(subscription.id, customer.userId);
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  await BillingRepository.markSubscriptionCanceled(subscription.id);
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  // In API version dahlia+, subscription is nested under invoice.parent.subscription_details.
  const subDetails = invoice.parent?.subscription_details;
  if (!subDetails) return;

  const subscriptionId =
    typeof subDetails.subscription === "string"
      ? subDetails.subscription
      : subDetails.subscription?.id ?? null;

  if (!subscriptionId) return;

  await BillingRepository.updateSubscriptionStatus(
    subscriptionId,
    "past_due" satisfies SubscriptionStatus
  );
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

/** Retrieve the subscription from Stripe (with product expanded) and persist it. */
async function syncSubscription(
  subscriptionId: string,
  userId: string
): Promise<void> {
  const sub = await getStripe().subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price.product"],
  });

  const priceItem = sub.items.data[0];
  const priceId = priceItem?.price.id ?? "";

  // product is string | Product | DeletedProduct after expand
  const rawProduct = priceItem?.price.product;
  const planName =
    rawProduct &&
    typeof rawProduct === "object" &&
    "name" in rawProduct &&
    !("deleted" in rawProduct)
      ? (rawProduct as Stripe.Product).name
      : priceId; // fallback to price ID if product is unavailable

  // current_period lives on SubscriptionItem in API version dahlia+
  const periodStart = priceItem?.current_period_start ?? 0;
  const periodEnd = priceItem?.current_period_end ?? 0;

  await BillingRepository.upsertSubscription({
    id: sub.id,
    userId,
    stripePriceId: priceId,
    planName,
    status: sub.status as SubscriptionStatus,
    currentPeriodStart: new Date(periodStart * 1000).toISOString(),
    currentPeriodEnd: new Date(periodEnd * 1000).toISOString(),
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  });
}
