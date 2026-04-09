"use client";

import { useState } from "react";
import { CrudPageHeader } from "@/components/crud-page-header";
import { useEntities } from "@/modules/entities/hooks/useEntities";
import { EntityFilters } from "@/modules/entities/components/EntityFilters";
import { EntityTable } from "@/modules/entities/components/EntityTable";
import type { EntityStatus } from "@/modules/entities/types";

export default function EntitiesSearchPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | EntityStatus>("all");

  // useEntities extracts primitives internally — passing an inline object is safe.
  const { data, loading, error } = useEntities({ search, status });

  return (
    <div className="flex flex-col gap-6">
      <CrudPageHeader title="Buscar entities" />

      <EntityFilters
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
      />

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <EntityTable items={data} loading={loading} />
    </div>
  );
}
