"use client";

import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/form-field";
import { EntityFormValues } from "../hooks/useEntityForm";

interface EntityFormProps {
  values: EntityFormValues;
  loading: boolean;
  error: string | null;
  validationError: string | null;
  setField: <K extends keyof EntityFormValues>(key: K, value: EntityFormValues[K]) => void;
  onSubmit: () => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function EntityForm({
  values,
  loading,
  error,
  validationError,
  setField,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: EntityFormProps) {
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 flex max-w-[480px] flex-col gap-3">
      <FormField label="Name" required error={validationError}>
        <Input
          type="text"
          value={values.name}
          onChange={(e) => setField("name", e.target.value)}
          disabled={loading}
        />
      </FormField>

      <FormField label="Description">
        <Input
          type="text"
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
          disabled={loading}
        />
      </FormField>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
