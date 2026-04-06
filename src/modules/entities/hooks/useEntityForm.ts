import { useEffect, useState } from "react";
import { entitiesService } from "../service";
import { Entity } from "../types";
import { toast } from "@/hooks/use-toast";

export interface EntityFormValues {
  name: string;
  description: string;
}

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

const EMPTY_VALUES: EntityFormValues = { name: "", description: "" };

function toFormValues(entity?: Entity): EntityFormValues {
  return {
    name: entity?.name ?? "",
    description: entity?.description ?? "",
  };
}

export function useEntityForm(options: UseEntityFormOptions): UseEntityFormReturn {
  const { initialValues, onSuccess } = options;

  const isEditing = !!initialValues;

  const [values, setValues] = useState<EntityFormValues>(() => toFormValues(initialValues));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setValues(toFormValues(initialValues));
    setError(null);
    setValidationError(null);
  }, [initialValues?.id ?? null]); // eslint-disable-line react-hooks/exhaustive-deps

  function setField<K extends keyof EntityFormValues>(key: K, value: EntityFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (key === "name") setValidationError(null);
  }

  function reset() {
    setValues(isEditing ? toFormValues(initialValues) : EMPTY_VALUES);
    setError(null);
    setValidationError(null);
  }

  async function submit() {
    if (!values.name.trim()) {
      setValidationError("Name is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result: Entity;

      if (isEditing && initialValues) {
        result = await entitiesService.update(initialValues.id, {
          name: values.name.trim(),
          description: values.description.trim() || null,
        });
      } else {
        result = await entitiesService.create({
          name: values.name.trim(),
          description: values.description.trim() || null,
        });
        setValues(EMPTY_VALUES);
      }

      toast.success(isEditing ? "Entidad actualizada correctamente." : "Entidad creada correctamente.");
      onSuccess?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving entity");
    } finally {
      setLoading(false);
    }
  }

  return {
    values,
    loading,
    error,
    validationError,
    isEditing,
    setField,
    submit,
    reset,
  };
}
