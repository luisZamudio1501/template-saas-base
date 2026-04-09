-- =============================================================================
-- Migration: 0002_billing.sql
-- Description: Billing schema — customers and subscriptions for Stripe integration.
--              customers: one row per user, maps auth.users to a Stripe customer ID.
--              subscriptions: active subscription per user, kept in sync via webhook.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Table: public.customers
-- Stores the mapping between an internal user and their Stripe customer ID.
-- Created once per user when they initiate checkout for the first time.
-- ---------------------------------------------------------------------------
create table public.customers (
  user_id    uuid  primary key references auth.users(id) on delete cascade,
  stripe_id  text  not null unique,
  created_at timestamptz not null default now()
);

-- RLS: users can read their own customer row; writes are server-side only (service role)
alter table public.customers enable row level security;

create policy "customers_select_own"
  on public.customers
  for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Table: public.subscriptions
-- Mirrors the relevant Stripe subscription state for fast server-side reads.
-- Kept in sync by the webhook handler — never written directly by the user.
-- ---------------------------------------------------------------------------
create table public.subscriptions (
  id                    text        primary key,
  user_id               uuid        not null references auth.users(id) on delete cascade,
  stripe_price_id       text        not null,
  plan_name             text        not null,
  status                text        not null,
  current_period_start  timestamptz not null,
  current_period_end    timestamptz not null,
  cancel_at_period_end  boolean     not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- RLS: users can read their own subscription; writes are server-side only (service role)
alter table public.subscriptions enable row level security;

create policy "subscriptions_select_own"
  on public.subscriptions
  for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Trigger: keep updated_at current on every UPDATE (reuses shared function)
-- ---------------------------------------------------------------------------
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row
  execute function public.handle_updated_at();
