"use client";

import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/form-field";
import { type EntityFormValues } from "../hooks/useEntityForm";

interface EntityFormProps {
  values: EntityFormValues;
  loading: boolean;
  error: string | null;
  validationError: string | null;
  isEditing: boolean;
  setField: <K extends keyof EntityFormValues>(key: K, value: EntityFormValues[K]) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
}

export function EntityForm({
  values,
  loading,
  error,
  validationError,
  isEditing,
  setField,
  onSubmit,
  onCancel,
}: EntityFormProps) {
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await onSubmit();
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">
          {isEditing ? "Editar entidad" : "Nueva entidad"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isEditing
            ? "Modificá nombre, descripción y estado."
            : "Completá los campos para crear una entidad."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4">
        <FormField label="Nombre" required error={validationError}>
          <Input
            type="text"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="Nombre de la entidad"
            disabled={loading}
          />
        </FormField>

        <FormField label="Descripción">
          <textarea
            value={values.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Descripción opcional"
            disabled={loading}
            rows={3}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
          />
        </FormField>

        <FormField label="Estado">
          <select
            value={values.status}
            onChange={(e) =>
              setField("status", e.target.value as EntityFormValues["status"])
            }
            disabled={loading}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </select>
        </FormField>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center gap-2 pt-1">
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
