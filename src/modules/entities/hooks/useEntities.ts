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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await entitiesService.getAll(filters);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading entities");
    } finally {
      setLoading(false);
    }
  }, [filters?.search]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refetch: load };
}
