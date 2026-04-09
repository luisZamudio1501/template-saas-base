// Data access layer for the entities module.
// This is the only file that knows about Supabase queries for entities.
// Never import this from client/browser code.

import { createSupabaseServer } from "@/lib/supabase/server";
import {
  Entity,
  EntityStatus,
  CreateEntityInput,
  UpdateEntityInput,
  EntityFilters,
} from "./types";

// ─── Internal row type (DB shape) ────────────────────────────────────────────

type EntityRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

const ENTITY_SELECT =
  "id, user_id, name, description, status, created_at, updated_at, deleted_at" as const;

function mapRow(row: EntityRow): Entity {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

// ─── Repository functions ─────────────────────────────────────────────────────

export async function findAllByUser(
  userId: string,
  filters?: Pick<EntityFilters, "search" | "status">
): Promise<Entity[]> {
  const supabase = await createSupabaseServer();

  let query = supabase
    .from("entities")
    .select(ENTITY_SELECT)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filters?.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }

  // "all" is never forwarded by the client service; any value here is a concrete filter.
  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return (data as EntityRow[]).map(mapRow);
}

export async function findByIdForUser(
  id: string,
  userId: string
): Promise<Entity | null> {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("entities")
    .select(ENTITY_SELECT)
    .eq("id", id)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return mapRow(data as EntityRow);
}

/** Returns true if another active entity with the same name exists for the user. */
export async function findByNameForUser(
  name: string,
  userId: string,
  excludeId?: string
): Promise<boolean> {
  const supabase = await createSupabaseServer();

  let query = supabase
    .from("entities")
    .select("id")
    .eq("user_id", userId)
    .ilike("name", name)
    .is("deleted_at", null)
    .limit(1);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return (data ?? []).length > 0;
}

export async function createForUser(
  userId: string,
  input: CreateEntityInput
): Promise<Entity> {
  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("entities")
    .insert({
      user_id: userId,
      name: input.name,
      description: input.description ?? null,
      status: input.status ?? "active",
    })
    .select(ENTITY_SELECT)
    .single();

  if (error) throw new Error(error.message);

  return mapRow(data as EntityRow);
}

export async function updateForUser(
  id: string,
  userId: string,
  input: UpdateEntityInput
): Promise<Entity | null> {
  const supabase = await createSupabaseServer();

  const payload: Record<string, unknown> = {};

  if (input.name !== undefined) {
    payload.name = input.name;
  }
  if (input.description !== undefined) {
    // Normalize empty string to null at the persistence boundary.
    payload.description = input.description || null;
  }
  if (input.status !== undefined) {
    payload.status = input.status;
  }

  const { data, error } = await supabase
    .from("entities")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .select(ENTITY_SELECT)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(error.message);
  }

  return mapRow(data as EntityRow);
}

export async function softDeleteForUser(
  id: string,
  userId: string
): Promise<void> {
  const supabase = await createSupabaseServer();

  const { error } = await supabase
    .from("entities")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .is("deleted_at", null);

  if (error) throw new Error(error.message);
}
