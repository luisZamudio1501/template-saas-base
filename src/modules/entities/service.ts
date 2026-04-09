// Client-side service for the entities module.
// All Supabase access happens server-side via Route Handlers.
// This service only talks to /api/entities over HTTP — zero DB coupling in the browser.

import {
  Entity,
  CreateEntityInput,
  UpdateEntityInput,
  EntityFilters,
} from "./types";

// Internal error class that preserves the HTTP status so callers
// can distinguish 404 (not found) from 5xx (unexpected failure).
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

  // 204 No Content (used by DELETE) — return undefined, not JSON
  if (response.status === 204) return undefined as T;

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      body.error ?? `Error ${response.status}`
    );
  }

  return response.json() as Promise<T>;
}

export const entitiesService = {
  async getAll(filters?: EntityFilters): Promise<Entity[]> {
    const params = new URLSearchParams();

    const search = filters?.search?.trim();
    if (search) params.set("search", search);

    // "all" means no status filter — only forward concrete values
    if (filters?.status && filters.status !== "all") {
      params.set("status", filters.status);
    }

    const qs = params.toString();
    return apiFetch<Entity[]>(`/api/entities${qs ? `?${qs}` : ""}`);
  },

  async getById(id: string): Promise<Entity | null> {
    try {
      return await apiFetch<Entity>(`/api/entities/${id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },

  async create(input: CreateEntityInput): Promise<Entity> {
    return apiFetch<Entity>("/api/entities", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async update(id: string, input: UpdateEntityInput): Promise<Entity> {
    return apiFetch<Entity>(`/api/entities/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  async remove(id: string): Promise<void> {
    await apiFetch<void>(`/api/entities/${id}`, {
      method: "DELETE",
    });
  },
};
