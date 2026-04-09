import { useEffect, useState } from "react";
import { z } from "zod";
import { entitiesService } from "../service";
import { Entity } from "../types";
import { toast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Schema — single source of truth for form shape and validation messages.
// Shared by the hook (validation) and the form component (field types).
// ---------------------------------------------------------------------------
export const entityFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  description: z.string().default(""),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type EntityFormValues = z.infer<typeof entityFormSchema>;

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------
const EMPTY_VALUES: EntityFormValues = { name: "", description: "", status: "active" };

function toFormValues(entity?: Entity): EntityFormValues {
  return {
    name: entity?.name ?? "",
    description: entity?.description ?? "",
    status: entity?.status ?? "active",
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
interface UseEntityFormOptions {
  initialValues?: Entity;
  onSuccess?: (entity: Entity) => void;
}

interface UseEntityFormReturn {
  values: EntityFormValues;
  loading: boolean;
  error: string | null;
  validationError: string | null;
  isEditing: boolean;
  setField: <K extends keyof EntityFormValues>(key: K, value: EntityFormValues[K]) => void;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useEntityForm(options: UseEntityFormOptions): UseEntityFormReturn {
  const { initialValues, onSuccess } = options;

  const isEditing = !!initialValues;

  const [values, setValues] = useState<EntityFormValues>(() => toFormValues(initialValues));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Re-populate the form when the target entity changes (identified by ID).
  // We intentionally depend on the ID only — changes to individual fields while
  // editing should not reset the form mid-edit.
  const entityId = initialValues?.id;
  useEffect(() => {
    setValues(toFormValues(initialValues));
    setError(null);
    setValidationError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId]);

  function setField<K extends keyof EntityFormValues>(key: K, value: EntityFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (key === "name") setValidationError(null);
  }

  function reset() {
    setValues(EMPTY_VALUES);
    setError(null);
    setValidationError(null);
  }

  async function submit() {
    const parsed = entityFormSchema.safeParse(values);

    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setValidationError(first?.message ?? "Error de validación.");
      return;
    }

    const { name, description, status } = parsed.data;

    setLoading(true);
    setError(null);

    try {
      let saved: Entity;

      if (isEditing && initialValues) {
        saved = await entitiesService.update(initialValues.id, {
          name,
          description: description || null,
          status,
        });
      } else {
        saved = await entitiesService.create({
          name,
          description: description || null,
          status,
        });
        setValues(EMPTY_VALUES);
      }

      toast.success(
        isEditing ? "Entidad actualizada correctamente." : "Entidad creada correctamente."
      );
      onSuccess?.(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la entidad.");
    } finally {
      setLoading(false);
    }
  }

  return { values, loading, error, validationError, isEditing, setField, submit, reset };
}
