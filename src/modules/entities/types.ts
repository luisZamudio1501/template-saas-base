export type EntityStatus = "active" | "inactive";

export interface Entity {
  id: string;
  name: string;
  description: string | null;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateEntityInput {
  name: string;
  description?: string;
  status?: EntityStatus;
}

export interface UpdateEntityInput {
  name?: string;
  description?: string;
  status?: EntityStatus;
}

export interface EntityFilters {
  search?: string;
  status?: "all" | EntityStatus;
}