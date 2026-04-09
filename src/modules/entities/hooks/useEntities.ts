import { useState, useEffect, useCallback } from "react";
import { entitiesService } from "../service";
import { Entity, EntityFilters } from "../types";

interface UseEntitiesReturn {
  data: Entity[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useEntities(filters?: EntityFilters): UseEntitiesReturn {
  const [data, setData] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract primitives so useCallback compares by value, not by object reference.
  // This makes it safe to pass { search, status } as a literal from the parent
  // without causing infinite re-render loops.
  const search = filters?.search;
  const status = filters?.status;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await entitiesService.getAll({ search, status });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los registros.");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
