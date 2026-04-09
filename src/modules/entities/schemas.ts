import { z } from "zod";

// ---------------------------------------------------------------------------
// Form schema — client side, used by React hooks.
// description defaults to "" so controlled inputs start with an empty string.
// ---------------------------------------------------------------------------
export const entityFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  description: z.string().default(""),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type EntityFormValues = z.infer<typeof entityFormSchema>;

// ---------------------------------------------------------------------------
// API schemas — server side, used by Route Handlers.
//
// These are the single source of truth for what the API accepts.
// trim() is applied here as the final line of defense at the API boundary.
// description accepts null so the client can explicitly clear the field.
// ---------------------------------------------------------------------------
export const createEntitySchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio."),
  description: z.string().trim().nullable().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type CreateEntityBody = z.infer<typeof createEntitySchema>;

export const updateEntitySchema = z.object({
  name: z.string().trim().min(1, "El nombre no puede estar vacío.").optional(),
  description: z.string().trim().nullable().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type UpdateEntityBody = z.infer<typeof updateEntitySchema>;
