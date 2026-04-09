import "server-only";
import Stripe from "stripe";

// Lazy singleton — initialized on first use so the build phase
// (which runs without STRIPE_SECRET_KEY) does not throw.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-03-25.dahlia",
    });
  }
  return _stripe;
}
