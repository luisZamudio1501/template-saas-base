-- =============================================================================
-- Migration: 0001_init.sql
-- Description: Initial schema for template-saas-base
--              Entities table with RLS, soft delete, and auto-updated_at
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Utility: trigger function for auto-updating updated_at on every row change
-- ---------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Table: public.entities
-- Base CRUD resource used as the reusable pattern for all SaaS modules.
-- Every row is owned by a single authenticated user (user_id).
-- Soft deletes via deleted_at — hard deletes are never used.
-- ---------------------------------------------------------------------------
create table public.entities (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  name        text        not null,
  description text        null,
  status      text        not null default 'active'
                          check (status in ('active', 'inactive')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz null
);

-- ---------------------------------------------------------------------------
-- Security: Row Level Security
-- The anon/service key is public. RLS ensures each user only touches
-- their own rows. Without these policies the table is fully open.
-- ---------------------------------------------------------------------------
alter table public.entities enable row level security;

-- SELECT: a user can only read rows they own
create policy "entities_select_own"
  on public.entities
  for select
  using (auth.uid() = user_id);

-- INSERT: a user can only insert rows where user_id matches their auth uid
create policy "entities_insert_own"
  on public.entities
  for insert
  with check (auth.uid() = user_id);

-- UPDATE: a user can only update rows they own (both old and new row must match)
create policy "entities_update_own"
  on public.entities
  for update
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DELETE: a user can only delete rows they own
-- Note: the service layer uses soft delete (deleted_at). This policy exists
-- as a safety net in case a hard delete is issued directly against the DB.
create policy "entities_delete_own"
  on public.entities
  for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Trigger: keep updated_at current on every UPDATE
-- ---------------------------------------------------------------------------
create trigger entities_set_updated_at
  before update on public.entities
  for each row
  execute function public.handle_updated_at();
