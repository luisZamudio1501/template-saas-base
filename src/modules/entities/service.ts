import { supabase } from "@/lib/supabase";
import {
  Entity,
  CreateEntityInput,
  UpdateEntityInput,
  EntityFilters,
  EntityStatus,
} from "./types";

type EntityRow = {
  id: string;
  name: string;
  description: string | null;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

function mapRow(row: EntityRow): Entity {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

async function validateUniqueName(name: string, excludeId?: string): Promise<void> {
  const normalizedName = name.trim();

  let query = supabase
    .from("entities")
    .select("id, name")
    .ilike("name", normalizedName)
    .is("deleted_at", null)
    .limit(1);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  if (data && data.length > 0) {
    throw new Error("Ya existe una entity con ese nombre.");
  }
}

export const entitiesService = {
  async getAll(filters?: EntityFilters): Promise<Entity[]> {
    let query = supabase
      .from("entities")
      .select("id, name, description, status, created_at, updated_at, deleted_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    const search = filters?.search?.trim();
    const status = filters?.status;

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(mapRow);
  },

  async getById(id: string): Promise<Entity | null> {
    const { data, error } = await supabase
      .from("entities")
      .select("id, name, description, status, created_at, updated_at, deleted_at")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(error.message);
    }

    return mapRow(data as EntityRow);
  },

  async create(input: CreateEntityInput): Promise<Entity> {
    const name = input.name.trim();

    await validateUniqueName(name);

    const { data, error } = await supabase
      .from("entities")
      .insert({
        name,
        description: input.description?.trim() || null,
        status: input.status ?? "active",
      })
      .select("id, name, description, status, created_at, updated_at, deleted_at")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapRow(data as EntityRow);
  },

  async update(id: string, input: UpdateEntityInput): Promise<Entity> {
    const payload: Record<string, unknown> = {};

    if (input.name !== undefined) {
      const name = input.name.trim();
      await validateUniqueName(name, id);
      payload.name = name;
    }

    if (input.description !== undefined) {
      payload.description = input.description.trim() || null;
    }

    if (input.status !== undefined) {
      payload.status = input.status;
    }

    const { data, error } = await supabase
      .from("entities")
      .update(payload)
      .eq("id", id)
      .is("deleted_at", null)
      .select("id, name, description, status, created_at, updated_at, deleted_at")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapRow(data as EntityRow);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from("entities")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null);

    if (error) {
      throw new Error(error.message);
    }
  },
};