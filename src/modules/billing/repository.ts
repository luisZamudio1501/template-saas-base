// Data access layer for the billing module.
// All queries use the service-role client (admin) because billing writes
// originate from Stripe webhooks — there is no user session in that context.
// Read functions used in authenticated routes can safely use admin + explicit user_id filter.
// Never import this from client/browser code.

import { createSupabaseAdmin } from "@/lib/supabase/admin";
import {
  BillingCustomer,
  BillingSubscription,
  SubscriptionStatus,
  UpsertSubscriptionInput,
} from "./types";

// ─── Internal row types (DB shape) ───────────────────────────────────────────

type CustomerRow = {
  user_id: string;
  stripe_id: string;
  created_at: string;
};

type SubscriptionRow = {
  id: string;
  user_id: string;
  stripe_price_id: string;
  plan_name: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
};

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapCustomerRow(row: CustomerRow): BillingCustomer {
  return {
    userId: row.user_id,
    stripeId: row.stripe_id,
    createdAt: row.created_at,
  };
}

function mapSubscriptionRow(row: SubscriptionRow): BillingSubscription {
  return {
    id: row.id,
    userId: row.user_id,
    stripePriceId: row.stripe_price_id,
    planName: row.plan_name,
    status: row.status,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Customer functions ───────────────────────────────────────────────────────

export async function findCustomerByUserId(
  userId: string
): Promise<BillingCustomer | null> {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("customers")
    .select("user_id, stripe_id, created_at")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return mapCustomerRow(data as CustomerRow);
}

export async function findCustomerByStripeId(
  stripeId: string
): Promise<BillingCustomer | null> {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("customers")
    .select("user_id, stripe_id, created_at")
    .eq("stripe_id", stripeId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return mapCustomerRow(data as CustomerRow);
}

export async function createCustomer(
  userId: string,
  stripeId: string
): Promise<BillingCustomer> {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("customers")
    .insert({ user_id: userId, stripe_id: stripeId })
    .select("user_id, stripe_id, created_at")
    .single();

  if (error) throw new Error(error.message);

  return mapCustomerRow(data as CustomerRow);
}

// ─── Subscription functions ───────────────────────────────────────────────────

export async function findSubscriptionByUserId(
  userId: string
): Promise<BillingSubscription | null> {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      "id, user_id, stripe_price_id, plan_name, status, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return mapSubscriptionRow(data as SubscriptionRow);
}

export async function upsertSubscription(
  input: UpsertSubscriptionInput
): Promise<BillingSubscription> {
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("subscriptions")
    .upsert(
      {
        id: input.id,
        user_id: input.userId,
        stripe_price_id: input.stripePriceId,
        plan_name: input.planName,
        status: input.status,
        current_period_start: input.currentPeriodStart,
        current_period_end: input.currentPeriodEnd,
        cancel_at_period_end: input.cancelAtPeriodEnd,
      },
      { onConflict: "id" }
    )
    .select(
      "id, user_id, stripe_price_id, plan_name, status, current_period_start, current_period_end, cancel_at_period_end, created_at, updated_at"
    )
    .single();

  if (error) throw new Error(error.message);

  return mapSubscriptionRow(data as SubscriptionRow);
}

export async function markSubscriptionCanceled(
  subscriptionId: string
): Promise<void> {
  const supabase = createSupabaseAdmin();

  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "canceled" satisfies SubscriptionStatus, cancel_at_period_end: false })
    .eq("id", subscriptionId);

  if (error) throw new Error(error.message);
}

export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: SubscriptionStatus
): Promise<void> {
  const supabase = createSupabaseAdmin();

  const { error } = await supabase
    .from("subscriptions")
    .update({ status })
    .eq("id", subscriptionId);

  if (error) throw new Error(error.message);
}
