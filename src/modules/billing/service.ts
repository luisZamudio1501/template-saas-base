// Client-side service for the billing module.
// All Stripe and Supabase access happens server-side via Route Handlers.
// This service only talks to /api/billing over HTTP — zero DB or Stripe coupling in the browser.

import type { BillingSubscription } from "./types";

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      (body as { error?: string }).error ?? `Error ${response.status}`
    );
  }

  return response.json() as Promise<T>;
}

export const billingService = {
  /**
   * Creates a Stripe Checkout Session for the given price ID.
   * Returns the redirect URL to send the user to Stripe.
   */
  async createCheckoutSession(priceId: string): Promise<{ url: string }> {
    return apiFetch<{ url: string }>("/api/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ priceId }),
    });
  },

  /**
   * Creates a Stripe Customer Portal Session.
   * Returns the redirect URL to send the user to their portal.
   */
  async createPortalSession(): Promise<{ url: string }> {
    return apiFetch<{ url: string }>("/api/billing/portal", {
      method: "POST",
    });
  },

  /**
   * Returns the current user's subscription, or null if they have none.
   */
  async getCurrentSubscription(): Promise<BillingSubscription | null> {
    return apiFetch<BillingSubscription | null>("/api/billing/subscription");
  },
};
