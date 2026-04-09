"use client";

import { useState } from "react";
import { CrudPageHeader } from "@/components/crud-page-header";
import { useEntities } from "@/modules/entities/hooks/useEntities";
import { useEntityForm } from "@/modules/entities/hooks/useEntityForm";
import { useEntityDelete } from "@/modules/entities/hooks/useEntityDelete";
import { EntityForm } from "@/modules/entities/components/EntityForm";
import { EntityTable } from "@/modules/entities/components/EntityTable";
import { EntityDeleteConfirm } from "@/modules/entities/components/EntityDeleteConfirm";
import type { Entity } from "@/modules/entities/types";

export default function EntitiesPage() {
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [deletingEntity, setDeletingEntity] = useState<Entity | null>(null);

  const { data, loading: listLoading, error: listError, refetch } = useEntities({
    status: "all",
  });

  const form = useEntityForm({
    initialValues: editingEntity ?? undefined,
    onSuccess: () => {
      setEditingEntity(null);
      refetch();
    },
  });

  const deleteOp = useEntityDelete({
    onSuccess: () => {
      // If the deleted entity was open in the form, clear the editing state too
      if (editingEntity?.id === deletingEntity?.id) setEditingEntity(null);
      setDeletingEntity(null);
      refetch();
    },
  });

  function handleEdit(entity: Entity) {
    // useEntityForm's internal useEffect handles resetting form values on entityId change
    setEditingEntity(entity);
  }

  function handleCancelForm() {
    setEditingEntity(null);
    form.reset();
  }

  return (
    <div className="flex flex-col gap-6">
      <CrudPageHeader title="Entities" />

      <EntityForm
        values={form.values}
        loading={form.loading}
        error={form.error}
        validationError={form.validationError}
        isEditing={form.isEditing}
        setField={form.setField}
        onSubmit={form.submit}
        onCancel={handleCancelForm}
      />

      {listError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {listError}
        </div>
      )}

      <EntityTable
        items={data}
        loading={listLoading}
        onEdit={handleEdit}
        onDelete={setDeletingEntity}
      />

      <EntityDeleteConfirm
        open={!!deletingEntity}
        nombre={deletingEntity?.name}
        loading={deleteOp.loading}
        error={deleteOp.error}
        onClose={() => setDeletingEntity(null)}
        onConfirm={() => deletingEntity && deleteOp.remove(deletingEntity.id)}
      />
    </div>
  );
}
