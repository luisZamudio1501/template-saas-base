"use client";

import { Input } from "@/components/ui/input";
import { type EntityStatus } from "../types";

interface EntityFiltersProps {
  search: string;
  status: "all" | EntityStatus;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "all" | EntityStatus) => void;
}

export function EntityFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: EntityFiltersProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Buscar por nombre</label>
          <Input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Escribí un nombre..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Filtrar por estado</label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as "all" | EntityStatus)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>
    </div>
  );
}
