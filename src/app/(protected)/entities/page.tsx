"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import {
  entitiesService,
  type Entity,
  type EntityStatus,
} from "@/modules/entities";
import { CrudPageHeader } from "@/components/crud-page-header";
import {
  CrudList,
  type CrudColumn,
  type CrudRowAction,
} from "@/components/crud-list";
import { toast } from "@/hooks/use-toast";

type FormData = {
  name: string;
  description: string;
  status: EntityStatus;
};

const initialForm: FormData = {
  name: "",
  description: "",
  status: "active",
};

export default function EntitiesPage() {
  const [items, setItems] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(initialForm);

  const [entityToDelete, setEntityToDelete] = useState<Entity | null>(null);

  async function loadEntities() {
    try {
      setLoading(true);
      setError(null);
      const data = await entitiesService.getAll({ status: "all" });
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar entities.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEntities();
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
  }

  function clearError() {
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const description = form.description.trim();

    if (!name) {
      setError("El nombre es obligatorio.");
      return;
    }

    try {
      setSaving(true);
      clearError();

      if (editingId) {
        await entitiesService.update(editingId, {
          name,
          description: description || undefined,
          status: form.status,
        });

        toast.success(`Entity "${name}" actualizada correctamente.`);
      } else {
        await entitiesService.create({
          name,
          description: description || undefined,
          status: form.status,
        });

        toast.success(`Entity "${name}" creada correctamente.`);
      }

      resetForm();
      await loadEntities();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al guardar entity.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  function requestDelete(item: Entity) {
    clearError();
    setEntityToDelete(item);
  }

  function cancelDelete() {
    setEntityToDelete(null);
  }

  async function confirmDelete() {
    if (!entityToDelete) return;

    try {
      setDeletingId(entityToDelete.id);
      clearError();

      await entitiesService.remove(entityToDelete.id);

      if (editingId === entityToDelete.id) {
        resetForm();
      }

      toast.success(`Entity "${entityToDelete.name}" eliminada correctamente.`);

      setEntityToDelete(null);
      await loadEntities();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al eliminar entity.";
      setError(message);
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  }

  function handleEdit(item: Entity) {
    clearError();
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description ?? "",
      status: item.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const columns: CrudColumn<Entity>[] = [
    {
      key: "name",
      header: "Nombre",
      render: (item) => item.name,
    },
    {
      key: "description",
      header: "Descripción",
      render: (item) => item.description || "—",
    },
    {
      key: "status",
      header: "Estado",
      render: (item) => (item.status === "active" ? "Activo" : "Inactivo"),
    },
  ];

  const actions: CrudRowAction<Entity>[] = [
    {
      key: "edit",
      label: "Editar",
      variant: "outline",
      onClick: handleEdit,
    },
    {
      key: "delete",
      label: deletingId ? "Eliminando..." : "Eliminar",
      variant: "destructive",
      onClick: requestDelete,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <CrudPageHeader
        title="Entities"
        description="Gestión base de entidades reutilizables del template."
      />

      <div className="flex justify-end">
        <Link
          href="/entities/search"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Ir a búsqueda
        </Link>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {entityToDelete ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-destructive">
                Confirmar eliminación
              </p>
              <p className="text-sm text-foreground">
                ¿Eliminar <span className="font-medium">"{entityToDelete.name}"</span>?
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deletingId === entityToDelete.id}
                className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90 disabled:opacity-50"
              >
                {deletingId === entityToDelete.id ? "Eliminando..." : "Aceptar"}
              </button>

              <button
                type="button"
                onClick={cancelDelete}
                disabled={deletingId === entityToDelete.id}
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            {editingId ? "Editar entity" : "Nueva entity"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {editingId
              ? "Modificá nombre, descripción y estado."
              : "Creá una nueva entity reusable."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nombre
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className="rounded-md border border-border bg-background px-3 py-2"
              placeholder="Nombre de la entity"
              disabled={saving}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Descripción
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              className="min-h-24 rounded-md border border-border bg-background px-3 py-2"
              placeholder="Descripción opcional"
              disabled={saving}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="status" className="text-sm font-medium">
              Estado
            </label>
            <select
              id="status"
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value as EntityStatus,
                }))
              }
              className="rounded-md border border-border bg-background px-3 py-2"
              disabled={saving}
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear"}
            </button>

            <button
              type="button"
              onClick={() => {
                clearError();
                resetForm();
              }}
              disabled={saving}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <CrudList
        items={items}
        columns={columns}
        actions={actions}
        loading={loading}
        emptyMessage="No se encontraron entities."
        rowKey={(item) => item.id}
      />
    </div>
  );
}