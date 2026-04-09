// Private server-side helpers for the /api/entities Route Handlers.
// This file is intentionally prefixed with _ so Next.js does not treat it as a route.
// Never import this from browser/client code — it uses Supabase server internals.

import { Entity, EntityStatus } from "@/modules/entities/types";

export type EntityRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: EntityStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export const ENTITY_SELECT =
  "id, user_id, name, description, status, created_at, updated_at, deleted_at" as const;

export function mapEntityRow(row: EntityRow): Entity {
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
