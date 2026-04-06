import { useState } from "react";
import { entitiesService } from "../service";

interface UseEntityDeleteOptions {
  onSuccess?: () => void;
}

interface UseEntityDeleteReturn {
  loading: boolean;
  error: string | null;
  remove: (id: string) => Promise<void>;
}

export function useEntityDelete(
  options: UseEntityDeleteOptions = {}
): UseEntityDeleteReturn {
  const { onSuccess } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove(id: string) {
    setLoading(true);
    setError(null);

    try {
      await entitiesService.remove(id);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar el registro");
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    remove,
  };
}
