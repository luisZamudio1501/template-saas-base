"use client";

import Link from "next/link";
import { useState } from "react";
import { useSubscription } from "@/modules/billing/hooks/useSubscription";
import { billingService } from "@/modules/billing/service";
import type { SubscriptionStatus } from "@/modules/billing/types";

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: "Activa",
  canceled: "Cancelada",
  incomplete: "Incompleta",
  incomplete_expired: "Expirada",
  past_due: "Pago pendiente",
  trialing: "En prueba",
  unpaid: "Sin pagar",
  paused: "Pausada",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BillingPage() {
  const { subscription, loading, error } = useSubscription();
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  async function handleOpenPortal() {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const { url } = await billingService.createPortalSession();
      if (url) window.location.href = url;
    } catch (err) {
      setPortalError(
        err instanceof Error ? err.message : "Error al abrir el portal."
      );
      setPortalLoading(false);
    }
  }

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-semibold">Billing</h1>

      {/* Subscription card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-base font-semibold">Suscripción actual</h2>

        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : !subscription ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              No tienes una suscripción activa.
            </p>
            <Link
              href="/pricing"
              className="inline-block self-start rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              Ver planes disponibles
            </Link>
          </div>
        ) : (
          <dl className="flex flex-col gap-4">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Plan
              </dt>
              <dd className="mt-0.5 text-sm font-medium">
                {subscription.planName}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Estado
              </dt>
              <dd className="mt-0.5 text-sm font-medium">
                {STATUS_LABELS[subscription.status] ?? subscription.status}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Próxima renovación
              </dt>
              <dd className="mt-0.5 text-sm font-medium">
                {formatDate(subscription.currentPeriodEnd)}
              </dd>
            </div>

            {subscription.cancelAtPeriodEnd && (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
                Tu suscripción se cancelará al final del período actual.
              </p>
            )}
          </dl>
        )}
      </div>

      {/* Portal / upgrade card */}
      {!loading && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-1 text-base font-semibold">Gestionar suscripción</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            {subscription
              ? "Cambia de plan, actualiza tu método de pago o cancela tu suscripción."
              : "Elige un plan para acceder a todas las funcionalidades."}
          </p>

          {portalError && (
            <p className="mb-3 text-sm text-destructive">{portalError}</p>
          )}

          {subscription ? (
            <button
              onClick={handleOpenPortal}
              disabled={portalLoading}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
            >
              {portalLoading ? "Abriendo portal..." : "Abrir portal de cliente"}
            </button>
          ) : (
            <Link
              href="/pricing"
              className="inline-block rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-80"
            >
              Ver planes y suscribirse
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
