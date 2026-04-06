"use client";

import { useEffect, useMemo, useState } from "react";
import {
  entitiesService,
  type Entity,
  type EntityFilters,
  type EntityStatus,
} from "@/modules/entities";
import { CrudPageHeader } from "@/components/crud-page-header";
import {
  CrudList,
  type CrudColumn,
} from "@/components/crud-list";

export default function EntitiesSearchPage() {
  const [items, setItems] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | EntityStatus>("all");

  const filters: EntityFilters = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: statusFilter,
    }),
    [search, statusFilter]
  );

  async function loadEntities(currentFilters: EntityFilters) {
    try {
      setLoading(true);
      setError(null);
      const data = await entitiesService.getAll(currentFilters);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar entities.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEntities(filters);
  }, [filters]);

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

  return (
    <div className="flex flex-col gap-6">
      <CrudPageHeader
        title="Buscar entities"
        description="Consulta y filtrado de entidades del template."
      />

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="search" className="text-sm font-medium">
              Buscar por nombre
            </label>
            <input
              id="search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Escribí un nombre..."
              className="rounded-md border border-border bg-background px-3 py-2"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="statusFilter" className="text-sm font-medium">
              Filtrar por estado
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as "all" | EntityStatus)
              }
              className="rounded-md border border-border bg-background px-3 py-2"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <CrudList
        items={items}
        columns={columns}
        loading={loading}
        emptyMessage="No se encontraron entities."
        rowKey={(item) => item.id}
      />
    </div>
  );
}