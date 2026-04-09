// Domain types for the billing module.
// These represent the application's view of billing data — not Stripe's raw objects.

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "trialing"
  | "unpaid"
  | "paused";

export interface BillingCustomer {
  userId: string;
  stripeId: string;
  createdAt: string;
}

export interface BillingSubscription {
  id: string;
  userId: string;
  stripePriceId: string;
  planName: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertSubscriptionInput {
  id: string;
  userId: string;
  stripePriceId: string;
  planName: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}
