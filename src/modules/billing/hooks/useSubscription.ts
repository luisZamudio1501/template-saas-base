"use client";

import { useState, useEffect } from "react";
import { billingService } from "../service";
import type { BillingSubscription } from "../types";

interface UseSubscriptionReturn {
  subscription: BillingSubscription | null;
  loading: boolean;
  error: string | null;
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<BillingSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    billingService
      .getCurrentSubscription()
      .then(setSubscription)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Error al cargar la suscripción."
        )
      )
      .finally(() => setLoading(false));
  }, []);

  return { subscription, loading, error };
}
